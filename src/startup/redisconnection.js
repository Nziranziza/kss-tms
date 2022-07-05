const redis = require('redis');
const config = require('config');
const logger = require('../logging');

const client = redis.createClient({
  port: config.get('redis.port'),
  host: config.get('redis.hostname'),
  connect_timeout: config.get('redis.con_timeout'),
  retry_strategy: 10,
  password: config.get('redis.redis_key')
});


client.on('connect', () => {
  logger.info('Connection to redis server is successful');
});

client.on('error', err => {
  logger.error('Error occurred while connecting to redis:' + err);
  /// process.exit(1);
});

module.exports = client;
