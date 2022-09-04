const { ObjectId } = require("mongodb");
const BaseRepository = require("../../core/library/BaseRepository");
const { scheduleStatus } = require("../../tools/constants");
const { Schedule } = require("./schedule");
const moment = require("moment");

class ScheduleRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  findGroupSchedule(groupId, trainingId) {
    return super
      .cFindOne({ "trainees.groupId": groupId, trainingId })
      .populate("trainingId", "trainingName")
      .populate("groupId", "groupName")
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
  }

  findMemberAttendance(userId, trainingId) {
    return super.customFindAll({ "trainees.userId": userId, trainingId });
  }

  customFindAll(data) {
    return this.model
      .find(data)
      .populate("trainingId", "trainingName")
      .populate("groupId", "groupName")
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
  }

  findOne(id) {
    return this.model
      .findOne({ _id: id })
      .populate("trainingId", "trainingName")
      .populate("groupId", "groupName")
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
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

  // Get Attendance Summary
  async attendanceSummary(body) {
    const {
      trainingId,
      trainerId,
      scheduleId,
      referenceId,
      location,
      date,
      groupId,
    } = body;

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
      $match: {
        ...(trainingId && { trainingId: ObjectId(trainingId) }),
        ...(trainerId && { "trainer.userId": ObjectId(trainerId) }),
        ...(scheduleId && { _id: ObjectId(scheduleId) }),
        ...(referenceId && { referenceId: ObjectId(referenceId) }),
        ...(location && { [locSearchBy]: ObjectId(location.locationId) }),
        ...(date && {
          startTime: { $gte: startDate, $lt: endDate },
        }),
        isDeleted: false,
      },
    };

    // Unwind all trainees so we can compute data
    const unwind = {
      $unwind: "$trainees",
    };

    const filterGroups = {
      $match: {
        ...(groupId && { "trainees.groupId": groupId }),
      },
    };

    // Group by each gender and attendance
    const group = {
      $group: {
        _id: {
          absence: "$trainees.attended",
          gender: "$trainees.gender",
        },
        Unique: {
          $addToSet: "$trainees.userId",
        },
      },
    };

    // count by unique gender and absence status
    const project = {
      $project: {
        _id: 0,
        absence: "$_id.absence",
        gender: "$_id.gender",
        unique: { $size: "$Unique" },
      },
    };

    // Run query // Query will return 4 objects or less each containing stats for each gender
    const summary = await this.model.aggregate([
      filter,
      unwind,
      filterGroups,
      group,
      project,
    ]);

    let femaleAbsent = 0;
    let maleAbsent = 0;
    let femalePresent = 0;
    let malePresent = 0;

    // Compile results
    summary.forEach((data) => {
      if (data.gender == "M") {
        if (data.absence === true) malePresent = malePresent + data.unique;
        else maleAbsent = maleAbsent + data.unique;
      } else {
        if (data.absence === true) femalePresent = femalePresent + data.unique;
        else femaleAbsent = femaleAbsent + data.unique;
      }
    });

    return {
      femaleAbsent,
      femalePresent,
      malePresent,
      maleAbsent,
      totalAbsent: femaleAbsent + maleAbsent,
      totalPresent: malePresent + femalePresent,
      totalInvitees: femaleAbsent + femalePresent + maleAbsent + malePresent,
    };
  }

  statistics(body) {
    const preFilter = [
      {
        $match: {
          ...(body.groupId && {
            groupId: ObjectId(body.groupId),
          }),
        },
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
      $match: {
        ...(body.location &&
          body.location.prov_id && {
            "groupId.location.prov_id": ObjectId(body.location.prov_id),
          }),
        ...(body.location &&
          body.location.dist_id && {
            "groupId.location.dist_id": ObjectId(body.location.dist_id),
          }),
        ...(body.location &&
          body.location.sect_id && {
            "groupId.location.sect_id": ObjectId(body.location.sect_id),
          }),
        ...(body.location &&
          body.location.cell_id && {
            "groupId.location.cell_id": ObjectId(body.location.cell_id),
          }),
        ...(body.location &&
          body.location.village_id && {
            "groupId.location.village_id": ObjectId(body.location.village_id),
          }),
        ...(body.reference && { referenceId: ObjectId(body.reference) }),
        ...(body.trainingId && { "trainingId._id": ObjectId(body.trainingId) }),
        ...(body.trainerId && { "trainer.userId": ObjectId(body.trainerId) }),
        ...(body.status && { status: body.status }),
        ...(body.gender && { "trainees.gender": body.gender }),
        ...(body.date && {
          createdAt: {
            $gte: moment(body.date.from).startOf("day").toDate(),
            $lt: moment(body.date.to).endOf("day").toDate(),
          },
        }),
        ...{ isDeleted: false },
      },
    };

    const group = {
      $group: {
        _id: { gender: "$trainees.gender" },
        numberOfTrainees: { $sum: 1 },
        numberOfAttendedTrainees: {
          $sum: {
            $cond: {
              if: "$trainees.attended",
              then: 1,
              else: 0,
            },
          },
        },
      },
    };
    const trainees = {
      $project: {
        gender: "$_id.gender",
        numberOfTrainees: 1,
        numberOfAttendedTrainees: 1,
        _id: 0,
      },
    };

    return this.model.aggregate(preFilter.concat([filter, group, trainees]));
  }

  report(body) {
    const preFilter = [
      {
        $match: {
          ...(body.groupId && {
            groupId: ObjectId(body.groupId),
          }),
        },
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
    const filter = {
      $match: {
        ...(body.location &&
          body.location.prov_id && {
            "groupId.location.prov_id": ObjectId(body.location.prov_id),
          }),
        ...(body.location &&
          body.location.dist_id && {
            "groupId.location.dist_id": ObjectId(body.location.dist_id),
          }),
        ...(body.location &&
          body.location.sect_id && {
            "groupId.location.sect_id": ObjectId(body.location.sect_id),
          }),
        ...(body.location &&
          body.location.cell_id && {
            "groupId.location.cell_id": ObjectId(body.location.cell_id),
          }),
        ...(body.location &&
          body.location.village_id && {
            "groupId.location.village_id": ObjectId(body.location.village_id),
          }),
        ...(body.reference && { referenceId: ObjectId(body.reference) }),
        ...(body.trainingId && { "trainingId._id": ObjectId(body.trainingId) }),
        ...(body.trainerId && { "trainer.userId": ObjectId(body.trainerId) }),
        ...(body.status && { status: body.status }),
        ...(body.gender && { "trainees.gender": body.gender }),
        ...(body.date && {
          createdAt: {
            $gte: moment(body.date.from).startOf("day").toDate(),
            $lt: moment(body.date.to).endOf("day").toDate(),
          },
        }),
        ...{ isDeleted: false },
        ...{ isDeleted: false },
      },
    };
    return this.model.aggregate(preFilter.concat([filter]));
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
      $match: {
        ...(reference && { referenceId: ObjectId(reference) }),
        ...(groupId && { "trainees.groupId": groupId }),
        status: scheduleStatus.HAPPENED,
      },
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

    // Run query // Query will return 4 objects or less each containing stats for each gender
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

    if (attended + absent === 0) return 100;

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
      $match: {
        ...(referenceId && { referenceId: ObjectId(referenceId) }),
        ...(location && { [locSearchBy]: ObjectId(location.locationId) }),
        ...(date && {
          startTime: { $gte: startDate, $lt: endDate },
        }),
        isDeleted: false,
      },
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
