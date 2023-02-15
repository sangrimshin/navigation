import axios from 'axios';
import qs from 'qs';

const dotenv = require('dotenv');

dotenv.config(); // .env 파일을 읽어온다.

async function getToken(): Promise<any> {
    let resultData;
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
            // console.log(response.data);
            resultData = response.data;
        })
        .catch((error) => {
            console.log(error);
        });
    return resultData;
}

export async function getPathRequest() {
    let result;
    const authRes = await getToken();
    // console.log(authRes);
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
        computingTypeList: ['recommendation'],
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `http://localhost:${process.env.PORT}/v2/find-path?t=JS`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        data,
    };

    await axios(config)
        .then((response) => {
            // console.log(response.data);
            result = response.data;
        })
        .catch((error) => {
            console.log(error);
        });
    // console.log(result);
    return result;
}
