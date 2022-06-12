const responseWrapper = require('../helpers/responseWrapper');
const asyncWrapper = require('../helpers/asyncWrapper');
const CustomError = require('../helpers/customerError');
const { statusCodes } = require('../../utils/constants/common');

class  BaseController {
  constructor(repository) {
    this.repository = repository;
    this.findOne = this.findOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this.find= this.find.bind(this);
    this.customFindOne = this.customFindOne.bind(this);

  }

  create(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.create(body);
      return responseWrapper({
        res,
        message: 'Record successfully created',
        status: statusCodes.OK,
        data
      });
    });
  }

  find(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.find(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'Success',
        data
      });
    });
  }

  customFindOne(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.customFindOne(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'Success',
        data
      });
    });
  }

  update(req, res) {
    const { body, params } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.find(params.id);
      await data.update(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'Record successfully updated',
        data: data
      });
    });
  }

  remove(req, res) {
    const { params } = req;
    return asyncWrapper(res, async () => {
      await this.repository.remove(params.id);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'Success'
      });
    });
  }

  checkOne(req, res, next) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findOne(req.params.id);
      if (!data) {
        throw new CustomError('Record not found', statusCodes.NOT_FOUND);
      }
      req.currentRecord = data;
      return next();
    });
  }

  findOne(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findOne(req.params['id']);
      if (!data) {
        throw new CustomError('Record not found', statusCodes.NOT_FOUND);
      }
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'Success',
        data: data
      });
    });
  }
}

module.exports = BaseController;
