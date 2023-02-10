import {IPosition} from "./IPosition";
import {ISize} from "./ISize";
import {ICoordinate} from "./ICoordinate";

export interface FormalModel {


    /** 아이디 **/
    id: string;

    /** 타이틀 **/
    title: string;

    /** 사이즈 **/
    size: ISize;

    /** 속성 코드 **/
    attributeCode: string;

    /** 중심 좌표 **/
    position: IPosition;

    /** 좌표 **/
    coordinates: ICoordinate[] | [];

    /**
     * 오브젝트 부피 (높이값)
     */
    volume: number;

    /**
     * 앵글
     */
    angle: number;

    /**
     * 진입 가능 여부
     */
    passable: boolean | false;

}

