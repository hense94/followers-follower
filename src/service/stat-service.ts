import fetch from 'node-fetch';
import {Stats} from "../model/stats";
import {Account} from "../model/account";
import {DateTime, Duration} from "luxon";
import {writePoints} from "./influx-service";
import {Service} from "../config/service-registry";
import {Point} from "@influxdata/influxdb-client";

export const statsService: Service = {
    name: 'IG stats',
    initFunction: initService,
    destructFunction: async () => {},
    environmentVariables: [
        'IG_HANDLES',
        'IG_CYCLE_DUR_SEC',
        'IG_JITTER_SEC',
        'IG_COOKIE'
    ]
}

const accounts: Account[] = [];
let timeBetweenAccounts: Duration;
let jitterTime;
const options: RequestInit = {
    headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
    }
};

export function accountJob(): void {
    const now: DateTime = DateTime.now();

    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const previousAccount = accounts[i === 0 ? accounts.length - 1 : i - 1]

        if (account.nextTime <= now) {
            getStats(account.handle)
                .then(
                    stats => writeStats(stats),
                    reason => console.warn('Failed to get stats from IG.', reason)
                );

            account.nextTime = previousAccount.nextTime.plus(timeBetweenAccounts).plus(randomJitter(jitterTime));
        }
    }
}

function initService(): Promise<void> {
    const handles: string[] = JSON.parse(process.env.IG_HANDLES);
    const fullUpdateCycle: Duration = Duration.fromObject({seconds: parseInt(process.env.IG_CYCLE_DUR_SEC)});
    jitterTime = parseInt(process.env.IG_JITTER_SEC);
    options.headers['cookie'] = process.env.IG_COOKIE;

    const now: DateTime = DateTime.now();
    timeBetweenAccounts = Duration.fromObject({seconds: fullUpdateCycle.as("seconds") / (handles.length)});

    let nextTime = now.plus(timeBetweenAccounts).plus(randomJitter(jitterTime));
    for (const handle of handles) {
        accounts.push({
            handle,
            nextTime
        });

        nextTime = nextTime.plus(timeBetweenAccounts).plus(randomJitter(jitterTime));
    }


    return Promise.resolve();
}

function writeStats(stats: Stats): Promise<void> {
    const timestamp: DateTime = DateTime.now();

    if (process.env.DEBUG) {
        console.log(timestamp.toISO(), stats)
    }

    const points: Point[] = ['followers', 'following', 'posts']
        .map(measurementName => {
            return new Point(measurementName)
                .tag('handle', stats.handle)
                .floatField('value', stats[measurementName])
                .timestamp(timestamp.toSeconds());
        });

    return writePoints(points);
}

function randomJitter(max: number): Duration {
    return Duration.fromObject({
        seconds: Math.round(Math.random() * 2 * max - max)
    });
}

const patterns: Record<string, RegExp> = {
    followers: /"edge_followed_by":{"count":(\d*)}/,
    following: /"edge_follow":{"count":(\d*)}/,
    posts: /"edge_owner_to_timeline_media":{"count":(\d*),/,
}

async function getStats(handle: string): Promise<Stats> {
    const url = `https://www.instagram.com/${handle}/`;
    return fetch(url, options)
        .then(response => response.url === url ? response.text() : Promise.reject(`Redirected to ${response.url}`))
        .then(text => {
            const results = {};

            for (let key of Object.keys(patterns)) {
                const match = patterns[key].exec(text);
                if (match) {
                    results[key] = parseInt(match[1]);
                }
            }

            return {
                handle,
                ...results
            };
        });
}