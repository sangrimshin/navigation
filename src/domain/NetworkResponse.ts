import { ComputingType } from './ComputingType';
import { NavigationResponse } from './NavigationResponse';

export class NetworkResponse {
    code: string;

    message: string;

    payload: {
        [key in string]?: NavigationResponse;
    };

    constructor(code: string, message: string) {
        this.code = code;
        this.message = message;
        this.payload = {};
    }

    addResponse(computingType: ComputingType, response: NavigationResponse) {
        this.payload[computingType.toLowerCase()] = response;
    }
}
