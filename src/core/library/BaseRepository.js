class BaseRepository {
  constructor(model) {
    this.model = model;
    this.findOne = this.findOne.bind(this);
    this.find = this.find.bind(this);
    this.findAll = this.findAll.bind(this);
    this.update = this.update.bind(this);
    this.cFindOne = this.cFindOne.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this.create = this.create.bind(this);
  }

  find(data) {
    return this.model.find(data);
  }

  findAll() {
    return this.model.find();
  }

  findOne(id) {
    return this.model.findOne({
      _id: id
    });
  }

  cFindOne(data) {
    return this.model.findOne(data);
  }

  create(entity) {
    return this.model.create(entity);
  }

  update(entity) {
    return this.model.findByIdAndUpdate(entity._id, entity, { new: true });
  }

  remove(id) {
    this.model.findByIdAndRemove(id);
  }
}
module.exports = BaseRepository;
