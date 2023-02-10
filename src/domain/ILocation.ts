import { IPosition } from './IPosition';
import { DirectionType } from './DirectionType';

export interface ILocation {
    position: IPosition | null;
    floorId: string;
    nodeId: string;
    poiId: string | null;
    isDestination: boolean;
    idx: number;
    transCode: string | null;
    distance: number;
    direction: DirectionType | null;
    angle: number;
}
