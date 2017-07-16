import { API } from './api';
import { ApplicationState } from '../state/state';
import { CreateAgentCommand } from './agent/create';
import { ListAgentsQuery } from './agent/list';
import { RegenerateServerKeyCommand } from './server/regenerate-key';

export function registerHandlers(api: API, state: ApplicationState) {
    api.registerCommandHandler(new CreateAgentCommand(state));
    api.registerCommandHandler(new ListAgentsQuery(state));
    api.registerCommandHandler(new RegenerateServerKeyCommand(state));
}