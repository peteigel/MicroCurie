import * as SocketIOClient from 'socket.io-client';

export class WebSocketConnection {
    io: SocketIOClient.Socket;

    constructor(url: string) {
        this.io = SocketIOClient(url);
    }
}