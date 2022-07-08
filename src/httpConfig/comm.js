const axios = require("axios");
const config = require("config");
const logger = require("../logging");
const url = config.get("apiEndPoints.commService.url");

/* Axios instance for the communication service */
const commService = axios.create({
  baseURL: url,
  headers: {
    "x-access-key":
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3ZTcyZGE2LWVkMzctNGMxNy1iNThkLTYzNWZiZmIxYTZhNSIsIm5hbWUiOiJTTUFSVCBLVU5HQUhBUkEgU1lTVEVNIiwiaXBfYWRkcmVzcyI6WyIxMDUiLCIxNzkiLCIxMCIsIjMwIl0sImFwaV9iYXNlX3VybCI6Imh0dHBzOi8vc3RhZ2luZy5zbWFydGt1bmdhaGFyYS5ydyIsImVtYWlsIjoieS5tdWdlbmRhQGJrLnJ3IiwiYWNjZXNzX2tleSI6IjRkMDQyNjllLWNiMTktNGVmNi1hZjdhLTgwMzliMDFlNTNlMyIsInN0YXR1cyI6IkFDVElWRSIsImNyZWF0ZWRBdCI6IjIwMjItMDYtMzBUMTI6Mjk6MDkuNjg0WiIsInVwZGF0ZWRBdCI6IjIwMjItMDYtMzBUMTI6Mjk6MDkuNjg0WiIsImlhdCI6MTY1NzIwMDk3NywiZXhwIjoxNjU3Mjg3Mzc3fQ.U_yS7ksFwUgm2-tFqrrLsatpVV6A4v4psMs7p-ZfSOQ",
  },
});

commService.interceptors.request.use((configuration) => {
  const { url, method, params, token } = configuration;
  logger.info({ url, method, params, token }, "Requesting data from Ikofi");

  return configuration;
});

module.exports.CommService = commService;
