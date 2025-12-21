import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SimulationService } from './simulation.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'simulation',
})
export class SimulationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(SimulationGateway.name);
    private activeStreams: Map<string, any> = new Map();

    constructor(private readonly simulationService: SimulationService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        // Cleanup streams if any
        this.activeStreams.forEach((stream, id) => {
            // Logic to kill stream if no clients are listening could go here
        });
    }

    @SubscribeMessage('subscribe-logs')
    async handleSubscribeLogs(
        @MessageBody() data: { slug: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { slug } = data;
        this.logger.log(`Client ${client.id} subscribed to logs for ${slug}`);
        client.join(slug);

        // Start streaming if not already
        this.simulationService.streamSimulationLogs(slug, (logLine) => {
            this.server.to(slug).emit('log-update', logLine);
        });
    }
}
