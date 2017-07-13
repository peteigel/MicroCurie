import * as childProcess from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { promisify } from 'util';
import { logger } from '../logger';

export class SSHKeygen {
    readonly executable: string;
    private tempDir: string | null;
    private fileCounter: number;

    constructor(executable: string = 'ssh-keygen') {
        this.executable = executable;
        this.tempDir = null;
        this.fileCounter = 1;
    }

    async getTempDir(): Promise<string> {
        if (!this.tempDir) {
            const baseTempPath = path.resolve(os.tmpdir(), 'uci-');
            return promisify(fs.mkdtemp)(baseTempPath);
        } else {
            return this.tempDir;
        }
    }

    async cleanUp(): Promise<void> {
        if (this.tempDir) {
            await promisify(fs.rmdir)(this.tempDir);
        }
    }

    async generateKeyPair(comment?: string, bytes: number = 2048) {
        const cleanUp = async (keyPath: string) => {
            try {
                await promisify(fs.unlink)(keyPath);
                await promisify(fs.unlink)(`${keyPath}.pub`);
            } catch (e) {
                logger.warn('SSHKeygen.generateKeyPair(): Cleanup failed', { err: e.toString(), keyPath });
            }
        };

        const tempPath = await this.getTempDir();
        const keyPath = path.resolve(tempPath, `key${this.fileCounter}`);
        let keys;

        let keygenArgs = ['-q', '-b', `${bytes}`, '-N', '', '-f', keyPath];
        if (comment) {
            keygenArgs = [...keygenArgs, '-C', comment];
        }

        try {
            await new Promise((resolve, reject) => {
                const keygen = childProcess.spawn(this.executable, keygenArgs);
                keygen.on('exit', (code, signal) => {
                    if (code === 0) { resolve(); }
                    else { reject(signal); }
                });
            });

            keys = await Promise.all([
                promisify(fs.readFile)(keyPath, 'utf-8'),
                promisify(fs.readFile)(`${keyPath}.pub`, 'utf-8')
            ]);
        } catch (e) {
            await cleanUp(keyPath);
            throw e;
        }

        await cleanUp(keyPath);

        return keys;
    }

    async calculateFingerprint(publicKey: string) {
        const cleanUp = async (keyPath: string) => {
            try {
                await promisify(fs.unlink)(keyPath);
            } catch (e) {
                logger.warn('SSHKeygen.calculateFingerprint(): Cleanup failed', { err: e.toString(), keyPath });
            }
        };

        const tempPath = await this.getTempDir();
        const keyPath = path.resolve(tempPath, `key${this.fileCounter}`);

        const keygenArgs = ['-l', '-f', keyPath];
        let fingerprint;

        await promisify(fs.writeFile)(keyPath, publicKey);

        try {
            return new Promise((resolve, reject) => {
                const keygen = childProcess.spawn(this.executable, keygenArgs);
                keygen.on('exit', (code, signal) => {
                    if (code === 0) { 
                        const fingerprint = keygen.stdout.read().toString('utf-8');
                        resolve(fingerprint);
                    } else {
                        reject(signal);
                    }
                });
            });
            
        } catch (e) {
            await cleanUp(keyPath);
            throw e;
        }
    }
}