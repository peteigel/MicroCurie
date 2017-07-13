import { promisify } from 'util';
import * as crypto from 'crypto';

export async function generateAgentSecret(): Promise<string> {
    const randomBytes = promisify(crypto.randomBytes);
    const bytes = await randomBytes(256);
    return bytes.toString('hex') as string;
}
