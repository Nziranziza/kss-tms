const cron = require("node-cron");
const { claimToken } = require("../services/comm.service");

/* Every 23 hours claim token from Comm service */
cron.schedule("0 23 * * *", () => {
  claimToken();
});
