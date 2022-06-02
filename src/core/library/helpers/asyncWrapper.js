const logger = require('../../../utils/logging');
const { statusCodes } = require('../../../utils/constants/common');

const asyncWrapper = async (res, callback) => {
  try {
    await callback();
  } catch (error) {
    console.log(error);
    logger.error(error.message, error);
    return res.status(statusCodes.SERVER_ERROR).json({
      status: statusCodes.SERVER_ERROR,
      message: 'Something abnormal happened.!'
    });
  }
};

module.exports = asyncWrapper;
