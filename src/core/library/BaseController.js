const responseWrapper = require('../helpers/responseWrapper');
const asyncWrapper = require('../helpers/asyncWrapper');
const CustomError = require('../helpers/customerError');
const { statusCodes } = require('../../utils/constants/common');

class BaseController {
  constructor(repository) {
    this.repository = repository;
    this.findOne = this.findOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.customUpdate = this.customUpdate.bind(this);
    this.remove = this.remove.bind(this);
    this.find = this.find.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findAll = this.findAll.bind(this);
    this.customFindOne = this.customFindOne.bind(this);
    this.softDelete = this.softDelete.bind(this);
  }

  create(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      body.applicationId = req.headers['tms-app-id'];
      const data = await this.repository.create(body);
      const response = await this.repository.findOne(data._id);
      return responseWrapper({
        res,
        message: "Record successfully created",
        status: statusCodes.OK,
        data: response
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
        message: "Success",
        data,
      });
    });
  }

  findAll(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findAll();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data,
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
        message: "Success",
        data,
      });
    });
  }

  update(req, res) {
    const { body, params } = req;
    return asyncWrapper(res, async () => {
      let data = await this.repository.findOne(params.id);
      if(data){
        body._id = params.id;
        data = await this.repository.update(body);
      }
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Record successfully updated",
        data
      });
    });
  }

  customUpdate(req, res) {
    const { body, params } = req;
    return asyncWrapper(res, async () => {
      let data = await this.repository.customUpdate(params.id, body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Record successfully updated",
        data
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
        message: "Record successfully removed",
      });
    });
  }

  checkOne(req, res, next) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findOne(req.params.id);
      if (!data) {
        throw new CustomError("Record not found", statusCodes.NOT_FOUND);
      }
      req.currentRecord = data;
      return next();
    });
  }

  findOne(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findOne(req.params.id);
      if (!data) {
        throw new CustomError("Record not found", statusCodes.NOT_FOUND);
      }
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data: data,
      });
    });
  }

  softDelete(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findOne(req.params.id);
      if (!data) {
        throw new CustomError("Record not found", statusCodes.NOT_FOUND);
      }
      const isDeleted = await data.softDelete();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Record successfully deleted!",
        data,
      });
    });
  }
}

module.exports = BaseController;
