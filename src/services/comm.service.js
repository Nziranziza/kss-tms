/* APIS for communicating with the common communication service */

const { CommService, Axios } = require("../httpConfig/comm");
const config = require("config");
const { RedisService } = require("./redis.service");
const appId = config.get("apiEndPoints.commService.appId");
const accessKey = config.get("apiEndPoints.commService.accessKey");

/* Claim Token */
// const claimToken =

/* Request to authenticate application */
const authenticateApp = async (data) => {
  try {
    return await CommService.post("/applications/auth", data, {
      // token: await RedisService.getCachedData("comm-token"),
    });
  } catch (error) {
    return error;
  }
};

/* sending SMS on the non-chargeable endpoint */
const sendAppSMS = async (data) => {
  try {
    const token = await RedisService.getCachedData("comm-token");
    return await CommService.post("/messages/app/sendSMS", data, {
      // token: token.replace(/['"]+/g, ""),
    });
  } catch (error) {
    return error;
  }
};

const claimToken = async () => {
  const data = {
    app_id: appId,
    access_key: accessKey,
  };

  console.log("claim token")

  const token = await authenticateApp(data);

  if (token.status == 200) {
    console.log(token);
    // await RedisService.cacheData(
    //   "comm-token",
    //   token.data.data.token.replace(/['"]+/g, ""),
    //   24 * 60 * 60
    // );
  }
};

module.exports.authenticateApp = authenticateApp;
module.exports.sendAppSMS = sendAppSMS;
module.exports.claimToken = claimToken;
