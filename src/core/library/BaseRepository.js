const {ObjectId} = require("mongodb");

class BaseRepository {
    constructor(model) {
        this.model = model;
        this.findOne = this.findOne.bind(this);
        this.find = this.find.bind(this);
        this.findAll = this.findAll.bind(this);
        this.update = this.update.bind(this);
        this.customFindOne = this.customFindOne.bind(this);
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
            _id: ObjectId(id)
        });
    }

    customFindOne(data) {
        return this.model.findOne(data);
    }

    customFindAll(data) {
        return this.model.find(data);
    }

    create(entity) {
        return this.model.create(entity);
    }

    update(entity) {
        return this.model.findByIdAndUpdate(entity._id, entity, {new: true});
    }

    customUpdate(id, entity) {
        return this.model.findByIdAndUpdate(id, entity, {new: true});
    }

    remove(id) {
        this.model.findByIdAndRemove(id);
    }
}

module.exports = BaseRepository;
