import * as uuid from 'uuid/v1';
import { EventData } from '../../persistence/event-log';
import { IEndpoint, IEndpointHandler } from '../endpoint';
import { ApplicationState } from '../../state/state';
import { generateAgentSecret } from '../../util/generate-agent-secret';

class CreateAgentCommandHandler implements IEndpointHandler {
    private state: ApplicationState;
    agentId: string;
    name: string;
    secret: string;

    constructor(state: ApplicationState) {
        this.state = state;
    }

    parse(requestBody: any) {
        this.name = requestBody.name;
    }

    validate(requestBody: any): string | null {
        if (!requestBody.name) {
            return 'Must provide name';
        }

        if (this.state.agents.getByName(requestBody.name)) {
            return 'Name must be unique';
        }

        return null;
    }

    async execute(): Promise<any> {
        this.agentId = uuid();
        this.secret = await generateAgentSecret();
        
        const data = {
            agentId: this.agentId,
            name: this.name,
            secret: this.secret
        };

        const event = {
            type: 'agent/create-agent',
            data,
            id: null
        } as EventData;

        await this.state.eventStream.write(event);
        return data;
    }
}

export class CreateAgentCommand implements IEndpoint {
    private state: ApplicationState;

    constructor(state: ApplicationState) {
        this.state = state;
    }

    params() {
        return {
            route: '/agent/create-agent'
        };
    }

    createHandler() {
        return new CreateAgentCommandHandler(this.state);
    }
}