const BaseRepository = require("core/library/BaseRepository");
const { sendAppSMS } = require("services/comm.service");
const { Communication } = require("./communication");
class CommunicationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }
  async create(message, recipients, input, type, purpose) {
    const comm = {
      type: type,
      sender: input.sender,
      recipients: recipients,
      content: message,
      senderId: input.senderId,
      purpose: purpose,
    };

    // Build recipients
    let receivers = [];
    for (const recipient of recipients) {
      // If no phonenumber don't add user to recipients
      if (recipient.phoneNumber) {
        receivers.push(recipient.phoneNumber);
      }
    }

    const data = {
      recipients: receivers,
      message,
      sender: input.sender,
    };

    const sms = await sendAppSMS(data);
    if (sms.data) {
      await this.model.create({
        ...comm,
        batch_id: sms.data.data.batch_id,
      });
      return sms.data;
    } else {
      return undefined;
    }
  }
}
module.exports.commRepo = new CommunicationRepository(Communication);
