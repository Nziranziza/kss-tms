const BaseRepository = require("core/library/BaseRepository");
const { scheduleStatus } = require("tools/constants");
const { Schedule } = require("./schedule");
const moment = require("moment");
const populate = require('./schedule.populate')
const removeNilProps = require('utils/removeNilProps')
const toObjectId = require('utils/toObjectId')


class ScheduleRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  generateCommonFilters(body) {
    return removeNilProps({
      _id: toObjectId(body?.scheduleId),
      "groupId.location.prov_id": toObjectId(body?.location?.prov_id),
      "groupId.location.dist_id": toObjectId(body?.location?.dist_id),
      "groupId.location.sect_id": toObjectId(body?.location?.sect_id),
      "groupId.location.cell_id": toObjectId(body?.location?.cell_id),
      "groupId.location.village_id": toObjectId(body?.location?.village_id),
      referenceId: toObjectId(body?.reference || body?.referenceId),
      "trainingId._id": toObjectId(body?.trainingId),
      "trainer.userId": toObjectId(body?.trainerId),
      status: body?.status,
      "trainees.gender": body?.gender,
      startTime: body?.date
        ? {
            $gte: moment(body?.date?.from).startOf("day").toDate(),
            $lt: moment(body?.date?.to).endOf("day").toDate(),
          }
        : undefined,
      isDeleted: false,
    });
  }

  find(data = {}) {
    return super
      .find(data, { status: 'asc', startTime: 1 })
      .populate(populate)
  }

  findOne(data = {}) {
    return super
    .findOne(data)
    .populate(populate)
  }

  findGroupSchedule(groupId, trainingId) {
    return super
      .findOne({ "trainees.groupId": groupId, trainingId })
      .populate(populate)
  }

  findMemberAttendance(userId, trainingId) {
    return super.find({ "trainees.userId": userId, trainingId });
  }

  findById(id) {
    return super
      .findById(id)
      .populate(populate);
  }

  // Record Attendance scheduled training
  recordAtt(schedule, data) {
    // Loop through every trainne, determine status and update accordingly
    schedule.trainees.forEach(async (trainee) => {
      const traineeStatus = data.trainees.find(
        (b) => b._id === trainee._id.toString()
      );
      if (traineeStatus && traineeStatus.attended === true) {
        trainee.attended = true;
      } else trainee.attended = false;
    });
    schedule.notes = data.notes;
    // Since Attendance is recored change schedulled attendance to Happened
    schedule.status = scheduleStatus.HAPPENED;
    return schedule.save();
  }

  // edit Attendance scheduled training
  editAtt(schedule, data) {
    schedule.trainees.forEach(async (trainee) => {
      const traineeStatus = data.trainees.find(
        (b) => b._id === trainee._id.toString()
      );
      if (traineeStatus && traineeStatus.attended === true) {
        trainee.attended = true;
      } else trainee.attended = false;
    });
    schedule.notes = data.notes;
    schedule.lastUpdatedBy = data.lastUpdatedBy;
    return schedule.save();
  }

  async statistics(body = {}) {
    const preFilter = [
      {
        $match: removeNilProps({
          groupId: toObjectId(body?.groupId),
        }),
      },
      {
        $lookup: {
          from: "groups",
          localField: "groupId",
          foreignField: "_id",
          as: "groupId",
        },
      },
      {
        $addFields: {
          groupId: {
            $arrayElemAt: ["$groupId", 0],
          },
        },
      },
      {
        $lookup: {
          from: "trainings",
          localField: "trainingId",
          foreignField: "_id",
          as: "trainingId",
        },
      },
      {
        $addFields: {
          trainingId: {
            $arrayElemAt: ["$trainingId", 0],
          },
        },
      },
      {
        $unwind: "$trainees",
      },
    ];

    const filter = {
      $match: this.generateCommonFilters(body),
    };

    const groupByTraineeId = {
        $group: {
          _id: { userId: "$trainees.userId", gender: "$trainees.gender" },
          attendance: {
            $addToSet: "$trainees.attended",
          }
        },
      }
    const project = {
      $project: {
        _id: 0,
        userId: '$_id.userId',
        gender: '$_id.gender',
        attendance: 1
      }
    }

    const res = await this.model.aggregate(preFilter.concat([filter, groupByTraineeId, project]))
    return res.reduce(
      (prev, curr) => {
        let prevWithTotal = {
          ...prev,
          total: prev.total + 1,
        };
        if (curr.gender.toLowerCase() === "f") {
          prevWithTotal = {
            ...prevWithTotal,
            female: prevWithTotal.female + 1,
          };
          if (curr.attendance.find((att) => att)) {
            prevWithTotal = {
              ...prevWithTotal,
              presence: {
                ...prevWithTotal.presence,
                total: prevWithTotal.presence.total + 1
              }
            };
            return {
              ...prevWithTotal,
              presence: {
                ...prevWithTotal.presence,
                female: prevWithTotal.presence.female + 1,
              },
            };
          } else {
            prevWithTotal = {
              ...prevWithTotal,
              absence: {
                ...prevWithTotal.absence,
                total: prevWithTotal.absence.total + 1
              }
            };
            return {
              ...prevWithTotal,
              absence: {
                ...prevWithTotal.absence,
                female: prevWithTotal.absence.female + 1,
              },
            };
          }
        } else {
          prevWithTotal = {
            ...prevWithTotal,
            male: prevWithTotal.male + 1,
          };
          if (curr.attendance.find((att) => att)) {
            prevWithTotal = {
              ...prevWithTotal,
              presence: {
                ...prevWithTotal.presence,
                total: prevWithTotal.presence.total + 1
              }
            };
            return {
              ...prevWithTotal,
              presence: {
                ...prevWithTotal.presence,
                male: prevWithTotal.presence.male + 1,
              },
            };
          } else {
            prevWithTotal = {
              ...prevWithTotal,
              absence: {
                ...prevWithTotal.absence,
                total: prevWithTotal.absence.total + 1
              }
            };
            return {
              ...prevWithTotal,
              absence: {
                ...prevWithTotal.absence,
                male: prevWithTotal.absence.male + 1,
              },
            };
          }
        }
      },
      {
        presence: {
          male: 0,
          female: 0,
          total: 0
        },
        absence: {
          male: 0,
          female: 0,
          total: 0
        },
        male: 0,
        female: 0,
        total: 0,
      }
    );
  }

  report(body) {
    const preFilter = [
      {
        $match: removeNilProps({
          groupId: toObjectId(body?.groupId),
        }),
      },
      {
        $lookup: {
          from: "groups",
          localField: "groupId",
          foreignField: "_id",
          as: "groupId",
        },
      },
      {
        $addFields: {
          groupId: {
            $arrayElemAt: ["$groupId", 0],
          },
        },
      },
      {
        $lookup: {
          from: "trainings",
          localField: "trainingId",
          foreignField: "_id",
          as: "trainingId",
        },
      },
      {
        $addFields: {
          trainingId: {
            $arrayElemAt: ["$trainingId", 0],
          },
        },
      },
      {
        $lookup: {
          from: "provinces",
          localField: "location.prov_id",
          foreignField: "_id",
          as: "location.prov_id",
        },
      },
      {
        $addFields: {
          "location.prov_id": {
            $arrayElemAt: ["$location.prov_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "location.dist_id",
          foreignField: "_id",
          as: "location.dist_id",
        },
      },
      {
        $addFields: {
          "location.dist_id": {
            $arrayElemAt: ["$location.dist_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "sectors",
          localField: "location.sect_id",
          foreignField: "_id",
          as: "location.sect_id",
        },
      },
      {
        $addFields: {
          "location.sect_id": {
            $arrayElemAt: ["$location.sect_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "cells",
          localField: "location.cell_id",
          foreignField: "_id",
          as: "location.cell_id",
        },
      },
      {
        $addFields: {
          "location.cell_id": {
            $arrayElemAt: ["$location.cell_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "villages",
          localField: "location.village_id",
          foreignField: "_id",
          as: "location.village_id",
        },
      },
      {
        $addFields: {
          "location.village_id": {
            $arrayElemAt: ["$location.village_id", 0],
          },
        },
      },
      {
        $unwind: "$trainees",
      },
    ];
    const filter = [{
      $match: removeNilProps({
        ...this.generateCommonFilters(body),
        groupId: body.groupId,
      }),
    }, { $sort: { 'trainees.attended': 1, startTime: 1, _id: 1 }}];
    return this.model.aggregate(preFilter.concat(filter));
  }

  async farmerAttendance(params) {
    // Unwind all trainees so we can compute data
    const unwind = {
      $unwind: "$trainees",
    };

    // Filter statistics by different values
    const filter = {
      $match: {
        "trainees.userId": params.id,
        status: "done",
      },
    };

    const group = {
      $group: {
        _id: "$trainees.attended",
        count: { $sum: 1 },
      },
    };

    // Run query // Query will return 4 objects or less each containing stats for each gender
    const summary = await this.model.aggregate([unwind, filter, group]);

    let attended = 0;
    let total = 0;

    // Compile results
    summary.forEach((data) => {
      if (data._id == true) {
        attended = data.count + attended;
      }
      total = data.count + total;
    });

    return attended !== 0 ? (attended * 100) / total : 0;
  }

  async groupAttendance(input) {
    const { reference, groupId } = input;

    const filters = {
      $match: removeNilProps({
        referenceId: toObjectId(reference),
        "trainees.groupId": groupId,
        status: scheduleStatus?.HAPPENED,
      }),
    };

    // Unwind all trainees so we can compute data
    const unwind = {
      $unwind: "$trainees",
    };

    // Filter statistics by different values
    const group = {
      $group: {
        _id: {
          absence: "$trainees.attended",
          trainingId: "$trainingId",
        },
        Unique: {
          $addToSet: "$trainees.userId",
        },
      },
    };

    const project = {
      $project: {
        _id: 0,
        absence: "$_id.absence",
        trainingId: "$_id.trainingId",
        unique: { $size: "$Unique" },
      },
    };

    const groupByAbsence = {
      $group: {
        _id: "$absence",
        count: { $sum: "$unique" },
      },
    };

    // Run query
    const summary = await this.model.aggregate([
      unwind,
      filters,
      group,
      project,
      groupByAbsence,
    ]);

    let attended = 0;
    let absent = 0;

    // Compile results
    summary.forEach((data) => {
      if (data._id == true) {
        attended = data.count + attended;
      } else {
        absent = data.count + absent;
      }
    });

    // If group has no presence or absence return an attendance rate of 0 by default
    if (attended + absent === 0) return 0;

    return attended !== 0 ? ~~((attended * 100) / (attended + absent)) : 0;
  }

  // This method returns a training associated trainers and groups
  getTrainingFilters(body) {
    const { referenceId, location, date } = body;

    let locSearchBy = "";
    if (location) locSearchBy = `location.${location.searchBy}`;

    let startDate = "";
    let endDate = "";
    if (date) {
      startDate = moment(date.from).startOf("day").toDate();
      endDate = moment(date.to).endOf("day").toDate();
    }

    // Filter statistics by different values
    const filter = {
      $match: removeNilProps({
        referenceId: toObjectId(referenceId),
        [locSearchBy]: toObjectId(location?.locationId),
        startTime: date ? { $gte: startDate, $lt: endDate } : undefined,
        isDeleted: false,
      }),
    };

    // Lookup Trainings
    const lookup = {
      $lookup: {
        from: "trainings",
        localField: "trainingId",
        foreignField: "_id",
        as: "training",
      },
    };

    // Unwind all tranings
    const unwind = {
      $unwind: "$training",
    };

    const unwindTrainees = {
      $unwind: "$trainees",
    };

    // Group by training
    const group = {
      $group: {
        _id: "$trainingId",
        trainingName: {
          $first: "$training.trainingName",
        },
        trainers: {
          $addToSet: "$trainer",
        },
        groups: {
          $addToSet: "$trainees.groupId",
        },
      },
    };

    return this.model.aggregate([
      filter,
      lookup,
      unwind,
      unwindTrainees,
      group,
    ]);
  }
}

module.exports.scheduleRepository = new ScheduleRepository(Schedule);
