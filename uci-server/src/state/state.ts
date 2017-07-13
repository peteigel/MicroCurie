import { EventLog } from '../persistence/event-log';
import { EventStream } from './event-stream';
import { AgentsProjection } from './projection/agents';

export class ApplicationState {
    private eventLog: EventLog;
    readonly eventStream: EventStream;
    readonly agents: AgentsProjection;

    constructor(eventLog: EventLog) {
        this.eventLog = eventLog;
        this.eventStream = new EventStream(eventLog);
        
        this.agents = new AgentsProjection(this.eventStream);
    }

    async initialize() {
        await this.eventStream.applyLog();
        return;
    }
}