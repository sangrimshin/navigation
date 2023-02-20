import { VectorUtils } from '../manager/VectorUtils';
import { ILocation } from './ILocation';

export class NavigationResponse {
    private locations: ILocation[];

    private pathInfo: ILocation[];

    private totalDistance: number;

    private totalTime: number;

    private origin: ILocation | null;

    private wayPoints: ILocation[];

    private finalDestination: ILocation | null;

    constructor(locations: ILocation[]) {
        this.locations = [];
        this.origin = null;
        this.finalDestination = null;
        this.wayPoints = [];
        this.setLocations(locations);
        this.totalDistance = 0;
        this.totalTime = 0;
        this.pathInfo = [];
    }

    setLocations(locations: ILocation[]) {
        this.locations = locations;
        this.origin = locations.length > 0 ? this.locations[0] : null;
        this.finalDestination = locations.length > 0 ? this.locations[this.locations.length - 1] : null;

        this.wayPoints = this.locations.filter((location) => location.destination);
    }

    setPathInfo(pathInfo: ILocation[]) {
        this.pathInfo = pathInfo;
    }

    setCalculateTotalDistanceAndTime() {
        this.totalDistance = VectorUtils._calcRouteDistance(this.pathInfo);
        this.totalTime = VectorUtils._calcRouteTime(this.totalDistance);
    }

    getLocations() {
        return this.locations;
    }

    getPathInfo(): ILocation[] {
        return this.pathInfo;
    }

    getOrigin(): ILocation | null {
        return this.origin;
    }

    getFinalDestination(): ILocation | null {
        return this.finalDestination;
    }

    getWayPoints(): ILocation[] {
        return this.wayPoints;
    }

    getTotalTime() {
        return this.totalTime;
    }

    getTotalDistance() {
        return this.totalDistance;
    }
}
