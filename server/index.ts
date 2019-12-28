import { readAsync as read, writeAsync as write } from 'fs-jetpack';
import * as getIncrementalPort from 'get-incremental-port';
import { createServer } from 'http';
import { join } from 'path';
import * as socketIO from 'socket.io';

const START_PORT = 3000;
let retries = 10;
export let port;

(function serverRestarter() {
  startServer()
    .catch(err => {
      console.log(err);
      retries--;
      if (retries > 0) serverRestarter();
    });
})();

async function startServer() {
  port = await getIncrementalPort(START_PORT);
  await writePortToIndex();

  const server = createServer();
  const io = socketIO(server, {
    origins: '*:*',
  });
  server.listen(port, () => console.log(`server running on port ${port}`));

  io.on('connection', socket => {
    console.log('client connected');
    const dispatch = action => socket.emit('dispatch', action);
  });
}

async function writePortToIndex() {
  const index = await read(join(__dirname, '../client/index.html'));
  await write(
    join(__dirname, '../public/index.html'),
    index.replace('PORT__ = 0', `PORT__ = ${port}`),
  );
  console.log(`wrote index.html file with port ${port}`);
}
