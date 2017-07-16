import { API } from './api/api';
import { registerHandlers } from './api/register-handlers';
import { EventLog } from 'uci-core-node/dist/persistence/event-log';
import { SQLiteProvider } from 'uci-core-node/dist/persistence/sqlite-provider';
import { ApplicationState } from './state/state';
import { AgentPool } from './agent-pool/agent-pool';
import { config } from './config';
import { logger } from 'uci-core-node/dist/logger';

class Application {
    api: API;
    agentPool: AgentPool;
    eventLog: EventLog;
    state: ApplicationState;

    constructor() {
        this.eventLog = new EventLog('uci_events', new SQLiteProvider('uci.db'));
        this.state = new ApplicationState(this.eventLog);

        this.api = new API(config.port);
        registerHandlers(this.api, this.state);
        this.agentPool = new AgentPool(this.api.createWebSocketNamespace('/agent-connect'), this.state);
    }

    async start() {
        await this.eventLog.open();
        await this.state.initialize();
        await this.api.listen();
        logger.info('Application Started.');
    }
}

const app = new Application();
(global as any).app = app;
app.start();
