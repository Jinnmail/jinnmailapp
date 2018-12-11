import bunyan from 'bunyan'

class logger {

    constructor() {

    }

    log = bunyan.createLogger({
        name: 'jinnmail',
        streams: [{
            level: 'debug',
            stream: process.stdout
        }, {
            level: 'debug',
            stream: process.stdout
        }]
    })

    info(message) {
        this.log.info(message)
    }

    warn(message) {
        this.log.warn(message)
    }

    debug(message) {
        this.log.debug(message)
    }
}

export default new logger()