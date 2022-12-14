const CustomError = require("../../core/helpers/customerError");
const { statusCodes } = require("../../utils/constants/common");

module.exports = function(schema) {
    schema.add({
      isDeleted: {
        type: Boolean,
        required: true,
        default: false
      },
      deletedAt: {
        type: Date,
        default: null
      }
    });
  
    schema.pre('save', function(next) {
      if (!this.isDeleted) {
        this.isDeleted = false;
      }
  
      if (!this.deletedAt) {
        this.deletedAt = null;
      }
      next();
    });
  
    schema.methods.softDelete = async function(callback) {
      this.isDeleted = true;
      this.deletedAt = new Date();
      try {
        await this.save(callback);
      } catch(error) {
        throw new CustomError('Record can not be deleted', statusCodes.SERVER_ERROR)
      }
    };
  
    schema.methods.restore = function(callback) {
      this.isDeleted = false;
      this.deletedAt = null;
      this.save(callback);
    };
  
    schema.query.isDeleted = function(cond) {
      if (typeof cond === 'undefined') {
        cond = true;
      }
      return this.find({
        isDeleted: cond
      });
    };
  
    schema.pre(['find', 'findOne', 'findById'], function() {
      this.where('isDeleted').in([false, undefined]);
    });
  
    schema.query.all = function() {
      this.find();
    };
  };
  