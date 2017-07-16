import { EventData } from 'uci-core-node/dist/persistence/event-log';
import { IEndpoint, IEndpointHandler } from '../endpoint';
import { ApplicationState } from '../../state/state';

export class ListAgentsQueryHandler implements IEndpointHandler {
    private state: ApplicationState;

    constructor(state: ApplicationState) {
        this.state = state;
    }

    parse(data: any) {}

    validate(data: any) { return null; }

    async execute() {
        const agents = this.state.agents.getAgents();
        return agents.map(agent => ({
            agentId: agent.agentId,
            name: agent.name
        }));
    }
}

export class ListAgentsQuery implements IEndpoint {
    state: ApplicationState;

    constructor(state: ApplicationState) {
        this.state = state;
    }

    params() {
        return {
            route: '/agent/list-agents'
        }
    }

    createHandler() {
        return new ListAgentsQueryHandler(this.state);
    }
}