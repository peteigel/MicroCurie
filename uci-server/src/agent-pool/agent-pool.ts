import { WebSocketHandler } from '../api/websocket-handler';
import { ApplicationState } from '../state/state';
import * as SocketIO from 'socket.io';
import { RSAEnvelope } from 'uci-core-node/dist/security/rsa-envelope';

const timeout = 5000;

export class AgentPool {
    ws: WebSocketHandler;
    state:  ApplicationState

    constructor(nsp: SocketIO.Namespace, state: ApplicationState) {
        this.state = state;
        this.ws = new WebSocketHandler(nsp);
        this.ws.registerAuthenticationFlow(this.handleAuth.bind(this));
    }

    handleAuth(socket: SocketIO.Socket): Promise<boolean> {
        if (!this.state.serverKey.keyPair) {
            throw new Error('Authentication not possible. Server has no key.');
        }

        const serverKey = this.state.serverKey.keyPair;

        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                resolve(false);
            }, timeout);

            socket.emit('begin-auth', {
                serverKey: serverKey.publicKey.key
            });

            socket.once('auth-resonse', async (raw) => {
                const env = new RSAEnvelope().parse(raw);
                // TODO: actual authentication flow
                const d = await env.unpack(serverKey.privateKey);
                console.log(d);
                resolve(true);
            });
        });
    }
}
