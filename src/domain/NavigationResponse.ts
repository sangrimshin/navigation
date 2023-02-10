import { ILocation } from './ILocation';
import { VectorUtils } from '../manager-/VectorUtils';

export class NavigationResponse {
    locations: ILocation[];

    pathInfo: ILocation[];

    totalDistance: number;

    totalTime: number;

    constructor(locations: ILocation[]) {
        this.locations = locations;
        this.totalDistance = 0;
        this.totalTime = 0;
        this.pathInfo = [];
    }

    getOrigin(): ILocation {
        return this.locations[0];
    }

    getFinalDestination(): ILocation {
        return this.locations[this.locations.length - 1];
    }

    getWayPoints(): ILocation[] {
        return this.locations.filter((location) => location.isDestination);
    }

    calculateTotalDistanceAndTime() {
        this.totalDistance = VectorUtils._calcRouteDistance(this.pathInfo);
        this.totalTime = VectorUtils._calcRouteTime(this.totalDistance);
    }
}
