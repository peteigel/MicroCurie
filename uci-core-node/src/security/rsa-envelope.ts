import * as RSA from './rsa';

export class RSAEnvelope {
    senderKey: RSA.PublicKey | null = null;
    recipientKey: RSA.PublicKey | null = null;
    encryptedData: any = undefined;

    serialize() {
        if (!this.recipientKey) {
            throw new Error('RSAEnvelope: No recipient specified.');
        }

        if (!this.encryptedData) {
            throw new Error('RSAEnvelope: No data found.');
        }

        if (!this.senderKey) {
            throw new Error('RSAEnvelope: No sender specified');
        }

        return {
            to: this.recipientKey.key,
            from: this.senderKey.key,
            data: this.encryptedData
        };
    }

    parse(data: any): this {
        this.encryptedData = data.data;
        this.recipientKey = data.to;
        this.senderKey = data.from;
        return this;
    }

    pack(to: RSA.PublicKey, from: RSA.PublicKey, data: any): this {
        this.senderKey = from;
        this.recipientKey = to;

        this.encryptedData = to.encryptJSON(data).toString('base64');
        
        return this;
    }

    unpack(privateKey: RSA.PrivateKey): any {
        if (!this.encryptedData) {
            return null;
        }
        
        privateKey.decryptJSON(this.encryptedData);
    }
}