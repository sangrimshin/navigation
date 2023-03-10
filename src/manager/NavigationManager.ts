import { NavigationRequest } from '../domain/NavigationRequest';
import { ILocation } from '../domain/ILocation';
import { NavigationResponse } from '../domain/NavigationResponse';
import { Constants } from '../Constants';
import { FloorDataManager } from './FloorDataManager';
import { Vector3 } from '../domain/Vector3';
import { Vector2 } from '../domain/Vector2';
import { INodeDataModel } from '../domain/INodeDataModel';
import { ComputingType } from '../domain/ComputingType';
import { DirectionType } from '../domain/DirectionType';

const _ = require('lodash');

export abstract class NavigationManager {
    protected _request: NavigationRequest;

    protected _nodeData: any[];

    protected _nodeMap: Map<string, INodeDataModel> = new Map<string, INodeDataModel>();

    protected _floorDataManager: FloorDataManager;

    protected constructor(request: NavigationRequest) {
        this._request = request;
        this._nodeData = _.groupBy(this._request.nodes, 'includedFloorId');
        this._request.nodes.forEach((node: INodeDataModel) => {
            this._nodeMap.set(node.id, node);
        });
        this._floorDataManager = new FloorDataManager(request);
    }

    abstract getPath(locations: ILocation[]): NavigationResponse;

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

    protected diffAngle(prevPosition: Vector3, currentPosition: Vector3, nextPosition: Vector3): number {
        const dir1 = new Vector3(); // create once an reuse it
        dir1.subVectors(currentPosition, prevPosition).normalize();

        const dir2 = new Vector3(); // create once an reuse it
        dir2.subVectors(nextPosition, currentPosition).normalize();

        const angle1 = dir2.angleTo(dir1);
        const degree = (angle1 * 180) / Math.PI;

        return degree;
    }

    protected detectDirection(prevPosition: Vector3, currentPosition: Vector3, nextPosition: Vector3): DirectionType {
        const dir = new Vector3(); // create once an reuse it
        dir.subVectors(prevPosition, currentPosition).normalize();
        const v12 = new Vector2(dir.x, dir.y);

        dir.subVectors(nextPosition, currentPosition).normalize();
        const v22 = new Vector2(dir.x, dir.y);

        const corr = v22.cross(v12);

        let result = DirectionType.STRAIGHT;

        if (corr > 0) {
            result = DirectionType.RIGHT;
        } else if (corr < 0) {
            result = DirectionType.LEFT;
        }

        return result;
    }

    protected simplify(locations: ILocation[]): ILocation[] {
        let floorId = '';
        let floorIdx = 0;
        let prevLocation: ILocation | null = null;
        let currentLocation = null;
        let nextLocation = null;
        const newLocations: ILocation[] = [];

        locations.forEach((location, idx) => {
            if (!location.transCode) location.direction = DirectionType.STRAIGHT;

            if (floorId !== location.floorId) {
                // ?????? ???
                floorId = location.floorId;
                floorIdx = 0;

                location.direction = DirectionType.STRAIGHT;
                location.angle = 0;
            }

            // location ?????? ?????? ??????
            currentLocation = location;

            if (floorIdx > 0) {
                prevLocation = locations[idx - 1];
            }

            if (idx < locations.length - 1) {
                nextLocation = locations[idx + 1];
            } else {
                nextLocation = null;
            }

            let direction: DirectionType = DirectionType.STRAIGHT;
            let distance = 0;
            let angle = 0;

            if (prevLocation !== null && currentLocation !== null && nextLocation !== null) {
                let prevPosition = new Vector3(prevLocation.position?.x, prevLocation.position?.y, prevLocation.position?.z);
                const currentPosition = new Vector3(currentLocation.position?.x, currentLocation.position?.y, currentLocation.position?.z);
                let nextPosition = new Vector3(nextLocation.position?.x, nextLocation.position?.y, nextLocation.position?.z);

                // ?????? ????????? ?????? ?????? ??? ??? / ?????? ??? ??? ??? ?????? ????????? ???????????? (https://www.notion.so/dabeeo/IMSTUDIO-0f8dd823178e49b2bf47fd25676560a6)
                // 1. ??????????????? ????????? ?????? position ??? ???????????? ??????????????? position ??? ??????.
                if (prevLocation.floorId !== currentLocation.floorId) {
                    this._floorDataManager._getObjectsByNodeId(currentLocation.floorId, currentLocation.nodeId).forEach((obj) => {
                        if (this._floorDataManager._isTransObject(obj)) {
                            prevPosition = new Vector3(obj.position.x, obj.position.y, obj.position.z);
                        }
                    });
                }
                // 2. ??????????????? ??????????????? ???????????? ???????????? ???????????? position ??? ?????? ?????? ????????? ????????? ???????????? ??????????????? position ??? ??????.
                if (nextLocation.floorId !== currentLocation.floorId) {
                    this._floorDataManager._getObjectsByNodeId(currentLocation.floorId, currentLocation.nodeId).forEach((obj) => {
                        if (this._floorDataManager._isTransObject(obj)) {
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

            if (location.destination || floorIdx === 0) {
                // UTURN ??????
                if (angle > Constants.UTURN_DEGREE) {
                    direction = DirectionType.UTURN;
                }

                location.direction = direction;
                newLocations.push(location); // ?????????????????? ??????????????? ??? ??? ??????
            } else if (nextLocation?.floorId !== currentLocation?.floorId) {
                // 0. ?????? ????????? ??? ???????????? ???????????????
                location.direction = null;
                newLocations.push(location); // ?????? ???????????? ????????? ??????????????? ??? ??? ??????
            } else if (distance > 1 && angle > Constants.DIFF_DEGREE) {
                location.direction = direction;
                newLocations.push(location);
            }
            floorIdx += 1;
        });

        const copiedLocations: ILocation[] = _.cloneDeep(newLocations);

        // ?????? ?????? location ?????? ???????????? ?????? ??????
        copiedLocations.forEach((location, idx) => {
            if (idx < copiedLocations.length - 1) {
                const prev = new Vector2(copiedLocations[idx + 1].position?.x, copiedLocations[idx + 1].position?.y);
                const curr = new Vector2(location.position?.x, location.position?.y);

                if (copiedLocations[idx + 1].floorId !== location.floorId) {
                    location.distance = 0;
                } else {
                    location.distance = curr.distanceTo(prev);
                }
            }
        });

        return copiedLocations;
    }
}
