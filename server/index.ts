import cookieParser from 'cookie-parser';
import express from 'express';
import { read } from 'fs-jetpack';
import { createServer } from 'https';
import { join } from 'path';
import { initClient } from './client-connection';
import { DirectoriesRouter } from './Directories';
import { getCommandLineArguments, log } from './lib/utils';
import { setupUsers, UsersRouter } from './Users';

const { PORT, PROD } = getCommandLineArguments();

// command to make ssl cert
// openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout ./bin/server.key -out ./bin/server.cert
const app = express();
const server = createServer({
  key: read(join(__dirname, '../bin/server.key')),
  cert: read(join(__dirname, '../bin/server.cert')),
}, app);

app.use((req, res, next) => {
  const ip = req.header('x-real-ip'); // ip address from nginx
  log(`ip - ${ip || req.ip} - url - ${req.url}`);
  next();
});

app.use(cookieParser());
app.use(express.text());

setupUsers();

app.use('/api', UsersRouter);
app.use('/api', DirectoriesRouter);
app.use('/api', (req, res) => res.status(404).end());

initClient(app, server);

app.use((err, req, res, next) => {
  log(err);
  log(err.stack);
  res.status(500).send(err);
});

server.listen(PORT, () => log(`started server at https://localhost:${PORT}`));