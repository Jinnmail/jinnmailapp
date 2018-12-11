import http from 'http'
import server from './app'
import cred from './config/const'
import logger from './utils/logger'
import cluster from 'cluster'
import os from 'os'

const cores = os.cpus().length
const app = http.createServer(server)
app.listen(process.env.PORT)
app.on('error', error)
app.on('listening', connected)

function connected() {
    logger.info(` started at ${new Date()}, PID: ${process.pid} at ${cred().port}`)
}

function error() {
    if (error.syscall !== 'listen') {
        console.log(error)
    }
    const bind = (typeof cred().port === 'string') ? 'Pipe ' + cred().port : 'Port ' + cred().port;
    switch (error.code) {
        case 'EACCES':
            logger.warn(`${bind} requires elevated privileges`)
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.warn(`${bind} is already in use`)
            process.exit(1);
            break;
        default:
            throw error;
    }
}


