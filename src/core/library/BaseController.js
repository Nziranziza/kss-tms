const responseWrapper = require('core/helpers/responseWrapper');
const asyncWrapper = require('core/helpers/asyncWrapper');
const CustomError = require('core/helpers/customerError');
const { statusCodes } = require('utils/constants/common');

class BaseController {
  constructor(repository) {
    this.repository = repository;
    this.create = this.create.bind(this)
    this.find = this.find.bind(this)
    this.update = this.update.bind(this)
    this.remove = this.remove.bind(this)
    this.checkOne = this.checkOne.bind(this)
    this.findById = this.findById.bind(this)
    this.softDelete = this.softDelete.bind(this)
  }

  create(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const applicationId = req.headers['tms-app-id'];
      if(!applicationId) {
        return responseWrapper({
          res,
          message: 'Application id is required',
          status: statusCodes.BAD_REQUEST
        })
      }
      const data = await this.repository.create({
        ...body,
        applicationId
      });
      if (!data) {
        throw new CustomError(
          serverMessages.CREATE_FAILURE,
          statusCodes.SERVER_ERROR
        );
      }
      return responseWrapper({
        res,
        message: serverMessages.CREATE_SUCCESS,
        status: statusCodes.OK,
        data,
      });
    });
  }

  find(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.find(body);
      if (!data) {
        throw new CustomError(serverMessages.NOT_FOUND, statusCodes.NOT_FOUND);
      }
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.SUCCESS,
        data,
      });
    });
  }

  update(req, res) {
    const { body, params } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.update(params.id, body);
      if (!data) {
        throw new CustomError(
          serverMessages.NOT_FOUND,
          statusCodes.NOT_FOUND
        );
      }
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.UPDATE_SUCCESS,
        data,
      });
    });
  }

  remove(req, res) {
    const { params } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.remove(params.id);
      if (!data) {
        throw new CustomError(
          serverMessages.REMOVE_FAILURE,
          statusCodes.SERVER_ERROR
        );
      }
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.REMOVE_SUCCESS,
      });
    });
  }

  checkOne(req, res, next) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findById(req.params.id);
      if (!data) {
        throw new CustomError(serverMessages.NOT_FOUND, statusCodes.NOT_FOUND);
      }
      req.currentRecord = data;
      return next();
    });
  }

  findById(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findById(req.params.id);
      if (!data) {
        return responseWrapper({
          res,
          status: statusCodes.NOT_FOUND,
          message: serverMessages.NOT_FOUND,
        });
      }
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.SUCCESS,
        data: data,
      });
    });
  }

  softDelete(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findById(req.params.id);
      if (!data) {
        throw new CustomError(serverMessages.NOT_FOUND, statusCodes.NOT_FOUND);
      }
      await data.softDelete();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.DELETE_SUCCESS,
        data,
      });
    });
  }
}

module.exports = BaseController;
