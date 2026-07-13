import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/** Socket.IO room name for all connected admin clients. */
const ADMIN_ROOM = 'admins';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  /** userId → socketIds[] map — kept for per-user targeting and cleanup */
  private userSockets = new Map<string, string[]>();

  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    // Cache JWT secret at startup instead of fetching on every connection
    this.jwtSecret = config.get<string>('JWT_ACCESS_SECRET') ?? '';
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as Record<string, string>).token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      const decoded = this.jwtService.verify(token, {
        secret: this.jwtSecret,
      });
      const userId: string = decoded.sub as string;
      const role: string = decoded.role as string;
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

      // Track per-user socket IDs for targeted notifications
      const userConns = this.userSockets.get(userId) ?? [];
      userConns.push(client.id);
      this.userSockets.set(userId, userConns);

      // Join the shared admin room so broadcasts are O(1) instead of O(n)
      if (role === 'ADMIN') {
        await client.join(ADMIN_ROOM);
      }

      (client.data as Record<string, unknown>).user = { id: userId, role };
      this.logger.log(
        `Client connected: ${client.id} (User: ${userId}, Role: ${role})`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Connection failed: ${msg}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = (
      client.data as Record<string, { id: string; role: string } | undefined>
    ).user;
    if (user) {
      const userConns = this.userSockets.get(user.id) ?? [];
      const index = userConns.indexOf(client.id);
      if (index !== -1) {
        userConns.splice(index, 1);
        if (userConns.length === 0) {
          this.userSockets.delete(user.id);
        } else {
          this.userSockets.set(user.id, userConns);
        }
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit an event to all connected admin clients using a Socket.IO room.
   * This is O(1) regardless of the number of admins.
   */
  notifyAdmins(event: string, payload: unknown) {
    this.server.to(ADMIN_ROOM).emit(event, payload);
  }

  /** Emit an event to all sockets belonging to a specific user. */
  notifyUser(userId: string, event: string, payload: unknown) {
    const sockets = this.userSockets.get(userId);
    if (sockets?.length) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, payload);
      });
    }
  }
}
