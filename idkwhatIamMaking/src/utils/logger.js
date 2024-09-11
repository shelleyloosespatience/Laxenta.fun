const { createLogger, format, transports, addColors } = require("winston");
const { exec } = require('child_process');

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    verbose: 5,
    silly: 6,
  },
};

addColors({
  fatal: "bold red",
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
  verbose: "cyan",
  silly: "magenta",
});

const logger = createLogger({
  levels: customLevels.levels,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [
    new transports.Console({
      level: "debug",
      handleExceptions: true,
    }),
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'error.log', level: 'error' }),
  ],
  exitOnError: true, // Exit on caught exceptions
});

// Automatically restart on fatal or error level
logger.on('error', () => restartBot());
logger.on('fatal', () => restartBot());

function restartBot() {
  const isPM2 = process.env.PM2_PROCESS_ID !== undefined;
  if (isPM2) {
    // Using 'pm2 restart' to restart the process if running under PM2
    exec(`pm2 restart ${process.env.PM2_PROCESS_ID}`, (err, stdout, stderr) => {
      if (err) {
        console.error('PM2 restart error:', stderr);
        process.exit(1);
      } else {
        console.log('PM2 restart successful:', stdout);
      }
    });
  } else {
    // Directly exit the process to allow the supervising system to restart it
    process.exit(1);
  }
}

module.exports = logger;