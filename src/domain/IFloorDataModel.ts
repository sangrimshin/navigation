import { ILanguageTextDataModel } from './ILanguageTextDataModel';
import { IObjectDataModel } from './IObjectDataModel';
import { INodeDataModel } from './INodeDataModel';
import { ISectionDataModel } from './ISectionDataModel';
import { IZoneDataModel } from './IZoneDataModel';
import { IPoiDataModel } from './IPoiModel';

/**
 * 층별 데이터 모델
 */
export interface IFloorDataModel {
    /**
     * 아이디
     */
    id: string;

    /** 맵 아이디 **/
    mapId: string;

    /** 이름 **/
    name: ILanguageTextDataModel[] | [];

    /** 지상 지하 **/
    underFloor: boolean;

    /** 메인 층 **/
    defaultYn: boolean;

    /** 순서 **/
    order: number;

    /** 레벨(1층부터 매겨지는 인덱스라고 보면 됨) **/
    level: number;

    /**
     * 층별 기압
     */
    pressure: number;

    /**
     * 전층과 기압차이
     */
    pressureDiff: number;

    /**
     * 오브젝트 목록
     */
    objects: IObjectDataModel[] | [];

    /**
     * 라인 목록
     */
    lines: IObjectDataModel[] | [];

    /**
     * 노드 목록
     */
    nodes: INodeDataModel[] | [];

    /**
     * 바닥판 목록
     */
    sections: ISectionDataModel[] | [];

    /**
     * 영역 목록
     */
    zones: IZoneDataModel[] | [];

    /**
     * POI 목록
     */
    pois: IPoiDataModel[] | [];
}
