import {Service} from "../config/service-registry";

const schedule = require('node-schedule');

export function createScheduleService(...scheduledFunctions: (() => void)[]): Service {
    return {
        name: 'Schedule',
        initFunction: () => initSchedule(...scheduledFunctions),
        destructFunction: destructSchedule,
        environmentVariables: []
    };
}

function initSchedule(...scheduledFunctions: (() => void)[]): Promise<void> {
    schedule.scheduleJob('* * * * * *', () => {
        scheduledFunctions
            .forEach((fn) => fn());
    });

    return Promise.resolve();
}

function destructSchedule(): Promise<void> {
    return schedule.gracefulShutdown();
}
