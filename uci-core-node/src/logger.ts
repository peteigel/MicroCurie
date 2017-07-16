export interface ILogger {
    access(desc: string, data?: any): void;
    info(desc: string, data?: any): void;
    warn(desc: string, data?: any): void;
    error(desc: string, data?: any): void;
}

export enum LogLevel { NONE, ERROR, WARN, INFO, ACCESS };

export class StdOutLogger implements ILogger {
    private logLevel = LogLevel.ACCESS;

    setLogLevel(level: LogLevel) {
        this.logLevel = level;
    }

    access(desc: string, data?: any) {
        if (this.logLevel >= LogLevel.ACCESS) {
            console.log(this.makeString('ACC', desc, data));
        }
    }

    info(desc: string, data?: any) {
        if (this.logLevel >= LogLevel.INFO) {
            console.log(this.makeString('INFO', desc, data));
        }
    }

    warn(desc: string, data?: any) {
        if (this.logLevel >= LogLevel.WARN) {
            console.warn(this.makeString('WARN', desc, data));
        }
    }

    error(desc: string, data?: any) {
        if (this.logLevel >= LogLevel.ERROR) {
            console.error(this.makeString('ERROR', desc, data));
        }
    }

    private makeString(level: string, desc: string, data: any): string {
        try {
            let ret = `${new Date().toISOString()}\t[${level}]\t${desc}`;
            
            if (data !== undefined) {
                ret = `${ret}\n${JSON.stringify(data, undefined, 4)}`;
            }

            return ret;
        } catch (e) {
            return this.makeString('ERROR', 'Logging Error', e);
        }
    }
}

export const logger = new StdOutLogger();