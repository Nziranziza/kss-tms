const logger = require('utils/logging');
const responseWrapper = require("./responseWrapper");
const {statusCodes} = require("utils/constants/common");

const asyncWrapper = async (res, callback) => {
  try {
    await callback();
  } catch (error) {
    console.log('----------------------error----------------------------------');
    logger.error(error.message, error);
    let message;
    if(error.message)
      message = error.message;
    else if(error._message)
      message = error._message;
    else
      message = 'Something abnormal happen!';

    return responseWrapper({
      res,
      status: statusCodes.SERVER_ERROR,
      message
    });
  }
};

module.exports = asyncWrapper;
