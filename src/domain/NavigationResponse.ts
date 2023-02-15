import { VectorUtils } from '../manager/VectorUtils';
import { ILocation } from './ILocation';

export class NavigationResponse {
    private locations: ILocation[];

    private pathInfo: ILocation[];

    private totalDistance: number;

    private totalTime: number;

    private origin: ILocation;

    private wayPoints: ILocation[];

    private finalDestination: ILocation;

    constructor(locations: ILocation[]) {
        this.locations = locations;
        this.totalDistance = 0;
        this.totalTime = 0;
        this.wayPoints = [];
        this.pathInfo = [];
        this.origin = this.locations[0];
        this.finalDestination = this.locations[this.locations.length - 1];
        this.wayPoints = this.locations.filter((location) => location.destination);
    }

    setLocations(locations: ILocation[]) {
        this.locations = locations;
        this.origin = this.locations[0];
        this.finalDestination = this.locations[this.locations.length - 1];
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

    getOrigin(): ILocation {
        return this.origin;
    }

    getFinalDestination(): ILocation {
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
