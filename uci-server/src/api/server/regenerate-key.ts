import { ApplicationState } from '../../state/state';
import { EventData } from 'uci-core-node/dist/persistence/event-log';
import { IEndpoint, IEndpointHandler } from '../endpoint';
import * as RSA from 'uci-core-node/dist/security/rsa';

export class RegenerateServerKeyCommand implements IEndpoint {
    private state: ApplicationState;

    constructor (state: ApplicationState) {
        this.state = state;
    }

    params() {
        return {
            route: '/server/regenerate-key'
        };
    }

    createHandler() {
        return new RegenerateServerKeyCommandHandler(this.state);
    }
}

export class RegenerateServerKeyCommandHandler implements IEndpointHandler {
    private state: ApplicationState;

    constructor(state: ApplicationState) {
        this.state = state;
    }

    parse(data: any) {}
    validate() { return null; }

    async execute() {
        const keyPair = await RSA.generateKeyPair();
        const keyData = {
            privateKey: keyPair.privateKey.key,
            publicKey: keyPair.publicKey.key
        };

        await this.state.eventStream.write({
            id: null,
            type: 'server-key/update-key',
            data: keyData
        });

        return keyData;
    }
}