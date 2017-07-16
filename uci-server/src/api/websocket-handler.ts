import * as SocketIO from 'socket.io';
import * as http from 'http';
import { logger } from 'uci-core-node/dist/logger';

export type AuthenticationFlow = (socket: SocketIO.Socket) => Promise<boolean>;

export class WebSocketHandler {
    private nsp: SocketIO.Namespace;
    private sockets: Map<string, SocketIO.Socket>;
    private authenticationFlow: AuthenticationFlow | null;

    constructor(nsp: SocketIO.Namespace) {
        this.nsp = nsp;
        this.sockets = new Map();
        this.authenticationFlow = null;

        this.nsp.on('connection', this.handleConnection.bind(this));
    }

    registerAuthenticationFlow(fn: AuthenticationFlow) {
        this.authenticationFlow = fn;
    }

    getConnection(id: string) {
        return this.sockets.get(id);
    }

    handleConnection(socket: SocketIO.Socket) {
        console.log('WS_CONNECT');
        this.sockets.set(socket.id, socket);

        socket.on('disconnect', () => {
            this.sockets.delete(socket.id);
        });

        if (this.authenticationFlow) {
            this.authenticationFlow(socket)
                .then(authenticated => {
                    if (authenticated) {
                        socket.emit('authentication-success');
                    } else {
                        socket.emit('authentication-failure');
                        socket.disconnect();
                    }
                }).catch(err => {
                    logger.warn('Exception thrown during WebSocket Authentication', { err });
                    socket.emit('authentication-failure');
                    socket.disconnect();
                });
        }
    }
}
