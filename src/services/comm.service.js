/* APIS for communicating with the common communication service */

const { CommService } = require("httpConfig/comm");
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
      token: "",
    });
  } catch (error) {
    return error;
  }
};

/* sending SMS on the non-chargeable endpoint */
const sendAppSMS = async (data) => {
  try {
    let token = await RedisService.getCachedData("comm-token");
    if(token == null) {
      await claimToken();
      token = await RedisService.getCachedData("comm-token");
    }
    return await CommService.post("/messages/app/sendSMS", data, {
      token: token.replace(/['"]+/g, ""),
    });
  } catch (error) {
    return error;
  }
};

/* sending SMS on the chargeable endpoint */
const sendClientSMS = async (data) => {
  try {
    let token = await RedisService.getCachedData("comm-token");
    if(token == null) {
      await claimToken();
      token = await RedisService.getCachedData("comm-token");
    }
    return await CommService.post("/messages/client/sendSMS", data, {
      token: token.replace(/['"]+/g, ""),
    });
  } catch (error) {
    return error;
  }
};

// Get balance for the client
const getBalance = async (id) => {
  try {
    let token = await RedisService.getCachedData("comm-token");
    if(token == null) {
      await claimToken();
      token = await RedisService.getCachedData("comm-token");
    }
    return await CommService.get("/orders/getBalance/" + id, {
      token: token.replace(/['"]+/g, ""),
    });
  } catch (error) {
    return error;
  }
};

// Order SMS for Client
const orderSMS = async (data) => {
  try {
    let token = await RedisService.getCachedData("comm-token");
    if(token == null) {
      await claimToken();
      token = await RedisService.getCachedData("comm-token");
    }
    return await CommService.post("/orders/", data, {
      token: token.replace(/['"]+/g, ""),
    });
  } catch (error) {
    return error;
  }
};

// Get Orders for Client
const getOrders = async (id) => {
  try {
    let token = await RedisService.getCachedData("comm-token");
    if(token == null) {
      await claimToken();
      token = await RedisService.getCachedData("comm-token");
    }
    return await CommService.get("/orders/getOrders/" + id, {
      token: token.replace(/['"]+/g, ""),
    });
  } catch (error) {
    return error;
  }
};

const smsHistory = async (filters = {}) => {
  try {
    let token = await RedisService.getCachedData("comm-token");
    if(token == null) {
      await claimToken();
      token = await RedisService.getCachedData("comm-token");
    }
    return CommService.get("/messages/getMessages", {
      token: token.replace(/['"]+/g, ""),
      params: {
        type: 'SMS',
        ...filters
      }
    })
  } catch(error) {
    return error
  }
}

const claimToken = async () => {
  const data = {
    app_id: appId,
    access_key: accessKey,
  };

  const token = await authenticateApp(data);

  if (token.status == 200) {
    await RedisService.cacheData(
      "comm-token",
      token.data.data.token.replace(/['"]+/g, ""),
      24 * 60 * 60
    );
    return token.data.data.token.replace(/['"]+/g, "");
  }
};

module.exports.authenticateApp = authenticateApp;
module.exports.sendAppSMS = sendAppSMS;
module.exports.claimToken = claimToken;
module.exports.getBalance = getBalance;
module.exports.orderSMS = orderSMS;
module.exports.getOrders = getOrders;
module.exports.sendClientSMS = sendClientSMS;
module.exports.smsHistory = smsHistory;
