import {NavigationRequest} from "../domain/NavigationRequest";
import {ILocation} from "../domain/ILocation";
import {ComputingType, DirectionType, INodeDataModel} from "..";
import {NavigationResponse} from "../domain/NavigationResponse";
import {Constants} from "../Constants";
import {FloorDataManager} from "./FloorDataManager";
import {Vector3} from "../domain/Vector3";
import {Vector2} from "../domain/Vector2";


let _ = require('lodash');

export abstract class NavigationManager {

    protected _request: NavigationRequest;

    protected _nodeData: any[];

    protected _nodeMap: Map<string, INodeDataModel> = new Map<string, INodeDataModel>();

    protected _floorDataManager: FloorDataManager;

    protected constructor(request : NavigationRequest) {
        this._request = request;
        this._nodeData = _.groupBy(this._request.nodes, "includedFloorId");
        this._request.nodes.forEach((node : INodeDataModel) => {
            this._nodeMap.set(node.id, node);
        });
        this._floorDataManager = new FloorDataManager(request);
    }

    abstract getPath(locations : ILocation[]) : NavigationResponse;


    protected getRequest(): NavigationRequest {
        return this._request;
    }

    protected getNodeData(): any[] {
        return this._nodeData;
    }


    protected getNodeMap(): Map<string, INodeDataModel> {
        return this._nodeMap;
    }

    protected updateComputingType(computingType: ComputingType) {

        this._request.computingType = computingType;
    }

    protected updateNodes(nodes: INodeDataModel[]) {

        this._request.nodes = nodes;
    }

    protected updateScaleCm(scaleCm: number) {
        this._request.mapInfo.scaleCm = scaleCm;
    }

    protected updateScalePx(scalePx: number) {
        this._request.mapInfo.scalePx = scalePx;
    }

    protected  diffAngle(prevPosition : Vector3, currentPosition : Vector3, nextPosition: Vector3) : number{

        let dir1 = new Vector3(); // create once an reuse it
        dir1.subVectors(currentPosition, prevPosition).normalize();

        let dir2 = new Vector3(); // create once an reuse it
        dir2.subVectors(nextPosition, currentPosition).normalize();

        let angle1 = dir2.angleTo(dir1);
        let degree = (angle1 * 180) / Math.PI;

        return degree;

    }

    protected  detectDirection(prevPosition: Vector3, currentPosition: Vector3, nextPosition: Vector3): DirectionType {

        let dir = new Vector3(); // create once an reuse it
        dir.subVectors(prevPosition, currentPosition).normalize();
        let v12 = new Vector2(dir.x, dir.y);

        dir.subVectors(nextPosition, currentPosition).normalize();
        let v22 = new Vector2(dir.x, dir.y);

        let corr = v22.cross(v12);

        let result = DirectionType.STRAIGHT;

        if (corr > 0) {
            result = DirectionType.RIGHT;
        } else if (corr < 0) {
            result = DirectionType.LEFT;
        }

        return result;
    }


    protected simplify(locations: ILocation[]) : ILocation[]{

        let floorId = "";
        let floorIdx = 0;
        let prevLocation : ILocation | null = null;
        let currentLocation = null;
        let nextLocation = null;
        let newLocations : ILocation[]= [];

        locations.forEach((location, idx) => {

            if (floorId !== location.floorId) {
                // 다른 층
                floorId = location.floorId;
                floorIdx = 0;

                location.direction = DirectionType.STRAIGHT;
                location.angle = 0;

            }

            // location 들에 대한 정의
            currentLocation = location;

            if (floorIdx > 0) {
                prevLocation = locations[idx-1];
            }

            if (idx < locations.length - 1) {
                nextLocation = locations[idx+1];
            }else{
                nextLocation = null;
            }

            let direction: DirectionType = DirectionType.STRAIGHT;
            let distance = 0;
            let angle = 0;

            if (prevLocation !== null && currentLocation !== null && nextLocation !== null) {
                let prevPosition = new Vector3(prevLocation.position?.x, prevLocation.position?.y, prevLocation.position?.z);
                let currentPosition = new Vector3(currentLocation.position?.x, currentLocation.position?.y, currentLocation.position?.z);
                let nextPosition = new Vector3(nextLocation.position?.x, nextLocation.position?.y, nextLocation.position?.z);

                // 층간 이동에 따른 이동 전 층 / 이동 후 층 에 따른 위치값 보정처리 (https://www.notion.so/dabeeo/IMSTUDIO-0f8dd823178e49b2bf47fd25676560a6)
                // 1. 이전층에서 올라온 경우 position 은 이동수단 오브젝트의 position 이 된다.
                if (prevLocation.floorId !== currentLocation.floorId) {
                    this._floorDataManager._getObjectsByNodeId(currentLocation.floorId, currentLocation.nodeId).forEach(obj => {
                        if (this._floorDataManager._isTransObject(obj)) {
                            prevPosition = new Vector3(obj.position.x, obj.position.y, obj.position.z);
                        }
                    })
                }
                // 2. 다음노드가 다음층으로 올라가는 이동수단 노드라면 position 은 현재 연결 노드와 연결된 이동수단 오브젝트의 position 이 된다.
                if (nextLocation.floorId !== currentLocation.floorId) {
                    this._floorDataManager._getObjectsByNodeId(currentLocation.floorId, currentLocation.nodeId).forEach(obj => {
                        if(this._floorDataManager._isTransObject(obj)){
                            nextPosition = new Vector3(obj.position.x, obj.position.y, obj.position.z);
                        }
                    });
                }

                angle = this.diffAngle(prevPosition, currentPosition, nextPosition);
                location.angle = angle;

                direction = this.detectDirection(prevPosition, currentPosition, nextPosition);
                direction = angle > Constants.DIFF_DEGREE ? direction : DirectionType.STRAIGHT;
                distance = nextPosition.distanceTo(currentPosition);

            }

            if (location.isDestination || floorIdx === 0) {
                location.direction = direction;
                newLocations.push(location); // 경유지노드는 심플리파이 될 수 없음
            }else{

                // 0. 다음 노드가 층 이동되는 케이스라면
                if (nextLocation?.floorId !== currentLocation?.floorId) {
                    location.direction = null;
                    newLocations.push(location); // 층간 이동되는 노드는 심플리파이 될 수 없음

                }else{
                    if (distance > 1 && angle > Constants.DIFF_DEGREE) {
                        location.direction = direction;
                        newLocations.push(location);
                    }
                }
            }
            floorIdx++;
        });

        // 새로 뽑힌 location 들을 기반으로 거리 계산
        newLocations.forEach((location, idx) => {
            if (idx > 0) {
                let prev = new Vector2(newLocations[idx - 1].position?.x, newLocations[idx - 1].position?.y);
                let curr = new Vector2(location.position?.x, location.position?.y);

                if (newLocations[idx - 1].floorId !== location.floorId) {
                    location.distance = 0;
                }else{
                    location.distance = curr.distanceTo(prev);
                }
            }
        });

        return newLocations;
    }

}
