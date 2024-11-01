import { createLogger, format, transports } from 'winston';

// Define log levels and colors
const logFormat = format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.colorize(),
        logFormat
    ),
    transports: [
        new transports.Console()
    ],
});



logger.add(new transports.Console({
    format: format.combine(
        format.colorize(),
        format.simple()
    )
}));


export default logger;
