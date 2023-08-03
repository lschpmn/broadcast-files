import { Router } from 'express';
import config from '../config.json';
import { log } from './lib/utils';


export const fileRouter = Router();

fileRouter.get('/*', (req, res) => {
  const route = config.routes
    .find(r => req.path.startsWith(r.url));

  if (!route) {
    log(`route not found`);
    return res.sendStatus(404);
  }

  const filePath = decodeURIComponent(req.path)
    .replace(route.url, route.filePath)
    .replace(/\//g, '\\');

  log(`start stream for - ${filePath}`);

  res.on('close', () => log(`stream ended for - ${filePath}`));

  res.sendFile(filePath);
});
