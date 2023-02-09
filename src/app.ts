import express, { Request, Response, NextFunction } from 'express';
import { fetchmap } from './manager/network';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const port = 8087;

app.use(bodyParser.json()); // use() 를 통해 연결 시킨다! (사용하기 위해)

app.get('/', (req: Request, res: Response) => {
    //   console.log(req);
    console.log('received get command ');
    res.send('Hello JS World!');
    fetchmap(3);
});

app.get('/api/user/:id', (req, res) => {
    const { id } = req.params;
    //   console.log(req);
    console.log(req.params);
    console.log(id);
    res.json({ id });
});

app.post('/v2/find-path', (req, res) => {
    const { computingTypeList } = req.body;
    const locations = req.body.locations;
    console.log('received post command');

    console.log(req.headers.authorization);
    console.log(locations);
    console.log(computingTypeList);
    res.send('Hello World!');
    if (req.headers.authorization) getMapAxios(req.headers.authorization);
});

async function getMapAxios(token: string) {
    const response = await axios.get('https://api.dabeeomaps.com/v2/map?t=JS', {
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
    });
    const data = JSON.stringify(response.data);
    console.log(data);
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
