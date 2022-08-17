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

const receptionStatus = {
  NOT_SENT: 'NOT_SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  REJECTED: 'REJECTED',
  UNREACHABLE: 'UNREACHABLE'
}

const smsPurpose = {
  TRAINING_INVITE: 'TRAINING_INVITE',
  INFORM_VISIT: 'INFORM_VISIT' 
}
const groupStatus = {
  ACTIVE: "active",
  INACTIVE: "INACTIVE"

};

module.exports.trainingStatus = trainingStatus;
module.exports.scheduleStatus = scheduleStatus;
module.exports.attendanceStatus = attendanceStatus;
module.exports.receptionStatus = receptionStatus;
module.exports.smsPurpose = smsPurpose;
module.exports.groupStatus = groupStatus;
