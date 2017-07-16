import { IEventLogProvider, EventData } from './event-log';
import * as sqlite from 'sqlite3';

export class SQLiteProvider implements IEventLogProvider {
    db: sqlite.Database;

    constructor(filename: string) {
        this.db = new sqlite.Database(filename);
    }

    provisionEventLog(logName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.exec(
                `CREATE TABLE ${logName} (id INTEGER PRIMARY KEY ASC, timestamp DEFAULT CURRENT_TIMESTAMP, type STRING, data STRING);`,
                function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                }
            );
        });
    }

    eventLogIsProvisioned(logName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?;",
                logName,
                function (err, arr) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(arr.length > 0);
                }
            );
        });
    }

    dropEventLog(logName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.exec(
                `DROP TABLE IF EXISTS ${logName};`,
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                }
            )
        });
    }

    writeEvent(logName: string, data: EventData): Promise<number> {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO ${logName} (type, data) VALUES (?, ?);`,
                [data.type, JSON.stringify(data.data)],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(this.lastID);
                }
            );
        });
    }

    readEvent(logName: string, id: number): Promise<EventData> {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT * FROM ${logName} WHERE id = ?;`,
                id,
                function(err, row) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve({
                        id: row.id,
                        type: row.type,
                        timestamp: row.timestamp,
                        data: JSON.parse(row.data)
                    });
                }
            );
        });
    }

    applyEvents(logName: string, callback: (data: EventData)=>void): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.each(
                `SELECT * FROM ${logName} ORDER BY id ASC;`,
                function(err, row) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    callback({
                        id: row.id,
                        type: row.type,
                        timestamp: row.timestamp,
                        data: JSON.parse(row.data)
                    });
                },
                function(err, count) {
                    if (err) {
                        reject(err);
                    }

                    resolve();
                }
            );
        });
    }
}