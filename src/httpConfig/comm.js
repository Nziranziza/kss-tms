const axios = require("axios");
const config = require("config");
const logger = require("../logging");
const url = config.get("apiEndPoints.commService.url");

/* Axios instance for the communication service */
const commService = axios.create({
  baseURL: url,
  headers: {
  },
});

commService.interceptors.request.use((configuration) => {
  const { url, method, params, token } = configuration;
  configuration.headers = {...configuration.headers, 'x-access-key': token};
  console.log(configuration);
  logger.info({ url, method, params, token }, "Requesting data from Ikofi");

  return configuration;
});

module.exports.CommService = commService;
