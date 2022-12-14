class BaseRepository {
  constructor(model) {
    this.model = model;
    this.find = this.find.bind(this);
    this.findById = this.findById.bind(this);
    this.findOne = this.findOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  /**
   * @description retrive all data with corresponding filters
   * @param {Object<string, any>} filters
   * @returns {Promise<Object<string, any>[]>} data
   */
  find(filters = {}) {
    return this.model.find(filters);
  }

  /**
   * @description retrieve data by Id
   * @param {ObjectId} id
   * @returns {Promise<Object<string, any>>}
   */
  findById(id) {
    return this.model.findById(id);
  }

  /**
   * @description retrieve a single record
   * @param {Object<string, any>} data
   * @returns {Promise<Object<string, any>>}
   */
  findOne(data) {
    return this.model.findOne(data);
  }

  /**
   * @description create a record
   * @param {Object<string, any>} entity
   * @returns {Promise<Object<string, any>>}
   */
  create(entity) {
    return this.model.create(entity);
  }

  /**
   * @description update a single record based on id
   * @param {ObjectId} id
   * @param {Object<string, any>} entity
   * @returns {Promise<Object<string, any>>}
   */
  update(id, entity) {
    return this.model.findByIdAndUpdate(id, entity, { new: true });
  }

  /**
   * @description remove a record by id
   * @param {ObjectId} id
   * @returns {Promise<Object<string, any>>}
   */
  remove(id) {
    return this.model.findByIdAndRemove(id);
  }
}

module.exports = BaseRepository;
