import { exists, read, writeAsync } from 'fs-jetpack';
import { cloneDeep, throttle } from 'lodash';
import { join } from 'path';
import config from '../../config.json';
import { DbSchema, Route, User } from '../../types';

const DB_PATH = join(__dirname, '../..', 'bin', 'db.json');

class DB {
  data: DbSchema;

  constructor() {
    if (exists(DB_PATH)) {
      this.data = read(DB_PATH, 'json');
    } else {
      this.data = {
        routes: [],
        imageCache: {},
        users: {},
      };
    }

    this.normalizeDbAndConfig();
  }

  // IMAGE CACHE

  getImageCachePath = (filePath: string): string => this.data.imageCache[filePath];

  setImageCachePath(filePath: string, imagePath: string) {
    this.data.imageCache[filePath] = imagePath;
    this.save();
  }

  // ROUTES

  getRoutes = (): Route[] => cloneDeep(this.data.routes);

  // USERS

  getUser = (username: string): User => cloneDeep(this.data.users[username]);

  getUsers = () => cloneDeep(this.data.users);

  setUser = (user: User) => {
    this.data.users[user.username] = user;
    this.save();
  };

  setUsers = (users: { [u: string]: User }) => {
    this.data.users = {
      ...this.data.users,
      ...users,
    };
    this.save();
  };


  private normalizeDbAndConfig() {
    const { routes, users } = config;

    const normalizedUsers = users
      .reduce((usrObj, user) => {
        usrObj[user.username] = {
          ...(this.data.users[user.username] || {}),
          ...user,
        };
        return usrObj;
      }, {});

    this.data.routes = routes;
    this.data.users = normalizedUsers;
    this.save();
  }

  private save = throttle(() => {
    writeAsync(DB_PATH, this.data, { atomic: true })
      .catch(err => {
        console.error('Error writing db!');
        console.log(err);
        this.save();
      });
  }, 2000);
}

export default new DB();