import express from 'express';
import { read } from 'fs-jetpack';
import { createServer } from 'https';
import { join } from 'path';
import { connectSocket, connectWeb } from './client-connection';
import { getCommandLineArguments, log } from './lib/utils';
import ffmpeg from "fluent-ffmpeg";

const { PORT } = getCommandLineArguments();

ffmpeg.setFfmpegPath(join(__dirname, '..', 'bin', 'ffmpeg.exe'));
ffmpeg.setFfprobePath(join(__dirname, '..', 'bin', 'ffprobe.exe'));

// command to make ssl cert
// openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout ./bin/server.key -out ./bin/server.cert
const app = express();
const server = createServer({
  key: read(join(__dirname, '../bin/server.key')),
  cert: read(join(__dirname, '../bin/server.cert')),
}, app);

app.use((req, res, next) => {
  // x-real-ip = ip address from nginx
  const ip = (req.header('x-real-ip') || req.ip).replace('::ffff:', '');
  log(`ip: ${ip} - url:${req.url}`);
  next();
});

connectSocket(server);
connectWeb(app);

app.use((err, req, res, next) => {
  log(err);
  log(err.stack);
  res.status(500).send(err);
});

server.listen(PORT, () => log(`started server at https://localhost:${PORT}`));
