import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { NavigationRequest } from './domain/NavigationRequest';
import { ComputingType } from './domain/ComputingType';
import { DijkstraNavigationManager } from './manager/DijkstraNavigationManager';
import { ILocation } from './domain/ILocation';
import { NavigationResponse } from './domain/NavigationResponse';
import { INetworkRequest } from './domain/INetworkRequest';
import { NetworkResponse } from './domain/NetworkResponse';

const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // .env 파일을 읽어온다.

export const app = express();
export const port = process.env.PORT || 4000;

const allowlist = ['http://0.0.0.0:9000', 'http://example2.com'];
app.options('*', cors());

const corsOptionsDelegate = function (req: any, callback: any) {
    let corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        // ✅ set origin to true to reflect the request origin
        // as defined by the `Origin` request header
        // or set origin to false to disable CORS
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use(express.json()); // use() 를 통해 연결 시킨다! (사용하기 위해)

app.get('/', (req: Request, res: Response) => {
    //   console.log(req);
    console.log('received get command ');
    res.send('Hello JS World!');
});

// async function dataTest() {
//     const original = await getPathRequest();
//     console.log(original);
// }

// dataTest();

app.get('/api/user/:id', (req, res) => {
    const { id } = req.params;
    //   console.log(req);
    console.log(req.params);
    console.log(id);
    res.json({ id });
});

async function getMapAxios(token: string) {
    const response = await axios.get('https://api.dabeeomaps.com/v2/map?t=JS', {
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
    });
    // console.dir(response.data.payload);
    return response.data.payload;
    // console.log(data);
}

async function getPath(authoization: string, locations: ILocation[], computingTypeList: ComputingType[]): Promise<NetworkResponse> {
    computingTypeList = computingTypeList || [ComputingType.RECOMMENDATION];
    const mapInfo = await getMapAxios(authoization);
    const networkResponse: NetworkResponse = new NetworkResponse('00', '');

    computingTypeList.forEach((computingType: ComputingType) => {
        const req = new NavigationRequest(mapInfo, computingType);
        const navi = new DijkstraNavigationManager(req);

        const response: NavigationResponse = navi.getPath(locations);
        // let response = navi.getPath(origin, destination, destination1);

        response.getPathInfo();
        response.getOrigin();
        response.getFinalDestination();
        response.getWayPoints();

        // console.log('locations', response.totalDistance, response.totalTime, response.locations);
        networkResponse.addResponse(computingType, response);
    });

    return networkResponse;
}

app.post('/v2/find-path', cors(), async (req, res) => {
    const networkRequest: INetworkRequest = req.body;
    const { computingTypeList, locations } = networkRequest;
    const { authorization } = req.headers;
    console.log('received post command');

    // console.log(req.headers.authorization);
    // console.log(locations);
    // console.log(computingTypeList);
    // res.send('Hello World!');
    if (!authorization) return;
    const naviResponse = await getPath(authorization, locations, computingTypeList);
    res.json(naviResponse);
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
