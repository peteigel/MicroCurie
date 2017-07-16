import { WebSocketConnection } from './websocket-connection';
import { RSAWebSocket } from './rsa-websocket';
import * as RSA from 'uci-core-node/dist/security/rsa';

export class MicroCurieAgent {
    io: WebSocketConnection;
    agentConnection: RSAWebSocket;

    constructor(config: MicroCurieAgentConfig) {
        this.io = new WebSocketConnection(config.url);
        this.agentConnection = new RSAWebSocket(this.io.connect('/agent-connect'), config.identity);
    }
}

export type MicroCurieAgentConfig = {
    url: string,
    name: string,
    identity: RSA.KeyPair
};

async function getConfig() {
    return {
        url: 'http://localhost:5555',
        name: 'test-agent',
        identity: await RSA.generateKeyPair()
    };
}

let instance;

getConfig().then(config => {
    console.log('B');
    instance = new MicroCurieAgent(config);
    console.log('C');
});
