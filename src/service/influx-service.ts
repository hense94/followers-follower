import {InfluxDB, Point, WriteApi} from "@influxdata/influxdb-client";
import {Service} from "../config/service-registry";
import {Stats} from "../model/stats";
import {DateTime} from "luxon";

export const influxService: Service = {
    name: 'InfluxDB',
    initFunction: initInflux,
    destructFunction: destructInflux,
    environmentVariables: [
        'INFLUX_URL',
        'INFLUX_TOKEN',
        'INFLUX_ORG',
        'INFLUX_BUCKET'
    ]
}

export function writePoints(points: Point[]): Promise<void> {
    points
        .forEach(point => influxWriteApi.writePoint(point));

    return influxWriteApi.flush();
}

export function writePoint(point: Point): Promise<void> {
    influxWriteApi.writePoint(point);
    return influxWriteApi.flush();
}

let influxWriteApi: WriteApi;

function initInflux(): Promise<void> {
    const url: string = process.env.INFLUX_URL;
    const token: string = process.env.INFLUX_TOKEN;
    const org: string = process.env.INFLUX_ORG;
    const bucket: string = process.env.INFLUX_BUCKET;

    const influxDB = new InfluxDB({url, token});
    influxWriteApi = influxDB.getWriteApi(org, bucket, 's');

    return Promise.resolve();
}

function destructInflux(): Promise<void> {
    return influxWriteApi.close();
}