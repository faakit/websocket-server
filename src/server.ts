import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

interface IUser {
  id: number;
  x: number;
  y: number;
}

const users = new Map<number, IUser>();
let lastId = 0;

io.on('connection', socket => {
  const clientId = lastId;
  lastId++;
  socket.emit('id', clientId);

  socket.on('mouseMove', ({ x, y }: IUser) => {
    users.set(clientId, { x, y, id: clientId });
    socket.broadcast.emit(
      'mouseMove',
      Array.from(users, ([, value]) => {
        return { ...value };
      }),
    );
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users.delete(clientId);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
