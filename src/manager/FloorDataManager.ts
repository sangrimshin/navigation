import { IFloorDataModel } from '../domain/IFloorDataModel';
import { IObjectDataModel } from '../domain/IObjectDataModel';
import { IPoiDataModel } from '../domain/IPoiModel';
import { FormalModel } from '../domain/FormalModel';
import { IPosition } from '../domain/IPosition';
import { Constants } from '../Constants';
import { VectorUtils } from './VectorUtils';
import { NavigationRequest } from '../domain/NavigationRequest';
import { INodeDataModel } from '../domain/INodeDataModel';
import { ILocation } from '../domain/ILocation';

export class FloorDataManager {
    request: NavigationRequest;

    constructor(request: NavigationRequest) {
        this.request = request;
    }

    /**
     * 특정 위치를 기준으로 가까운 순서대로 노드배열 정렬
     * @param nodes
     * @param position
     */
    public _sortNodesFromPosition(nodes: INodeDataModel[], position: IPosition): any {
        return nodes
            .map((node) => {
                let distance: number = VectorUtils._calcDistance(position, node.position);
                return { distance: distance, node: node };
            })
            .sort(function (a, b) {
                return a.distance - b.distance;
            });
    }

    /**
     * 인자로 전달받은 위치에서 가장 가까운 노드를 찾음
     * @param locations 관심사가 있는 위치
     * @private 관심사 위치에서 가장 가까운 노드
     */
    public _getClosestNode(locations: ILocation): INodeDataModel | null {
        let nodes = this.request.nodes;

        let sortedList = this._sortNodesFromPosition(
            nodes.filter((node) => node.includedFloorId === locations.floorId),
            locations.position!,
        ); // 출발지 노드 후보지 1개로 변경

        if (sortedList.length < 0) {
            return null;
        } else {
            return sortedList[0].node;
        }
    }

    /**
     * 층 에서 오브젝트 아이디로 오브젝트를 조회 함
     * @param floor
     * @param id
     */
    public _getObjectById(floor: IFloorDataModel, id: string): IObjectDataModel {
        return floor.objects.filter((object) => object.id === id)[0];
    }

    /**
     * 층에서 POI 아이디로 POI 를 조회 함
     * @param floor
     * @param id
     */
    public _getPoiById(floor: IFloorDataModel, id: string): IPoiDataModel {
        return floor.pois.filter((poi) => poi.id === id)[0];
    }

    /**
     * 층에서 오브젝트 아이디로 노드목록을 조회 함
     * @param floor
     * @param targetObjectId
     */
    public _getNodesByObjectId(floor: IFloorDataModel, targetObjectId: string): INodeDataModel[] {
        return floor.nodes.filter((node) => node.objectIds.findIndex((objectId) => objectId === targetObjectId) > -1);
    }

    /**
     * 노드와 연결된 오브젝트 리턴
     * @param floorId
     * @param nodeId
     */
    public _getObjectsByNodeId(floorId: string, nodeId: string): IObjectDataModel[] | [] {
        const floor: IFloorDataModel = this.request.mapInfo.floors.filter((f) => f.id === floorId)[0];

        let result: IObjectDataModel[] = [];
        const nodeIdx = floor.nodes.findIndex((n) => n.id === nodeId);
        const node = floor.nodes[nodeIdx];
        node.objectIds.forEach((objectId) => {
            const idx = floor.objects.findIndex((o) => o.id === objectId);

            if (idx > 0) {
                result.push(floor.objects[idx]);
            }
        });

        return result;
    }

    /**
     * object 에 연결된 POI 를 조회 한다.
     *
     * @param floorId 찾고자 하는 층 아이디
     * @param objectId 찾고자 하는 오브젝트 아이디
     */
    public _getPoisByObjectId(floorId: string, objectId: string): IPoiDataModel | null {
        const floor = this.request.mapInfo.floors.filter((f) => f.id === floorId)[0];
        const poiIdx = floor.pois.findIndex((p) => p.objectId === objectId);

        if (poiIdx >= 0) {
            return floor.pois[poiIdx];
        } else {
            return null;
        }
    }

    public _setPoiRelatedObjectAndPOI(location: ILocation): void {
        if (!location.poiId) {
            let objects: IObjectDataModel[] = this._getObjectsByNodeId(location.floorId, location.nodeId);
            objects.forEach((obj) => {
                let poi: IPoiDataModel = this._getPoisByObjectId(location.floorId, obj.id)!;
                if (poi) {
                    location.poiId = poi.id;
                }
            });
        }
    }

    /**
     * 관심 위치에서 가까운 노드를 검색 함
     * (관심 위치가 오브젝트에 포함된다면 포함되는 오브젝트에 연결된 노드 리턴,) 2.0.2 에서 삭제 됨
     * 관심 위치가 오브젝트에 포함되어있지 않다면 가장 가까운 노드 리턴
     *
     * @param floorData
     * @param location
     */
    public _getNodeByLocation(floorData: IFloorDataModel, location: ILocation): INodeDataModel[] | null {
        if (!location.position && !location.poiId) {
            return null;
        } else if (!location.position && location.poiId) {
            location.position = this._getPoiById(floorData, location.poiId).position;
        }

        let resultNodes: INodeDataModel[] = [];

        // // 오브젝트에포함되어있는지 체크하는 로직 제거 함 (2.0.2), 명시적으로 오브젝트와 연결된 케이스에만 오브젝트 연결된 노드를 찾고, 그 외의 케이스는 무조건 위치 기반 탐색 수행
        // floorData.objects.filter(object => {
        //     return this._isContain(object, location.position!);
        // }).forEach(object => {
        //     this._getNodesByObjectId(floorData, object.id).forEach(node => resultNodes.push(node));
        //
        // });

        if (resultNodes.length === 0) {
            resultNodes.push(this._getClosestNode(location)!);
        }

        return resultNodes;
    }

    /**
     * 다각형 내부에 있는지 확인
     * @param model    내부에 있는지 확인 할 모델
     * @param position 관심 포인트
     * @private true 내부에 있음, false 외부에 있음
     */
    public _isContain(model: FormalModel, position: IPosition): boolean {
        const x = position.x;
        const y = position.y;

        // 다각형 내부 체크 로직
        const sizeOfVertexes = model.coordinates.length;

        if (sizeOfVertexes < 3) {
            return false;
        }
        let followIndex = sizeOfVertexes - 1;
        let isOddNodes = false;
        /**
         * 아래 알고리즘은 "Point in Polygon" 알고리즘이다.
         * 다만 좌우 양 방향을 체크하는 것이 아니라 왼쪽 방향만을 체크한다.
         */
        for (let frontIndex = 0; frontIndex < sizeOfVertexes; frontIndex++) {
            const frontPoint = model.coordinates[frontIndex];
            const followPoint = model.coordinates[followIndex];
            if ((frontPoint.y < y && followPoint.y >= y) || (followPoint.y < y && frontPoint.y >= y)) {
                /**
                 * "직선의 기울기 m을 갖는 yPosf에 해당하는 x" < xPosf 인지 체크
                 * 두 점을 지나는 직선의 방정식 참고.
                 *      y - y1 = M * (x - x1)
                 *      M = (y2 - y1) / (x2 - x1)
                 */
                if (frontPoint.x + ((y - frontPoint.y) / (followPoint.y - frontPoint.y)) * (followPoint.x - frontPoint.x) < x) {
                    isOddNodes = !isOddNodes;
                }
            }
            followIndex = frontIndex;
        }
        /**
         * "기울기 m을 갖는 yPosf에 해당하는 x" < xPosf의 개수가 홀수이면
         * 다각형안에 포함된 점이다.
         */

        return isOddNodes;
    }

    public _syncLocationAndPoi(location: ILocation): void {
        if (!location.poiId) {
            if (location.position) {
                if (location.floorId) {
                    const floor = this.request.mapInfo.floors.filter((f) => f.id === location.floorId)[0];
                    const poiIdx = floor.pois.findIndex((p) => p.position.x === location.position!.x && p.position.y === location.position!.y);
                    const poi = floor.pois[poiIdx];
                    if (poi) {
                        location.poiId = poi.id;
                    } else {
                    }
                }
            }
        }
    }

    /**
     * 오브젝트가 이동수단인지 확인
     * @param obj
     */
    public _isTransObject(obj: IObjectDataModel): boolean {
        if (
            obj.attributeCode === Constants.TRANSCODE.ELEVATOR ||
            obj.attributeCode === Constants.TRANSCODE.ESCALATOR ||
            obj.attributeCode === Constants.TRANSCODE.ESCALATOR_UP ||
            obj.attributeCode === Constants.TRANSCODE.ESCALATOR_DOWN ||
            obj.attributeCode === Constants.TRANSCODE.STAIRS
        ) {
            return true;
        } else {
            return false;
        }
    }
}
