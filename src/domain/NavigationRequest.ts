import { INodeDataModel } from './INodeDataModel';
import { ComputingType } from './ComputingType';
import { IMapInfoDataModel } from './IMapInfoDataModel';

export class NavigationRequest {
    mapInfo: IMapInfoDataModel;
    computingType: ComputingType;
    nodes: INodeDataModel[] = [];

    constructor(mapInfo: IMapInfoDataModel, computingType: ComputingType = ComputingType.RECOMMENDATION) {
        this.mapInfo = mapInfo;
        this.computingType = computingType;
        for (let floor of mapInfo.floors) {
            this.nodes = this.nodes.concat(floor.nodes);
        }
    }
}
