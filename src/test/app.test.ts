import { Dollar } from '../Dollar';
import { getPathRequest } from './getPathRequest';
import { navigationOption } from './navigationOption';
import { SingleFloorEscalatorType2Waypoints } from './result/singleFloorEscalatorType2Waypoints';
import { SingleFloorNoTypeNoWaypoints } from './result/singleFloorNoTypeNoWaypoints';
import { SingleFloorRecommendationType2Waypoints } from './result/singleFloorRecommendationType2Waypoints';
import { DoubleFloorElevatorType2Waypoints } from './result/doubleFloorElevatorType2Waypoints';
import { DoubleFloorElevatorTypeNoWaypoints } from './result/doubleFloorElevatorTypeNoWaypoints';
import { DoubleFloorMultiType2Waypoints } from './result/doubleFloorMultiType2Waypoints';
import { DoubleFloorStairsType2Waypoints } from './result/doubleFloorStairsType2Waypoints';
import { DoubleFloorMulti2Type2Waypoints } from './result/doubleFloorMulti2Type2Waypoints';
import { NoResult } from './result/noResult';
import { Up } from './result/up';
import { UpDown } from './result/upDown';
import { Down } from './result/down';
import { DownUp } from './result/downUp';

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

    test('Single Floor Esclator Type with 2 Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.singleFloorEscalatorType2Waypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(SingleFloorEscalatorType2Waypoints, original);
        console.log(result);

        expect(original).toStrictEqual(SingleFloorEscalatorType2Waypoints); // <- success
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
        const result = diff(NoResult, original);
        console.log(result);
        expect(original).toStrictEqual(NoResult); // <- success
    });

    test('Double Floor Escalator Type with 1 Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.doubleFloorEscalatorType1Waypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(NoResult, original);
        console.log(result);
        expect(original).toStrictEqual(NoResult); // <- success
    });

    test('Double Floor Escalator Type with 2 Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.doubleFloorEscalatorType2Waypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(NoResult, original);
        console.log(result);
        expect(original).toStrictEqual(NoResult); // <- success
    });

    test('Double Floor Elevator Stairs Type with 2 Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.doubleFloorMultiType2Waypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(DoubleFloorMultiType2Waypoints, original);
        console.log(result);
        expect(original).toStrictEqual(DoubleFloorMultiType2Waypoints); // <- success
    });

    test('Double Floor Escalator Stairs Type with 2 Waypoints ', async () => {
        const original = await getPathRequest(navigationOption.doubleFloorMulti2Type2Waypoints);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(DoubleFloorMulti2Type2Waypoints, original);
        console.log(result);
        expect(original).toStrictEqual(DoubleFloorMulti2Type2Waypoints); // <- success
    });

    test('Up : 2층-> 11층 -> 11층 -> 11층', async () => {
        const original = await getPathRequest(navigationOption.up);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(Up, original);
        console.log(result);
        expect(original).toStrictEqual(Up); // <- success
    });

    test('Updown :  2층 -> 11층 -> 11층 -> 2층', async () => {
        const original = await getPathRequest(navigationOption.upDown);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(UpDown, original);
        console.log(result);
        expect(original).toStrictEqual(UpDown); // <- success
    });

    test('Down : 11층 -> 11층 -> 2층 -> 2층', async () => {
        const original = await getPathRequest(navigationOption.down);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(Down, original);
        console.log(result);
        expect(original).toStrictEqual(Down); // <- success
    });

    test('DownUp : 11층 -> 11층 -> 2층 -> 11층', async () => {
        const original = await getPathRequest(navigationOption.downUp);
        // console.log(JSON.stringify(original, null, 2));
        const result = diff(DownUp, original);
        console.log(result);
        expect(original).toStrictEqual(DownUp); // <- success
    });
});
