import { EventData } from 'uci-core-node/dist/persistence/event-log';
import { EventStream } from 'uci-core-node/dist/event-stream'; 
import * as RSA from 'uci-core-node/dist/security/rsa';

export class ServerKeyProjection {
    keyPair: RSA.KeyPair | null;
    lastUpdated: number;
    private eventSream: EventStream;

    constructor(eventSream: EventStream) {
        this.eventSream = eventSream;
        this.keyPair = null;
        this.eventSream.on('server-key/update-key', this.handleUpdateKeyPair.bind(this));
    }

    handleUpdateKeyPair(data: EventData) {
        const privateKey = new RSA.PrivateKey(data.data.privateKey);
        const publicKey = new RSA.PublicKey(data.data.publicKey);
        this.keyPair = { privateKey, publicKey };
    }
}