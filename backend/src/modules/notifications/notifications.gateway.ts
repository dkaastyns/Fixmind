import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string[]>(); // userId -> socketIds[]
  private adminSockets = new Set<string>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;
      const role = decoded.role;

      // Map user ID to socket
      const userConns = this.userSockets.get(userId) || [];
      userConns.push(client.id);
      this.userSockets.set(userId, userConns);

      if (role === 'ADMIN') {
        this.adminSockets.add(client.id);
      }

      client.data.user = { id: userId, role };
      this.logger.log(`Client connected: ${client.id} (User: ${userId}, Role: ${role})`);
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      const userConns = this.userSockets.get(user.id) || [];
      const index = userConns.indexOf(client.id);
      if (index !== -1) {
        userConns.splice(index, 1);
        if (userConns.length === 0) {
          this.userSockets.delete(user.id);
        } else {
          this.userSockets.set(user.id, userConns);
        }
      }

      if (user.role === 'ADMIN') {
        this.adminSockets.delete(client.id);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Helper methods to emit events
  notifyAdmins(event: string, payload: any) {
    this.adminSockets.forEach(socketId => {
      this.server.to(socketId).emit(event, payload);
    });
  }

  notifyUser(userId: string, event: string, payload: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        this.server.to(socketId).emit(event, payload);
      });
    }
  }

  notifyTechnician(technicianId: string, event: string, payload: any) {
    this.notifyUser(technicianId, event, payload);
  }
}
