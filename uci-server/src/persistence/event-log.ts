export interface IEventLogProvider {
    provisionEventLog(name: string): Promise<void>;
    eventLogIsProvisioned(name: string): Promise<boolean>;
    dropEventLog(name: string): Promise<void>;

    writeEvent(log: string, data: EventData): Promise<number>;
    readEvent(log: string, id: number): Promise<EventData | null>;
    applyEvents(log: string, callback: (data: EventData)=>void): Promise<void>;
}

export type EventData = {
    id: number | null,
    type: string,
    data: any,
    timestamp?: string
};

export class EventLog {
    private provider: IEventLogProvider;
    readonly name: string;
    
    constructor(name: string, provider: IEventLogProvider) {
        this.provider = provider;
        this.name = name;
    }

    async open() {
        const isProvisioned = await this.provider.eventLogIsProvisioned(this.name);
        if (!isProvisioned) {
            await this.provider.provisionEventLog(this.name);
            return true;
        }

        return false;
    }

    async write(event: EventData) {
        const id = await this.provider.writeEvent(
            this.name,
            event
        );

        return id;
    }

    async read(id: number) {
        return this.provider.readEvent(this.name, id);
    }

    async apply(callback: (event: EventData)=>void) {
        await this.provider.applyEvents(this.name, callback);
    }
}