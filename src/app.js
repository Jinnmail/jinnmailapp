

import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors';
import {} from 'dotenv/config';
import validator from 'express-validator';

// Importing route files from ./routes

import userRoutes from './routes/user'
import aliasRoutes from './routes/alias'

//logger
import logger from './utils/logger';

class server {
  app

  constructor() {
    this.app = express();
    this.config();
    this.routes()
  }

  config() {
    this.app.use(validator());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }
  routes() {

    this.app.use('/api/v1/user', userRoutes);
    this.app.use('/api/v1/alias', aliasRoutes);
  }

}
export default new server().app