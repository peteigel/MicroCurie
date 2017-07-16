import * as childProcess from 'child_process';
import * as crypto from 'crypto';

export class PublicKey {
    readonly key: string;
    private fingerpintCache: string | null;

    constructor(key: string, fingerprint: string | null = null) {
        this.key = key;
        this.fingerpintCache = fingerprint;
    }

    encryptJSON(data: any): Buffer {
        const plainBuf = new Buffer(JSON.stringify(data), 'utf8');
        return this.encryptBuffer(plainBuf);
    }

    encryptBuffer(data: Buffer): Buffer {
        return crypto.publicEncrypt(this.key, data);
    }

    fingerprint(): string {
        if (this.fingerpintCache) {
            return this.fingerpintCache;
        }

        const hasher = crypto.createHash('sha256');
        hasher.update(this.key);
        this.fingerpintCache = hasher.digest('hex');

        return this.fingerpintCache;
    }
}

export class PrivateKey {
    readonly key: string;

    constructor(key: string) {
        this.key = key;
    }

    decryptBuffer(buffer: Buffer): Buffer {
        return crypto.privateDecrypt(this.key, buffer);
    }

    decryptJSON(buffer: Buffer): any {
        return JSON.parse(this.decryptBuffer(buffer).toString('utf8'));
    }
}

export type KeyPair = {
    publicKey: PublicKey,
    privateKey: PrivateKey
};

export type OpenSSLOptions = {
    command?: string,
    timeout?: number
};

export async function generatePrivateKey(bytes = 2048, options?: OpenSSLOptions) {
    const key = await openssl(['genrsa', `${bytes}`], undefined, options);
    return new PrivateKey(key);
}

export async function generatePublicKey(privateKey: PrivateKey, options?: OpenSSLOptions) {
    const key = await openssl(['rsa', '-pubout'], privateKey.key, options); 
    return new PublicKey(key);
}

export async function generateKeyPair(bytes = 2048, options?: OpenSSLOptions) {
    const privateKey = await generatePrivateKey(bytes, options);
    const publicKey = await generatePublicKey(privateKey, options);
    return { privateKey, publicKey };
}


function openssl(
    args: string[] = [],
    input?: string,
    options?: OpenSSLOptions
): Promise<string> {
    let _options = {
        command: 'openssl',
        timeout: 5000
    };

    if (options) {
        _options = {
            ..._options,
            ...options
        };
    }
    return new Promise<string>((resolve, reject) => {
        const proc = childProcess.spawn(_options.command, args);
        const timeoutHandle = setTimeout(() => {
            reject(new Error(`openssl(): Timeout Reached (${_options.timeout} ms)`));
        }, _options.timeout);
        
        proc.on('exit', (code, signal) => {
            clearTimeout(timeoutHandle);

            if (code === 0) {
                resolve(proc.stdout.read().toString('utf8'))
            } else {
                reject(new Error(signal));
            }
        });

        if (input) {
            proc.stdin.write(input);
        }
    });
}