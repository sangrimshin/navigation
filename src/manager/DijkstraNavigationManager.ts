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

const dijkstra = require('dijkstrajs');

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
        try {
            const nodeIds = new dijkstra.find_path(this.graph, origin, destination);
            const locations: ILocation[] = this._convertRouteToLocations(nodeIds);
            locations.forEach((location, idx) => {
                if (location.transCode && location.floorId && location.floorId !== locations[idx + 1].floorId) {
                    locations[idx + 1].distance = 0;
                }
            });

            return new NavigationResponse(locations);
        } catch (error) {
            console.log('경로를 찾지 못하였습니다.');
            return new NavigationResponse([]);
        }
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

        const scaleCm = super.getRequest().mapInfo.scaleCm;

        const optimalPath = this._getOptimalPath(locations);

        let navigationResponse: NavigationResponse = new NavigationResponse([]);

        try {
            optimalPath.forEach((waypoint, idx) => {
                if (idx < locations.length - 1) {
                    const origin = optimalPath[idx];
                    const destination = optimalPath[idx + 1];
                    const response: NavigationResponse = this._getPath(origin.nodeId, destination.nodeId);
                    response.getLocations().forEach((resLocation, myIdx) => {
                        if (!resLocation.poiId) {
                            if (myIdx === 0) {
                                resLocation.poiId = origin.poiId;
                            }

                            if (myIdx === response.getLocations().length - 1) {
                                resLocation.poiId = destination.poiId;
                            }
                        }
                    });

                    navigationResponse = this._mergeResponse(navigationResponse, response);
                }
            });
        } catch (error) {
            navigationResponse = new NavigationResponse([]);
        }

        let pathInfo = super.simplify(navigationResponse.getLocations());

        pathInfo = pathInfo.reduce((acc, cur: ILocation, i) => {
            if (cur.transCode === null) {
                acc.push(cur);
            } else if (i > 0 && i < pathInfo.length - 1) {
                const from = pathInfo[i - 1];
                const to = pathInfo[i + 1];

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
            return acc;
        }, new Array<ILocation>());

        pathInfo.forEach((cur, i) => {
            if (i < pathInfo.length - 1) {
                if (pathInfo[i + 1].floorId === cur.floorId) {
                    cur.transCode = null;
                }
            }
        });
        locations = navigationResponse.getLocations();

        locations = locations.reduce((arr, cur, i) => {
            if (cur.transCode === null) {
                arr.push(cur);
            } else if (i > 0 && i < locations.length - 1) {
                if (locations[i - 1].transCode !== cur.transCode || locations[i + 1].transCode !== cur.transCode) {
                    arr.push(cur);
                }
            }
            return arr;
        }, new Array<ILocation>());

        locations.forEach((location) => {
            location.distance *= scaleCm;
        });

        pathInfo.forEach((path) => {
            path.distance *= scaleCm;
        });

        navigationResponse.setPathInfo(pathInfo);
        navigationResponse.setLocations(locations);
        // 노드와 POI 연결
        locations.forEach((location) => this._floorDataManager._setPoiRelatedObjectAndPOI(location));

        navigationResponse.setCalculateTotalDistanceAndTime();

        return navigationResponse;
    }

    /**
     * 입력된 위치를 기준으로 최적화된 노드를 찾아 최적화된 노드들 중 가장 짧은 경로를 Dijkstra 알고리즘을 통해 찾아 리턴 함
     * @param locations 관심사 위치 배열
     * @private
     */
    private _getOptimalPath(locations: ILocation[]): ILocation[] {
        const routes: ILocation[] = [];
        let origin = locations[0];

        for (let i = 0; i < locations.length - 1; i++) {
            if (i === 0) {
                origin = locations[i];
            }
            if (i < locations.length - 1) {
                const destination = locations[i + 1];

                // 출발지 위치에서 최적화된 노드 배열 추출 (오브젝트와 노드는 1:N 관계)
                const nodeArrayFromOrigin: INodeDataModel[] | null = this._getOptimalNode(origin);

                // 목적지 위치에서 최적화된 노드 배열 추출
                const nodeArrayFromDestination: INodeDataModel[] | null = this._getOptimalNode(destination);

                let nodes = super.getRequest().nodes;
                nodes = this._distinctNodeArray(nodes);

                if (nodeArrayFromOrigin && nodeArrayFromDestination) {
                    let minDistanceResponse: NavigationResponse = new NavigationResponse([]);
                    nodeArrayFromOrigin!.forEach((fromOrigin) => {
                        nodeArrayFromDestination!.forEach((fromDestination) => {
                            const res: NavigationResponse = this._getPath(fromOrigin.id, fromDestination.id);
                            if (res.getLocations().length === 0) return;
                            if (minDistanceResponse.getTotalDistance() === 0 || res.getTotalDistance() < minDistanceResponse.getTotalDistance()) {
                                minDistanceResponse = res;
                            }
                        });
                    });

                    if (i === 0) {
                        const newOrigin = minDistanceResponse.getOrigin();
                        if (newOrigin) {
                            newOrigin.poiId = origin.poiId;
                            routes.push(newOrigin);
                        }
                    }
                    const newFinalDest = minDistanceResponse.getFinalDestination();
                    if (newFinalDest) {
                        newFinalDest.poiId = destination.poiId;
                        routes.push(newFinalDest);
                    }
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
        const result = new Array<INodeDataModel>();
        const map: { [index: string]: boolean } = {};

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
        let afterLocations = afterResponse.getLocations();
        if (
            beforeResponse.getLocations().length > 0 &&
            beforeResponse.getLocations()[beforeResponse.getLocations().length - 1].nodeId === afterResponse.getLocations()[0].nodeId
        ) {
            afterLocations = afterLocations.slice(1);
        }
        const locations = beforeResponse.getLocations().concat(afterLocations);
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
        const nodes = super.getNodeMap();

        const result = new Array<ILocation>();

        let nextNode: INodeDataModel | undefined = nodeIds ? nodes.get(nodeIds[0]) : undefined;
        let beforeNode: INodeDataModel | undefined;
        let nextFloorId = nextNode ? nextNode!.includedFloorId : '';

        for (let i = 0; i < nodeIds.length; i++) {
            const nodeId = nodeIds[i];
            const node = nodes.get(nodeId);

            let distance = 0;
            if (i < nodeIds.length - 1) {
                nextNode = nodes.get(nodeIds[i + 1]);
                nextFloorId = nextNode!.includedFloorId;
                distance = this.graph[node!.id][nextNode!.id];
            }

            if (node) {
                result.push({
                    position: node.position,
                    floorId: node.includedFloorId,
                    nodeId: node.id,
                    poiId: null,
                    destination: i === 0 || i === nodeIds.length - 1,
                    idx: i,
                    // transCode: nextFloorId === node.includedFloorId && beforeNode?.transCode !== node.transCode ? null : node.transCode,
                    transCode: node.transCode,
                    distance,
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
        const graph: any = {};

        const nodesByFloorId = super.getNodeData();

        for (const key in nodesByFloorId) {
            const nodes = nodesByFloorId[key];
            nodes.forEach((node: any) => {
                const isAvailablePath = this._checkTransTypePath(node, computingType);

                const graphData: any = {};
                node.edges.forEach((edge: INodeEdgesModel) => {
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

    _checkTransTypePath(node: INodeDataModel, computingType: ComputingType = ComputingType.RECOMMENDATION_TYPE): boolean {
        if (computingType === ComputingType.SAFETY_TYPE) {
            // 안전경로
            return this._isSafetyPath(node);
        }
        if (computingType === ComputingType.ELEVATOR_TYPE || node.transCode === Constants.TRANSCODE.OTHER) {
            // 엘리베이터
            return node.transCode === Constants.TRANSCODE.ELEVATOR || node.transCode === Constants.TRANSCODE.OTHER;
        }
        if (computingType === ComputingType.ESCALATOR_TYPE || node.transCode === Constants.TRANSCODE.OTHER) {
            // 에스컬레이터
            return (
                node.transCode === Constants.TRANSCODE.ESCALATOR ||
                node.transCode === Constants.TRANSCODE.ESCALATOR_UP ||
                node.transCode === Constants.TRANSCODE.ESCALATOR_DOWN ||
                node.transCode === Constants.TRANSCODE.OTHER
            );
        }
        if (computingType === ComputingType.STAIRS_TYPE || node.transCode === Constants.TRANSCODE.OTHER) {
            // 계단
            return node.transCode === Constants.TRANSCODE.STAIRS;
        }
        // 그 밖 (추천경로)
        return true;
    }

    /**
     * 두 포지션간의 거리 계산
     * @param a
     * @param b
     */
    public _calcDistance(a: IPosition, b: IPosition): number {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
}
