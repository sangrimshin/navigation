import { NavigationRequest } from '../domain/NavigationRequest';
import { NavigationManager } from './NavigationManager';
import { ILocation } from '../domain/ILocation';
import { INodeDataModel } from '../domain/INodeDataModel';
import { INodeEdgesModel } from '../domain/INodeEdgesModel';
import { NavigationResponse } from '../domain/NavigationResponse';
import { Constants } from '../Constants';
import { IFloorDataModel } from '../domain/IFloorDataModel';
import { IPosition } from '../domain/IPosition';
import { VectorUtils } from './VectorUtils';
import { ComputingType } from '../domain/ComputingType';

let dijkstra = require('dijkstrajs');

export class DijkstraNavigationManager extends NavigationManager {
    graph: any;

    constructor(request: NavigationRequest) {
        super(request);
        this.graph = this._buildNodeGraph(request.computingType);
    }

    /**
     * 길찾기 경로 탐색
     * @param origin 출발지
     * @param destination 목적지
     * @private
     */
    private _getPath(origin: string, destination: string): NavigationResponse {
        const nodeIds = new dijkstra.find_path(this.graph, origin, destination);
        let locations: ILocation[] = this._convertRouteToLocations(nodeIds);
        locations.forEach((location, idx) => {
            if (location.transCode && location.floorId && location.floorId !== locations[idx + 1].floorId) {
                locations[idx + 1].distance = 0;
            }
        });

        return new NavigationResponse(locations);
    }

    /**
     * 입력된 위치에서 가장 최적화된 노드를 리턴
     * @param location 관심사 위치값
     * @private 입력된 위치의 오브젝트와 연결된 노드 혹, 오브젝트와 관련 없는 위치라면 가장 가까운 노드를 검색해서 리턴 함
     * 오브젝트와 노드는 1:N 관계이므로 노드 배열을 리턴 함
     */
    private _getOptimalNode(location: ILocation): INodeDataModel[] | null {
        const floorData: IFloorDataModel = this._request.mapInfo.floors.filter((floor) => floor.id === location.floorId)[0];
        let nodes: INodeDataModel[] | null = [];

        if (location.poiId) {
            const poi = this._floorDataManager._getPoiById(floorData, location.poiId);

            if (poi && poi.objectId) {
                nodes = this._floorDataManager._getNodesByObjectId(floorData, poi.objectId);
                if (nodes && nodes.length > 0) {
                    return nodes;
                }
            }

            // nodes = this._floorDataManager._getNodeByLocation(floorData, location);
        }

        return this._floorDataManager._getNodeByLocation(floorData, location);
    }

    /**
     * 경유해야하는 모든 곳을 토대로 내비게이션 경로정보를 조회 함
     * <strong>
     *     경로를 찾을 수 없을때에는 Error 를 throw 함.
     * </strong>
     * @param locations 내비게이션하고 싶은 모든 장소정보 배열
     */
    getPath(locations: ILocation[]): NavigationResponse {
        locations.forEach((location) => this._floorDataManager._syncLocationAndPoi(location));

        let scaleCm = super.getRequest().mapInfo.scaleCm;

        let optimalPath = this._getOptimalPath(locations);

        let result = new NavigationResponse([]);

        optimalPath.forEach((waypoint, idx) => {
            if (idx < locations.length - 1) {
                let origin = optimalPath[idx];
                let destination = optimalPath[idx + 1];
                let response = this._getPath(origin.nodeId, destination.nodeId);
                response.locations.forEach((resLocation, idx) => {
                    if (!resLocation.poiId) {
                        if (idx === 0) {
                            resLocation.poiId = origin.poiId;
                        }

                        if (idx === response.locations.length - 1) {
                            resLocation.poiId = destination.poiId;
                        }
                    }
                });

                result = this._mergeResponse(result, response);
            }
        });

        let pathInfo = super.simplify(result.locations);

        result.pathInfo = pathInfo.reduce((acc, cur: ILocation, i) => {
            if (cur.transCode === null) {
                acc.push(cur);
            } else {
                if (i > 0 && i < pathInfo.length - 1) {
                    let from = pathInfo[i - 1];
                    let to = pathInfo[i + 1];

                    const fromDistance = (VectorUtils._calcDistance(from.position!, cur.position!) * scaleCm) / 100; // 거리를 구해 m 단위로 환산
                    const toDistance = (VectorUtils._calcDistance(cur.position!, to.position!) * scaleCm) / 100; // 거리를 구해 m 단위로 환산

                    if (from.transCode === cur.transCode && to.transCode === cur.transCode) {
                        if (fromDistance > Constants.PATH_SIMPLIFY_DISTANCE || toDistance > Constants.PATH_SIMPLIFY_DISTANCE) {
                            acc.push(cur);
                        }
                    } else {
                        acc.push(cur);
                    }
                }
            }
            return acc;
        }, new Array<ILocation>());

        result.pathInfo.forEach((cur, i) => {
            if (i > 0) {
                if (result.pathInfo[i - 1].floorId !== cur.floorId) {
                    cur.transCode = null;
                }
            }
        });

        result.locations = result.locations.reduce((arr, cur, i) => {
            if (cur.transCode === null) {
                arr.push(cur);
            } else {
                if (i > 0 && i < result.locations.length - 1) {
                    if (result.locations[i - 1].transCode !== cur.transCode || result.locations[i + 1].transCode !== cur.transCode) {
                        arr.push(cur);
                    }
                }
            }

            return arr;
        }, new Array<ILocation>());

        result.locations.forEach((location) => {
            location.distance = location.distance * scaleCm;
        });

        // 노드와 POI 연결
        result.locations.forEach((location) => this._floorDataManager._setPoiRelatedObjectAndPOI(location));

        result.calculateTotalDistanceAndTime();

        return result;
    }

    /**
     * 입력된 위치를 기준으로 최적화된 노드를 찾아 최적화된 노드들 중 가장 짧은 경로를 Dijkstra 알고리즘을 통해 찾아 리턴 함
     * @param locations 관심사 위치 배열
     * @private
     */
    private _getOptimalPath(locations: ILocation[]): ILocation[] {
        let routes: ILocation[] = [];
        let origin = locations[0];

        for (let i = 0; i < locations.length - 1; i++) {
            if (i === 0) {
                origin = locations[i];
            }
            if (i < locations.length - 1) {
                let destination = locations[i + 1];

                let nodeArrayFromOrigin: INodeDataModel[] | null;
                let nodeArrayFromDestination: INodeDataModel[] | null;

                let nodes = super.getRequest().nodes;
                nodes = this._distinctNodeArray(nodes);

                // 출발지 위치에서 최적화된 노드 배열 추출 (오브젝트와 노드는 1:N 관계)
                nodeArrayFromOrigin = this._getOptimalNode(origin);

                // 목적지 위치에서 최적화된 노드 배열 추출
                nodeArrayFromDestination = this._getOptimalNode(destination);

                if (nodeArrayFromOrigin && nodeArrayFromDestination) {
                    let minDistanceResponse: NavigationResponse = new NavigationResponse([]);
                    nodeArrayFromOrigin!.forEach((fromOrigin) => {
                        nodeArrayFromDestination!.forEach((fromDestination) => {
                            let res = this._getPath(fromOrigin.id, fromDestination.id);
                            if (minDistanceResponse.totalDistance === 0 || res.totalDistance < minDistanceResponse.totalDistance) {
                                minDistanceResponse = res;
                            }
                        });
                    });

                    if (i === 0) {
                        minDistanceResponse.getOrigin().poiId = origin.poiId;
                        routes.push(minDistanceResponse.getOrigin());
                    }
                    minDistanceResponse.getFinalDestination().poiId = destination.poiId;
                    routes.push(minDistanceResponse.getFinalDestination());
                }
            }
        }
        return routes;
    }

    /**
     * 인자로 받은 노드들이 중복되어 존재 하는 케이스가 있음. 이 때, 노드 중복을 제거하는 함수
     * @param array 노드 배열 {@link INodeDataModel}
     * @private
     */
    private _distinctNodeArray(array: INodeDataModel[]): INodeDataModel[] {
        let result = new Array<INodeDataModel>();
        let map: { [index: string]: boolean } = {};

        for (const item of array) {
            if (!map[item.id]) {
                map[item.id] = true;
                result.push({
                    id: item.id,
                    title: item.title,
                    objectIds: item.objectIds,
                    position: item.position,
                    edges: item.edges,
                    linkedYn: item.linkedYn,
                    includedFloorId: item.includedFloorId,
                    transCode: item.transCode,
                });
            }
        }
        return result;
    }

    /**
     * 두 개의 Navigation response를 병합합 (이전 / 이후 순서 유지)
     * 이전응답 + 이후응답 = 새로운 병합된 응답
     * 2022.03.23 totalDistance / totalTime 계산은 별도로 뺌
     * @param beforeResponse
     * @param afterResponse
     * @private
     */
    private _mergeResponse(beforeResponse: NavigationResponse, afterResponse: NavigationResponse): NavigationResponse {
        let afterLocations = afterResponse.locations;
        if (beforeResponse.locations.length > 0 && beforeResponse.locations[beforeResponse.locations.length - 1].nodeId === afterResponse.locations[0].nodeId) {
            afterLocations = afterLocations.slice(1);
        }
        let locations = beforeResponse.locations.concat(afterLocations);
        locations.forEach((location, idx) => {
            location.idx = idx;
        });
        return new NavigationResponse(locations);
    }

    /**
     * dijkstra 알고리즘을 통해 얻은 경로에 대한 노드 아이디들을 ILocation 객체로 변환 함
     *
     * @param nodeIds 경로에 대한 노드 아이디들
     * @private
     */
    private _convertRouteToLocations(nodeIds: string[]): ILocation[] {
        let nodes = super.getNodeMap();

        let result = new Array<ILocation>();

        let nextNode: INodeDataModel | undefined = nodeIds ? nodes.get(nodeIds[0]) : undefined;
        let beforeNode: INodeDataModel | undefined = undefined;
        let nextFloorId = nextNode ? nextNode!.includedFloorId : '';

        for (let i = 0; i < nodeIds.length; i++) {
            let nodeId = nodeIds[i];
            let node = nodes.get(nodeId);

            if (i < nodeIds.length - 1) {
                nextNode = nodes.get(nodeIds[i + 1]);
                nextFloorId = nextNode!.includedFloorId;
            }

            let distance = 0;
            if (i > 0) {
                beforeNode = nodes.get(nodeIds[i - 1]);
                distance = this.graph[beforeNode!.id][node!.id];
            }

            if (node) {
                result.push({
                    position: node.position,
                    floorId: node.includedFloorId,
                    nodeId: node.id,
                    poiId: null,
                    isDestination: i === 0 || i === nodeIds.length - 1,
                    idx: i,
                    transCode: nextFloorId === node.includedFloorId && beforeNode?.transCode !== node.transCode ? null : node.transCode,
                    // , transCode: node.transCode
                    distance: distance,
                    direction: null,
                    angle: 0,
                });

                nextFloorId = node.includedFloorId;
            }
        }
        return result;
    }

    /**
     * @description 다익스트라 알고리즘 하기 위해 Graph 생성
     * @return {Object}
     * @private
     */
    _buildNodeGraph(computingType: ComputingType): any {
        let graph: any = {};

        let nodesByFloorId = super.getNodeData();

        for (let key in nodesByFloorId) {
            let nodes = nodesByFloorId[key];
            nodes.forEach((node: any) => {
                let isAvailablePath = this._checkTransTypePath(node, computingType);

                const graphData: any = {};
                node.edges.forEach(function (edge: INodeEdgesModel) {
                    if (isAvailablePath || (!isAvailablePath && !edge.linkedFloorId)) {
                        if (edge.distance > 0) {
                            graphData[edge.nodeId] = edge.distance;
                        }
                    } else {
                        // console.debug("except node", node);
                    }
                });
                graph[node.id] = graphData;
            });
        }

        return graph;
    }

    _isSafetyPath(node: INodeDataModel): boolean {
        // transcode 비어있거나 가 OB-ELEVATOR 일 때에만 안전경로
        return !node.transCode || node.transCode === Constants.TRANSCODE.ELEVATOR || node.transCode === Constants.TRANSCODE.OTHER;
    }

    _checkTransTypePath(node: INodeDataModel, computingType: ComputingType = ComputingType.RECOMMENDATION): boolean {
        if (computingType === ComputingType.SAFETY) {
            // 안전경로
            return this._isSafetyPath(node);
        } else if (computingType === ComputingType.ELEVATOR || node.transCode === Constants.TRANSCODE.OTHER) {
            // 엘리베이터
            return node.transCode === Constants.TRANSCODE.ELEVATOR || node.transCode === Constants.TRANSCODE.OTHER;
        } else if (computingType === ComputingType.ESCALATOR || node.transCode === Constants.TRANSCODE.OTHER) {
            // 에스컬레이터
            return (
                node.transCode === Constants.TRANSCODE.ESCALATOR ||
                node.transCode === Constants.TRANSCODE.ESCALATOR_UP ||
                node.transCode === Constants.TRANSCODE.ESCALATOR_DOWN ||
                node.transCode === Constants.TRANSCODE.OTHER
            );
        } else if (computingType === ComputingType.STAIRS || node.transCode === Constants.TRANSCODE.OTHER) {
            // 계단
            return node.transCode === Constants.TRANSCODE.STAIRS;
        } else {
            // 그 밖 (추천경로)
            return true;
        }
    }

    /**
     * 두 포지션간의 거리 계산
     * @param a
     * @param b
     */
    public _calcDistance(a: IPosition, b: IPosition): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
