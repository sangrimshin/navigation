import { ICoordinate } from './ICoordinate';
import { IPosition } from './IPosition';
import { ISize } from './ISize';
import { IPoiDisplayTypeDataModel } from './IPoiDisplayTypeDataModel';
import { ILanguageTextDataModel } from './ILanguageTextDataModel';

export interface IPoiDataModel {
    id: string;

    /** 맵 아이디 */
    mapId: string;

    /** 층 아이디 */
    floorId: string;

    /**
     * 연결된 오브젝트 아이디
     */
    objectId: string;

    /**
     * POI 타이틀
     */
    title: string;

    /**
     * 언어별 POI 타이틀
     */
    titleByLanguages: ILanguageTextDataModel[] | [];

    /**
     * 카테고리(리프) 아이디
     */
    categoryCode: string;

    /**
     * 위치
     */
    position: IPosition;

    /**
     * 아이콘 이미지 URL
     * <br><br>
     */
    iconUrl: string;

    /** 아이콘 size */
    iconSize: ISize;

    /**
     * 아이콘 파일 명
     */
    iconFileName: string;

    /** 노출 타입 */
    displayType: IPoiDisplayTypeDataModel;

    /**
     * 앵커 위치
     */
    anchor: ICoordinate;
}
