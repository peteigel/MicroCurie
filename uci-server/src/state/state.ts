import { EventLog } from 'uci-core-node/dist/persistence/event-log';
import { EventStream } from 'uci-core-node/dist/event-stream';
import { AgentsProjection } from './projection/agents';
import { ServerKeyProjection } from './projection/server-key';

export class ApplicationState {
    private eventLog: EventLog;
    readonly eventStream: EventStream;
    readonly agents: AgentsProjection;
    readonly serverKey: ServerKeyProjection;

    constructor(eventLog: EventLog) {
        this.eventLog = eventLog;
        this.eventStream = new EventStream(eventLog);
        
        this.agents = new AgentsProjection(this.eventStream);
        this.serverKey = new ServerKeyProjection(this.eventStream);
    }

    async initialize() {
        await this.eventStream.applyLog();
        return;
    }
}