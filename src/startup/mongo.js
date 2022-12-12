const mongoose = require('mongoose');
const config = require('config');
const logger = require('../utils/logging');

module.exports = () => {

  const options = {
  };

  // set up default mongoose connection

  mongoose.connect(`${config.get('db.url')}`, options).then(() => logger.info('mongoDB connected...'));

  // get default connection

  const db = mongoose.connection;

  db.on('connected', () => {
    logger.info(`Mongoose  connection to DB is open.`);
  });
  db.on('error', error => {
    logger.warn('Mongoose connection error: ' + error);
  });
  db.on('disconnected', () => {
    logger.warn('Mongoose  connection is disconnected');
  });
  process.on('SIGINT', () => {
    db.close(() => {
      logger.info(
        'Mongoose connection is disconnected due to application termination'
      );
      process.exit(1);
    });
  });
};
