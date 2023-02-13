import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import qs from 'qs';
import { NavigationRequest } from './domain/NavigationRequest';
import { ComputingType } from './domain/ComputingType';
import { DijkstraNavigationManager } from './manager/DijkstraNavigationManager';
import { ILocation } from './domain/ILocation';
import { NavigationResponse } from './domain/NavigationResponse';

const app = express();
const port = 8087;

async function getToken(): Promise<any> {
    let responseData;
    const clientId = '75hb8YSnAokb-sZ04aDR91';
    const clientSecret = '0f7ad84f160c7b3fd1849a7920af718b';
    const auth = Buffer.from(`${clientId}:${clientSecret}`, 'binary').toString('base64');

    const data = qs.stringify({
        grant_type: 'client_credentials',
    });
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://ims-oauth-develop3.dabeeomaps.com/oauth/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
        },
        data,
    };

    await axios(config)
        .then((response) => {
            console.log(response.data);
            responseData = response.data;
        })
        .catch((error) => {
            console.log(error);
        });
    return responseData;
}

async function getPathRequest() {
    const authRes = await getToken();
    console.log(authRes);
    const accessToken = authRes.access_token;
    const data = JSON.stringify({
        locations: [
            {
                poiId: 'PO-4JvSQCWHC2270',
                floorId: 'FL-t4vqgyek3jnb8146',
            },
            {
                poiId: 'PO-M02DvTVjp8449',
                floorId: 'FL-t4vqgyek3jnb8146',
            },
        ],
        computingTypeList: ['RECOMMENDATION'],
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:8087/v2/find-path?t=JS',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        data,
    };

    axios(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
}

getPathRequest();

app.use(express.json()); // use() 를 통해 연결 시킨다! (사용하기 위해)

app.get('/', (req: Request, res: Response) => {
    //   console.log(req);
    console.log('received get command ');
    res.send('Hello JS World!');
});

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
    console.dir(response.data.payload);
    return response.data.payload;
    // console.log(data);
}

async function getPath(locations: ILocation[], computingType: ComputingType, authoization: string): Promise<NavigationResponse> {
    const mapInfo = await getMapAxios(authoization);
    const req = new NavigationRequest(mapInfo, ComputingType.RECOMMENDATION);
    const navi = new DijkstraNavigationManager(req);

    const response: NavigationResponse = navi.getPath(locations);
    // let response = navi.getPath(origin, destination, destination1);

    response.getPathInfo();

    response.getOrigin();

    response.getFinalDestination();

    response.getWayPoints();

    console.log('locations', response.totalDistance, response.totalTime, response.locations);
    return response;
}

app.post('/v2/find-path', async (req, res) => {
    const { computingTypeList, locations } = req.body;
    const { authorization } = req.headers;
    console.log('received post command');

    console.log(req.headers.authorization);
    console.log(locations);
    console.log(computingTypeList);
    // res.send('Hello World!');
    if (!authorization) return;
    const naviResponse = await getPath(locations, computingTypeList, authorization);
    res.json(naviResponse);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
