import { Dollar } from '../Dollar';
import { resultDoubleFloorSingleType } from './doubleFloorSingleType';
import { resultDoubleFloorStairsType } from './doubleFloorStairsType';
import { getPathRequest } from './getPathRequest';
import { navigationOption } from './navigationOption';
import { resultSingleFloorMultiType } from './singleFloorMultiType';
import { resultSingleFloorSingleType } from './singleFloorSingleType';
import { resultSingleFloorSingleTypeWaypoints } from './singleFloorSingleTypeWaypoints';

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
    test('success case - single Floor single Type', async () => {
        const original = await getPathRequest(navigationOption.singleFloorSingleType);
        // console.log(original);
        expect(original).toStrictEqual(resultSingleFloorSingleType); // <- success
    });

    test('success case - single Floor multi Type', async () => {
        const original = await getPathRequest(navigationOption.singleFloorMultiType);
        // console.log(original);
        expect(original).toStrictEqual(resultSingleFloorMultiType); // <- success
    });

    test('success case - single Floor single Type with Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.singleFloorSingleTypeWaypoints);
        // console.log(JSON.stringify(original, null, 2));
        expect(original).toStrictEqual(resultSingleFloorSingleTypeWaypoints); // <- success
    });

    test('success case - double Floor single Type ', async () => {
        const original = await getPathRequest(navigationOption.dobuleFloorSingleType);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(original, resultDoubleFloorSingleType);

        // print diff
        console.log(result);
        expect(original).toStrictEqual(resultDoubleFloorSingleType); // <- success
    });

    test('success case - double Floor stairs Type ', async () => {
        const original = await getPathRequest(navigationOption.dobuleFloorStairsType);
        // console.log(JSON.stringify(original, null, 2));
        expect(original).toStrictEqual(resultDoubleFloorStairsType); // <- success
    });
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
