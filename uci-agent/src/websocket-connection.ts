import * as SocketIOClient from 'socket.io-client';

export class WebSocketConnection {
    io: SocketIOClient.Manager;

    constructor(url: string) {
        this.io = new SocketIOClient.Manager(url, {
            path: '/ws'
        });
    }

    connect(name: string): SocketIOClient.Socket {
        return this.io.socket(name);
    }
}
