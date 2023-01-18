module.exports = [
  {
    path: "farm.location.prov_id",
    select: "namek",
  },
  {
    path: "farm.location.dist_id",
    select: "name",
  },
  {
    path: "farm.location.sect_id",
    select: "name",
  },
  {
    path: "farm.location.cell_id",
    select: "name",
  },
  {
    path: "farm.location.village_id",
    select: "name",
  },
  {
    path: "gap",
  },
  {
    path: "groupId",
  },
  {
    path: "scheduleId",
    populate: {
      path: 'gaps'
    }
  },
];
