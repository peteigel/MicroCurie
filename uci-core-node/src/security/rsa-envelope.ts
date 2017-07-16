import * as RSA from './rsa';
import * as crypto from 'crypto';
import { promisify } from 'util';

export class RSAEnvelope {
    senderKey: RSA.PublicKey | null = null;
    recipientKey: RSA.PublicKey | null = null;
    encryptedData: Buffer | null = null;
    encryptedDataKey: Buffer | null = null;

    constructor() {

    }

    serialize() {
        if (!this.recipientKey) {
            throw new Error('RSAEnvelope: No recipient specified.');
        }

        if (!this.encryptedData || !this.encryptedDataKey) {
            throw new Error('RSAEnvelope: No data found.');
        }

        if (!this.senderKey) {
            throw new Error('RSAEnvelope: No sender specified');
        }

        return {
            key: this.encryptedDataKey.toString('base64'),
            to: this.recipientKey.key,
            from: this.senderKey.key,
            data: this.encryptedData.toString('base64')
        };
    }

    parse(data: any): this {
        this.encryptedDataKey = Buffer.from(data.key, 'base64');
        this.encryptedData = Buffer.from(data.data, 'base64');
        this.recipientKey = data.to;
        this.senderKey = data.from;
        return this;
    }

    async pack(to: RSA.PublicKey, from: RSA.PublicKey, data: any): Promise<void> {
        this.senderKey = from;
        this.recipientKey = to;
        const dataKey = await promisify(crypto.randomBytes)(64);
        console.log('PACKED_KEY', dataKey);

        this.encryptedDataKey = to.encryptBuffer(dataKey);

        const cipher = crypto.createCipher('aes192', dataKey);
        const plainText = JSON.stringify(data);
        await promisify(cipher.write.bind(cipher))(plainText);
        cipher.end();

        this.encryptedData = cipher.read() as Buffer;
        return;
    }

    async unpack(privateKey: RSA.PrivateKey): Promise<any> {
        if (!this.encryptedData || !this.encryptedDataKey) {
            return null;
        }

        const dataKey = privateKey.decryptBuffer(this.encryptedDataKey);
        const cipher = crypto.createDecipher('aes192', dataKey);
        await promisify(cipher.write.bind(cipher))(this.encryptedData);
        cipher.end();
        const plainText = cipher.read() as Buffer;
        return JSON.parse(plainText.toString('utf8'));
    }
}
