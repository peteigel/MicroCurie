import * as SocketIOClient from 'socket.io-client';
import * as RSA from 'uci-core-node/dist/security/rsa';
import { RSAEnvelope } from 'uci-core-node/dist/security/rsa-envelope';

export class RSAWebSocket {
    private socket: SocketIOClient.Socket;
    private identity: RSA.KeyPair;
    private remoteKey: RSA.PublicKey | null;
    private verifyCallback: (key: RSA.PublicKey) => Promise<boolean>;

    constructor(
        socket: SocketIOClient.Socket,
        identity: RSA.KeyPair,
        verify = (key: RSA.PublicKey) => { return Promise.resolve(true); }
    ) {
        this.socket = socket;
        this.identity = identity;
        this.remoteKey = null;
        this.verifyCallback = verify;

        this.socket.on('begin-auth', this.handleAuth.bind(this));
        this.socket.on('connect', () => console.log('WS_CONNECT_SUCCESS'));
        this.socket.on('connect_error', (e: any) => console.warn('WS_CONNECT_ERR', e));
        this.socket.open();
    }

    async handleAuth(data: any) {
        console.log('D');
        if (!data.serverKey) {
            this.socket.close();
            return;
        }

        let validKey = false;

        if (this.remoteKey) {
            validKey = this.remoteKey.matches(data.serverKey);
        } else {
            validKey = await this.verifyCallback(data.serverKey);
        }

        if (!validKey) {
            this.socket.close();
            return;
        }

        this.remoteKey = new RSA.PublicKey(data.serverKey);

        this.emit('auth-response', {
            name: 'test-agent',
            key: this.identity.publicKey.key
        });
    }

    async emit(event: string, data: any) {
        const env = new RSAEnvelope();

        if (!this.remoteKey) {
            throw new Error('Cannot emit event. Authentication has not yet occured.');
        }

        await env.pack(this.remoteKey, this.identity.publicKey, data);
        this.socket.emit(event, env.serialize());
    }

    on(event: string, callback: (data: any) => void) {
        this.socket.on(event, async (data: any) => {
            const env = new RSAEnvelope();
            env.parse(data);
            if (
                this.remoteKey &&
                env.senderKey &&
                env.recipientKey &&
                this.remoteKey.matches(env.senderKey) &&
                this.identity.publicKey.matches(env.recipientKey)
            ) {
                const plaintextData = await env.unpack(this.identity.privateKey);
                callback(plaintextData);
            } else {

            }
        });
    }
}
