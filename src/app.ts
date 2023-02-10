import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { NavigationRequest } from './domain/NavigationRequest';
import { ComputingType } from './domain/ComputingType';
import { DijkstraNavigationManager } from './manager/DijkstraNavigationManager';
import { ILocation } from './domain/ILocation';
import { NavigationResponse } from './domain/NavigationResponse';

const app = express();
const port = 8087;

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
