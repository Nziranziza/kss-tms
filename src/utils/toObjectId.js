const { ObjectId } = require("mongodb");

/**
 * @description Convert string to objectId
 * if string is not provided undefined is returned
 * @param {string} id
 * @returns {ObjectId | undefined}
 */
module.exports = (id) => {
  return id ? ObjectId(id) : undefined;
};
