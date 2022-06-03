class BaseRepository {
  constructor(model) {
    this.model = model;
    this.findOne = this.findOne.bind(this);
    this.find = this.find.bind(this);
    this.update = this.update.bind(this);
    this.customFindOne = this.customFindOne.bind(this);
  }

  find(data) {
    return this.model.find(data);
  }

  findOne(id) {
    return this.model.findOne({
      _id: id
    });
  }

  customFindOne(data) {
    return this.model.findOne(data);
  }

  create(entity) {
    return this.model.create(entity);
  }

  update(entity) {
    return this.model.findByIdAndUpdate(entity._id, entity, { new: false });
  }

  remove(id) {
    this.model.findByIdAndRemove(id);
  }
}
module.exports = BaseRepository;
