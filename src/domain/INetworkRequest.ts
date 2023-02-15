import { ComputingType } from './ComputingType';
import { ILocation } from './ILocation';

export interface INetworkRequest {
    /** locations */
    locations: ILocation[];
    /** computingTypeList */
    computingTypeList: ComputingType[];
}
