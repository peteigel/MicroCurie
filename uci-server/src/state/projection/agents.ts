import { EventData } from '../../persistence/event-log';
import { EventStream } from '../event-stream'; 

export type AgentData = {
    agentId: string,
    name: string,
    secret: string,
    lastUpdated: number,
    created: number
};

export class AgentsProjection {
    private eventStream: EventStream;
    private agents: Map<string, AgentData>;
    private agentNames: Map<string, string>;

    constructor(eventStream: EventStream) {
        this.agents = new Map();
        this.agentNames = new Map();
        this.eventStream = eventStream;
        this.eventStream.on('agent/create-agent', this.handleCreateAgent.bind(this));
    }
    
    getById(agentId: string) {
        return this.agents.get(agentId) || null;
    }

    getByName(agentName: string) {
        const id = this.agentNames.get(agentName);
        if (!id) { return null; }
        return this.agents.get(id);
    }

    getAgents() {
        return Array.from(this.agents.values());
    }

    handleCreateAgent(event: EventData) {
        this.agents.set(event.data.agentId, {
            ...event.data,
            lastUpdated: event.id,
            created: event.id
        });

        this.agentNames.set(event.data.name, event.data.agentId);
    }
}