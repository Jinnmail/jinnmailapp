

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
import adminRoutes from './routes/admin'

//logger
import logger from './utils/logger';

class server {
  app

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    process.on('unhandledRejection', (reason, p) => {
      console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
      // application specific logging, throwing an error, or other logic here
    });
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
    this.app.use('/api/v1/admin', adminRoutes)
  }

}
export default new server().app