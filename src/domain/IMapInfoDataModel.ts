import {IPosition} from "./IPosition";
import {ISize} from "./ISize";
import {IFloorDataModel} from "./IFloorDataModel";


export interface IMapInfoDataModel{

    /**
     * 아이디
     */
    id: string;

    /** 이름 **/
    name: string;

    /** 메인 층 **/
    defaultFloorId: string;

    /**
     * 사이즈
     */
    size: ISize;

    /**
     * 방위각
     */
    northReference: number;

    /**
     * 그리드 폭
     */
    grid: number;

    /**
     * 축척비 cm
     */
    scaleCm: number;

    /**
     * 축척비 px
     */
    scalePx: number;

    /**
     * 영점 조정 좌표
     */
    fixedPosition: IPosition;

    /**
     * 층 목록
     */
    floors: IFloorDataModel[];

    /**
     * x 축 방향
     */
    xAxisDirection: number | 1;

    /**
     * y 축 방향
     */
    yAxisDirection:number | 1;


}
