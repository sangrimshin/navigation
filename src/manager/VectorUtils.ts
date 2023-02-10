import {ILocation} from "../domain/ILocation";
import {Constants} from "../Constants";
import {IPosition} from "../domain/IPosition";


export class VectorUtils {

    /**
     * 이동 거리 계산
     * @private 이동 거리 cm 으로 환산하여 리턴
     */
    public static _calcRouteDistance(locations: ILocation[]) : number{

        let totalDistance = 0;
        locations.forEach((location,idx) => {
            totalDistance += location.distance;
        });

        return totalDistance;

    }

    /**
     * 이동 시간 계산
     * @param distance 경로에 대한 노드 아이디들
     * @private 이동 시간 milliseconds 로 환산하여 리턴
     */
    public static _calcRouteTime(distance = 0) :number {

        return (distance / Constants.WALKING_DISTANCE_PER_HOUR) * (60 * 60  * 1000);

    }

    /**
     * 두 포지션간의 거리 계산
     * @param a
     * @param b
     */
    public static _calcDistance(a: IPosition, b: IPosition): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

}
