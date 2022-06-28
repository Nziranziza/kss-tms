const trainingStatus = {
  SCHEDULED: "scheduled",
  CONDUCTED: "conducted",
  NOT_SCHEDULED: "not_scheduled",
};

const scheduleStatus = {
  PENDING: "pending",
  HAPPENED: "happened"
};

const attendanceStatus = {
  ATTENDED: "attended",
  ABSENT: "absent",
  NOT_INVITED: "not_invited"
};

module.exports.trainingStatus = trainingStatus;
module.exports.scheduleStatus = scheduleStatus;
module.exports.attendanceStatus = attendanceStatus;
