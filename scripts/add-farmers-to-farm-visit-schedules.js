process.env.NODE_PATH = __dirname.split('/').slice(0, -1).join('/') + '/src';
require('module').Module._initPaths();
require("../src/startup/mongo")();

const {
  FarmVisitSchedule,
} = require("../src/database/farm-visit-schedule/farm-visit-schedule");


FarmVisitSchedule.countDocuments({ isDeleted: false }).then(async (count) => {
  const limit = 25;
  const pages = Math.ceil(count / limit);
  for (let i = 0; i < pages; i++) {
    const offset = i * limit;
    console.log(`Processing ${i + 1} of ${pages} pages`);
    const data = await FarmVisitSchedule.find()
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit);
    for (const [index, visit] of data.entries()) {
      const uniqueIDs = [...new Set(visit.farms.map(({ owner: { userId } }) => userId.toString()))];
      const farmers = uniqueIDs.map((id) =>
        visit.farms.find(({ owner: { userId } }) => userId == id).owner
      );
      await visit.update({
        farmers,
      });
      console.log(
        `Processed ${visit._id}`,
        `${Number.parseFloat(((offset + index + 1) / count) * 100).toFixed(2)}%`
      );
    }
  }
});
