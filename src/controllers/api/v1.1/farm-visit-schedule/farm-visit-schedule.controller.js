const asyncWrapper = require("core/helpers/asyncWrapper");
const responseWrapper = require("core/helpers/responseWrapper");
const BaseController = require("core/library/BaseController");
const {
  farmVisitScheduleRepository,
} = require("database/farm-visit-schedule/farm-visit-schedule.repository");
const { statusCodes } = require("utils/constants/common");
const { sendClientSMS } = require("services/comm.service");
const {
  receptionStatus,
} = require("tools/constants");
const { serverMessages } = require("utils/constants/common");

class FarmVisitScheduleController extends BaseController {
  constructor(repository) {
    super(repository);
    this.schedulesStats = this.schedulesStats.bind(this);
    this.farmerScheduledVisits = this.farmerScheduledVisits.bind(this);
    this.farmsScheduledVisits = this.farmsScheduledVisits.bind(this);
    this.farmScheduledVisits = this.farmScheduledVisits.bind(this);
    this.sendSMS = this.sendSMS.bind(this);
    this.visitedFarmsOverview = this.visitedFarmsOverview.bind(this);
    this.smsCallback = this.smsCallback.bind(this);
  }

  schedulesStats(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const summary = await this.repository.schedulesStats(body);
      if (summary)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: summary,
        });
    });
  }

  farmerScheduledVisits(req, res) {
    const { params } = req;
    return asyncWrapper(res, async () => {
      const visits = await this.repository.farmerScheduledVisits(params.id);
      if (visits)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: visits,
        });
    });
  }

  sendSMS(req, res) {
    const { params } = req;
    return asyncWrapper(res, async () => {
      const body = req.body;
      const schedule = await this.repository.findById(params.id).lean();
      if (schedule) {
        schedule.farmers.forEach(async ({ userId, phoneNumber }) => {
          const farms = schedule.farms.filter(({ owner }) => owner.userId.toString() === userId.toString());
          let message = '';
          if (farms.length === 1) {
            message = `Uruganda ${schedule.visitor.organisationName} ruzasura umurima wawe uherereye ${farms[0].location.village_id.name}.
          ku itariki ${schedule.date.toLocaleDateString()} saa ${schedule.expectedDuration.from} - ${schedule.expectedDuration.to}`;
          } else {
            const location = farms.map((farm) => {
              return farm?.location?.village_id?.name
            });
            message = `Uruganda ${schedule.visitor.organisationName} ruzasura imirima yawe iherereye ${location}.
            ku itariki ${schedule.date.toLocaleDateString()} saa ${schedule.expectedDuration.from} - ${schedule.expectedDuration.to}`;
          }
          const data = {
            recipients: [phoneNumber],
            message: message,
            sender: body.sender,
            ext_sender_id: body.sender_id,
            callBack: body.callback
          };
          const sms = await sendClientSMS(data);
          if (sms.data) {
            const response = {
              message: message,
              validPhones: sms.data.data.validPhones,
              InvalidPhones: sms.data.data.InvalidPhones,
              batch_id: sms.data.data.batch_id,
            };
           await this.repository.update(schedule._id, { 
              smsResponse: [...(schedule.smsReponse || []), response],
              farmers: schedule.farmers.map(farmer => ({
                ...farmer,
                smsStatus: receptionStatus.QUEUED
              }))
            })
          }
        })
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "Success",
        });
      } else {
        return responseWrapper({
          res,
          status: statusCodes.NOT_FOUND,
          message: "Schedule not found",
        });
      }
    });
  }

  farmScheduledVisits(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const schedules = await this.repository.farmScheduledVisits(body);
      if (schedules)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: schedules,
        });
    });
  }

  farmsScheduledVisits(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const schedules = await this.repository.farmsScheduledVisits(body);
      if (schedules)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: schedules,
        });
    });
  }

  visitedFarmsOverview(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const visits = await this.repository.visitedFarmsOverview(body);

      if (visits)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: visits.length > 0 ? visits[0] : { visits: 0 },
        });
    });
  }

  smsCallback(req, res) {
    return asyncWrapper(res, async () => {
      const { body } = req;
      const visit = await this.repository.findOne({ 'smsResponse.batch_id': body.batch_id });
      if(!visit) {
        return responseWrapper({
          res,
          status: statusCodes.NOT_FOUND,
          message: serverMessages.NOT_FOUND
        })
      }
      visit.farmers.forEach(farmer => {
        if(farmer.phoneNumber === body.recipient) {
          farmer.smsStatus = body.status
        }
      })
      await visit.save();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'success'
      })
    })
  }
}

module.exports.farmVisitScheduleCtrl = new FarmVisitScheduleController(
  farmVisitScheduleRepository
);
