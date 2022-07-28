const trainingStatus = {
  SCHEDULED: "scheduled",
  CONDUCTED: "conducted",
  NOT_SCHEDULED: "not_scheduled",
};

const scheduleStatus = {
  PENDING: "pending",
  HAPPENED: "done"
};

const attendanceStatus = {
  ATTENDED: "attended",
  ABSENT: "absent",
  NOT_INVITED: "not_invited"
};

const groupStatus = {
  ACTIVE: "active",
  INACTIVE: "INACTIVE"

};

module.exports.trainingStatus = trainingStatus;
module.exports.scheduleStatus = scheduleStatus;
module.exports.attendanceStatus = attendanceStatus;
module.exports.groupStatus = groupStatus;
