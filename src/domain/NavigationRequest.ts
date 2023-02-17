import { INodeDataModel } from './INodeDataModel';
import { ComputingType } from './ComputingType';
import { IMapInfoDataModel } from './IMapInfoDataModel';

export class NavigationRequest {
    mapInfo: IMapInfoDataModel;

    computingType: ComputingType;

    nodes: INodeDataModel[] = [];

    constructor(mapInfo: IMapInfoDataModel, computingType: ComputingType = ComputingType.RECOMMENDATION_TYPE) {
        this.mapInfo = mapInfo;
        this.computingType = computingType;
        mapInfo.floors.forEach((floor) => this.nodes.push(...floor.nodes));
    }
}
