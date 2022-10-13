import { createLogger, format, transports, config } from 'winston';

const customLogger = createLogger({

    levels: config.syslog.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        })),
    transports: [
        new transports.File({ filename: '../logs/custom.log' })
    ]
});

module.exports = {
    customLogger
}