module.exports = {
  app: {
    authentication: "TMS_STATIC_KEY",
    node_env: "NODE_ENV",
    port: "TMS_PORT",
  },
  redis: {
    redis_key: "REDIS_SECRET",
    hostname: "REDIS_HOSTNAME",
    port: "REDIS_PORT",
  },
  db: {
    url: "TMS_DB_URL",
  },
  apiEndPoints: {
    commService: {
      url: "BKTH_COMM_SERVICE_URL",
      appId: "BKTH_COMM_SERVICE_APP_ID",
      accessKey: "BKTH_SERVICE_ACCESS_KEY",
    },
  },
};
