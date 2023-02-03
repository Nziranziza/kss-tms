const { isNil, omitBy } = require("lodash");

/**
 * @description Removes properties with null 
 * or undefined values from a given object
 * @param {*} object 
 * @returns 
 */

module.exports = function (object = {}) {
  return omitBy(object, isNil)
};
