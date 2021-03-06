import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import { logger } from 'uci-core-node/dist/logger';
import { IEndpoint } from './endpoint';
import { WebSocketHandler } from './websocket-handler'

export class API {
    server: http.Server;
    app: express.Application;
    io: SocketIO.Server;
    port: number;

    constructor(port: number) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = SocketIO(this.server, {
            path: '/ws'
        });

        this.app.use(bodyParser.json());
        this.port = port;

        this.app.get('/health', (req, res) => {
            res.end('OK.')
        });
    }

    registerCommandHandler(endpoint: IEndpoint) {
        const params = endpoint.params();
        this.app.post(params.route, this.handleEndpoint.bind(this, endpoint));
    }

    createWebSocketNamespace(nsp: string) {
        return this.io.of(nsp);
    }

    handleEndpoint(
        endpoint: IEndpoint,
        request: express.Request,
        response: express.Response
    ) {
        logger.access(request.path);
        const handleEndpoint = endpoint.createHandler();

        if (!request.is('json')) {
            logger.warn('Non-JSON Body', { path: request.path });
            response.statusCode = 400;
            response.end('Bad Request: non-JSON content-type.');
            return;
        }

        let validationError;

        try {
            validationError = handleEndpoint.validate(request.body);
        } catch (e) {
            validationError = 'Unexpected Validation Error';
            logger.error('Exception Caught during Validation', { error: e.toString(), stack: e.stack } );
        }

        if (validationError) {
            logger.info('Validation Failure', { path: request.path, error: validationError });
            response.statusCode = 400;
            response.end(`Bad Request: ${validationError}`);
            return;
        }

        try {
            handleEndpoint.parse(request.body);
        } catch(e) {
            logger.error('Request Parse', { path: request.path, error: e });
            response.statusCode = 500;
            response.end('Internal Server Error: Could not parse request input');
            return;
        }

        handleEndpoint.execute().then(data => {
            response.json(data);
            response.end();
        }).catch(e => {
            logger.error('Request Execution', { path: request.path, error: e});
            response.statusCode = 500;
            response.end('Internal Server Error: Request execution failed');
        });
    }

    listen() {
        return new Promise<void>(resolve => {
            this.server.listen(this.port, resolve);
        });
    }
}
