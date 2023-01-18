const asyncWrapper = require("../core/helpers/asyncWrapper");
const CustomError = require("../core/helpers/customerError");
const {
  applicationRepository,
} = require("../database/application/application.repository");
const { serverMessages, statusCodes } = require("../utils/constants/common");

module.exports = function (req, res, next) {
  return asyncWrapper(res, async () => {
    const applicationId = req.headers["tms-app-id"];
    if (!applicationId) {
      throw new CustomError(
        serverMessages.APP_ID_REQUIRED,
        statusCodes.BAD_REQUEST
      );
    }
    const app = await applicationRepository.findOne({ applicationId });
    if (!app) {
      throw new CustomError(
        serverMessages.UNAUTHORIZED,
        statusCodes.UNAUTHORIZED
      );
    }
    next();
  });
};
