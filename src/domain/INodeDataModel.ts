import {IPosition} from "./IPosition";
import {INodeEdgesModel} from "./INodeEdgesModel";

export interface INodeDataModel{
    id:string;
    title:string;
    objectIds:Array<string>;
    position:IPosition;
    edges:Array<INodeEdgesModel>;
    linkedYn:boolean;
    includedFloorId:string;
    transCode:string;
}