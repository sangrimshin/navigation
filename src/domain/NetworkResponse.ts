import { ComputingType } from './ComputingType';
import { ILocation } from './ILocation';
import { NavigationResponse } from './NavigationResponse';

export class NetworkResponse {
    code: string;

    message: string;

    payload: {
        [key in ComputingType]?: NavigationResponse;
    };

    constructor(code: string, message: string) {
        this.code = code;
        this.message = message;
        this.payload = {};
    }

    addResponse(computingType: ComputingType, response: NavigationResponse) {
        this.payload[computingType] = response;
    }
}
