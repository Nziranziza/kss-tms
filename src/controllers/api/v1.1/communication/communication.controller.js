const asyncWrapper = require("core/helpers/asyncWrapper");
const BaseController = require("core/library/BaseController");
const responseWrapper = require("core/helpers/responseWrapper");
const { statusCodes, serverMessages } = require("utils/constants/common");
const {
  commRepo,
} = require("database/communication/communication.repository");
const { getBalance, orderSMS, getOrders, smsHistory } = require("services/comm.service");
const { scheduleRepository } = require('database/schedule/schedule.repository');

class CommController extends BaseController {
  constructor(repository) {
    super(repository);
  }

  callback(req, res) {
    return asyncWrapper(res, async () => {
      const { body } = req;
      const schedule = await scheduleRepository.findOne({ 'smsResponse.batch_id': body.batch_id });
      if(!schedule) {
        return responseWrapper({
          res,
          status: statusCodes.NOT_FOUND,
          message: serverMessages.NOT_FOUND
        })
      }
      schedule.trainees.forEach(trainee => {
        if(trainee.phoneNumber === body.recipient) {
          trainee.smsStatus = body.status
        }
      });
      await schedule.save();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
      });
    });
  }

  orderSMS(req, res) {
    const {body } = req;
    return asyncWrapper(res, async () => {
      const order = await orderSMS(body);
      if (order.data)
        return responseWrapper({
          res,
          status: order.data.status,
          message: order.data.message,
          data: order.data.data,
        });
    });
  }

  getBalance(req, res) {
    const { params } = req;
    return asyncWrapper(res, async () => {
      const balance = await getBalance(params.id);
      if (balance.data)
        return responseWrapper({
          res,
          status: balance.data.status,
          message: balance.data.message,
          data: balance.data.data,
        });
    });
  }

  getOrders(req, res){
    const { params } = req;
    return asyncWrapper(res, async () => {
      const orders = await getOrders(params.id);
      if (orders.data)
        return responseWrapper({
          res,
          status: orders.data.status,
          message: orders.data.message,
          data: orders.data.data,
        });
    });
  }

  getSmsHistory(req, res) {
    const { query } = req;
    return asyncWrapper(res, async () => {
      const history = await smsHistory(query)
      if(history.data) {
        return responseWrapper({
          res,
          status: history?.data?.status,
          message: history?.data?.message,
          data: history?.data
        })
      } else {
        const { response } = history;
        return responseWrapper({
          res, 
          status: response.status,
          message: response.message
        })
      }
    })
  }
}

module.exports.commCtrl = new CommController(commRepo);
