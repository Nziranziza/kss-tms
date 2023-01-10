const { isNil, omitBy } = require("lodash");

module.exports = function (object = {}) {
  return omitBy(object, isNil)
};
