module.exports = {
  app: {
    port: '9080'
  },
  redis: {
    con_timeout: 6000,
    maxTries: 10,
    MinKeyStorageTime: 7200,
    MaxKeyStorageTime: 36000 // 10 Hours
  }
};
