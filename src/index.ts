import fetch from 'node-fetch';
import {Stats} from "./model/stats";
import {getStats} from "./service/stat-service";
import {DateTime, Duration, Interval} from "luxon";
import {Account} from "./model/account";

const schedule = require('node-schedule');

const accounts: Account[] = [
    {
        handle: 'fantastiskefroe.dk',
        nextTime: null
    },
    {
        handle: 'spirekassen',
        nextTime: null
    },
    {
        handle: 'froesnapperen',
        nextTime: null
    }
];

const fullUpdateCycle = Duration.fromObject({seconds: 30});
const timeBetweenAccounts = Duration.fromObject({seconds: fullUpdateCycle.as("seconds") / (accounts.length)});

initAccounts();

const job = schedule.scheduleJob('* * * * * *', () => {
    const now: DateTime = DateTime.now();

    for (let i = 0; i < accounts.length; i++){
        const account = accounts[i];
        const previousAccount = accounts[i === 0 ? accounts.length - 1 : i - 1]

        if (account.nextTime <= now) {
            getStats(account.handle)
                .then(stats => {
                    console.log(now.toISO(), stats);
                })

            account.nextTime = previousAccount.nextTime.plus(timeBetweenAccounts).plus(randomJitter(5));
        }
    }
});

function initAccounts(): void {
    const now: DateTime = DateTime.now();
    let nextTime = now.plus(timeBetweenAccounts).plus(randomJitter(5));

    for (let i = 0; i < accounts.length; i++) {
        accounts[i].nextTime = nextTime;
        nextTime = nextTime.plus(timeBetweenAccounts).plus(randomJitter(5));
    }
}

function randomJitter(max: number = 0): Duration {
    return Duration.fromObject({
        seconds: Math.round(Math.random() * 2 * max - max)
    });
}

process.on('SIGINT', () => {
    schedule.gracefulShutdown()
        .then(() => process.exit(0))
});
