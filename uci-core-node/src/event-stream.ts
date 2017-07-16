import { EventLog, EventData } from './persistence/event-log';

export type EventListener = (event: EventData)=>void;

export class EventStream {
    private log: EventLog;
    private eventTypes: Map<string, EventListener[]>;

    constructor(log: EventLog) {
        this.log = log;
        this.eventTypes = new Map();
    }

    on(typeName: string, listener: EventListener) {
        let type = this.eventTypes.get(typeName);
        if (!type) {
            type = [];
            this.eventTypes.set(typeName, type);
        }

        type.push(listener);
    }

    async write(event: EventData) {
        const typeName = event.type;
        const type = this.eventTypes.get(typeName);
        await this.log.write(event);

        if (type) {
            setImmediate(() => {
                type.forEach(cb => cb(event));
            });
        }
    }

    async applyLog() {
        await this.log.apply(event => {
            const typeName = event.type;
            const type = this.eventTypes.get(typeName);

            if (type) {
             type.forEach(cb => cb(event));
            }
        });
    }
}