import { API } from './api';
import { ApplicationState } from '../state/state';
import { CreateAgentCommand } from './agent/create';
import { ListAgentsQuery } from './agent/list';

export function registerHandlers(api: API, state: ApplicationState) {
    api.registerCommandHandler(new CreateAgentCommand(state));
    api.registerCommandHandler(new ListAgentsQuery(state));
}