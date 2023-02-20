import { Dollar } from '../Dollar';
import { getPathRequest } from './getPathRequest';
import { navigationOption } from './navigationOption';
import { SingleFloorNoTypeNoWaypoints } from './singleFloorNoTypeNoWaypoints';
import { DoubleFloorElevatorTypeNoWaypoints } from './doubleFloorElevatorTypeNoWaypoints';
import { SingleFloorRecommendationType2Waypoints } from './singleFloorSingleTypeWaypoints';
import { DoubleFloorStairsType2Waypoints } from './doubleFloorStairsType2Waypoints';
import { DoubleFloorElevatorType2Waypoints } from './doubleFloorElevatorType2Waypoints';
import { DoubleFloorMultiType2Waypoints } from './doubleFloorMultiType2Waypoints';
import { DoubleFloorEscalatorTypeNoWaypoints } from './doubleFloorEscalatorTypeNoWaypoints';

const request = require('supertest');
const dotenv = require('dotenv');
const { diff } = require('jest-diff');

dotenv.config(); // .env 파일을 읽어온다.

describe('JEST SAMPLE Test', () => {
    test('곱셈 테스트', () => {
        const dollar = new Dollar(5);

        dollar.times(2);

        expect(dollar.amount).toBe(10);
    });
});

describe('pathAPI Test', () => {
    test('Single Floor No Type No waypoints', async () => {
        const original = await getPathRequest(navigationOption.singleFloorNoTypeNoWaypoints);
        // console.log(original);
        expect(original).toStrictEqual(SingleFloorNoTypeNoWaypoints); // <- success
    });

    test('Single Floor Recommended Type with 2 Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.singleFloorRecommendationType2Waypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(SingleFloorRecommendationType2Waypoints, original);
        console.log(result);

        expect(original).toStrictEqual(SingleFloorRecommendationType2Waypoints); // <- success
    });

    test('Double Floor Elevator Type No waypoints', async () => {
        const original = await getPathRequest(navigationOption.doubleFloorElevatorTypeNoWaypoints);
        const result = diff(DoubleFloorElevatorTypeNoWaypoints, original);
        console.log(result);
        expect(original).toStrictEqual(DoubleFloorElevatorTypeNoWaypoints); // <- success
    });

    test('Double Floor Stairs Type with 2 Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.doubleFloorStairsType2Waypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(DoubleFloorStairsType2Waypoints, original);
        console.log(result);

        expect(original).toStrictEqual(DoubleFloorStairsType2Waypoints); // <- success
    });

    test('Double Floor Elevator Type with 2 Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.doubleFloorElevatorType2Waypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(DoubleFloorElevatorType2Waypoints, original);
        console.log(result);

        expect(original).toStrictEqual(DoubleFloorElevatorType2Waypoints); // <- success
    });

    test('Double Floor Escalator Type with No Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.doubleFloorEscalatorTypeNoWaypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(DoubleFloorEscalatorTypeNoWaypoints, original);
        console.log(result);

        expect(original).toStrictEqual(DoubleFloorEscalatorTypeNoWaypoints); // <- success
    });

    // test('Double Floor Multi Type with 2 Waypoints ', async () => {
    //     const original = await getPathRequest(navigationOption.doubleFloorMultiType2Waypoints);
    //     // console.log(JSON.stringify(original, null, 2));
    //     const result = diff(DoubleFloorMultiType2Waypoints, original);
    //     console.log(result);

    //     expect(original).toStrictEqual(DoubleFloorMultiType2Waypoints); // <- success
    // });
});

// describe('Test the root path', () => {
//     test('It should response the GET method', async () => {
//         const response = await request(app).get('/');
//         expect(response.statusCode).toBe(200);
//     });
// });

// describe('pathAPI Test', () => {
//     test('It should response the GET method', async () => {
//         request(app).post('/').set()
//         expect(response.statusCode).toBe(200);
//     });
// });
