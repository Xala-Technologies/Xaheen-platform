import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let output = `${timestamp} [${level}]: ${message}`;
  
  if (stack) {
    output += `\n${stack}`;
  }
  
  if (Object.keys(meta).length > 0) {
    output += `\n${JSON.stringify(meta, null, 2)}`;
  }
  
  return output;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      )
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'error.log',
    level: 'error',
    format: combine(
      timestamp(),
      winston.format.json()
    )
  }));
  
  logger.add(new winston.transports.File({
    filename: 'combined.log',
    format: combine(
      timestamp(),
      winston.format.json()
    )
  }));
}