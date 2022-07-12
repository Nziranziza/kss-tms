const cache = require("../startup/redisconnection");

class RedisService {
  cacheData = (key, data, time) => {
    return new Promise((resolve, reject) => {
      cache.setex(key, time, JSON.stringify(data), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  getCachedData = (key) => {
    return new Promise((resolve, reject) => {
      cache.get(key, (err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });
  };

  cachedKeyExists = (key) => {
    return new Promise((resolve, reject) => {
      cache.exists(key, (err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });
  };
}

module.exports.RedisService = new RedisService();
