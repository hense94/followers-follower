import {accountJob, statsService} from "./service/stat-service";
import {destructServices, initServices, registerService} from "./config/service-registry";
import {influxService} from "./service/influx-service";
import {createScheduleService} from "./service/schedule-service";

registerService(statsService)
registerService(influxService);
registerService(createScheduleService(accountJob));

initServices();

process.on('SIGINT', handleTermination);
process.on('SIGTERM', handleTermination);

function handleTermination(args) {
    console.info(`Received ${args} shutting down`);
    destructServices()
        .then(() => process.exit(0));
}

