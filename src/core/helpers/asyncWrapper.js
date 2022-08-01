const logger = require('../../utils/logging');
const responseWrapper = require("./responseWrapper");
const {statusCodes} = require("../../utils/constants/common");

const asyncWrapper = async (res, callback) => {
  try {
    await callback();
  } catch (error) {
    console.log(error.errors);
    logger.error(error.message, error);
    return responseWrapper({
      res,
      status: statusCodes.SERVER_ERROR,
      message: error.message
    });
  }
};

module.exports = asyncWrapper;
