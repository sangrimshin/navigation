import { Dollar } from '../Dollar';
import { getPathRequest } from './getPathRequest';
import { resultPathRequest } from './result';
import { resultPathRequest2 } from './result2';

const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config(); // .env 파일을 읽어온다.

describe('JEST SAMPLE Test', () => {
    test('곱셈 테스트', () => {
        const dollar = new Dollar(5);

        dollar.times(2);

        expect(dollar.amount).toBe(10);
    });
});

describe('pathAPI Test', () => {
    test('success case', async () => {
        const original = await getPathRequest();
        console.log(original);
        expect(original).toStrictEqual(resultPathRequest2); // <- success
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
