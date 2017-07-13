import { EventData, IEventLogProvider } from './event-log';

export class MemoryProvider implements IEventLogProvider {
    eventLogs: Map<string, MemoryEventLog>;
    _eventLogKeepAlive: MemoryEventLog[];

    constructor() {
        this.eventLogs = new Map();
        this._eventLogKeepAlive = [];
    }

    async provisionEventLog(name: string): Promise<void> {
        const log = new MemoryEventLog(name);
        this._eventLogKeepAlive.push(log);
        this.eventLogs.set(name, log);
        return;
    }

    async eventLogIsProvisioned(name: string): Promise<boolean> {
        return this.eventLogs.has(name);
    }

    async dropEventLog(name: string): Promise<void> {
        this.eventLogs.delete(name);
        return;
    }

    async writeEvent(logName: string, data: EventData): Promise<number> {
        const log = this.eventLogs.get(logName);
        if (!log) {
            throw new Error(`MemoryProvider: Cannot write to unprovisioned event log ${logName}`);
        }

        return log.write(data);
    }

    async readEvent(logName: string, id: number): Promise<EventData | null> {
        const log = this.eventLogs.get(logName);
        if (!log) {
            throw new Error(`MemoryProvider: Cannot read from unprovisioned event log ${logName}`);
        }

        return log.read(id);
    }

    async applyEvents(logName: string, callback: (data: EventData)=>void): Promise<void> {
        const log = this.eventLogs.get(logName);
        if (!log) {
            throw new Error(`MemoryProvider: Cannot apply unprovisioned event log ${logName}`);
        }

        log.apply(callback);
        return;
    }
}

class MemoryEventLog {
    readonly name: string;
    private increment: number;
    private events: EventData[];

    constructor(name: string) {
        this.name = name;
        this.increment = 0;
        this.events = [];
    }

    write(data: EventData): number {
        this.increment++;
        data.id = this.increment;
        this.events.push(data);

        return this.increment;
    }

    read(id: number): EventData | null {
        const event = this.events.find(e => e.id === id);
        return event || null;
    }

    apply(callback: (data: EventData)=>void) {
        this.events.forEach(data => callback(data));
    }
}