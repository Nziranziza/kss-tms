const logger = require('utils/logging');
const responseWrapper = require("./responseWrapper");
const { statusCodes, serverMessages } = require("utils/constants/common");

const asyncWrapper = async (res, callback) => {
  try {
    await callback();
  } catch (error) {
    const message =
      error.message || error._message || serverMessages.SERVER_ERROR;
    const status = error.status || statusCodes.SERVER_ERROR;
    logger.error(message, error);
    return responseWrapper({
      res,
      status,
      message,
    });
  }
};

module.exports = asyncWrapper;
