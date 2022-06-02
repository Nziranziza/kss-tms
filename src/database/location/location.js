const mongoose = require("mongoose");

const provinces = mongoose.model(
    "provinces",
    new mongoose.Schema({
        id: {type: Number, index: true},
        namek: {type: String},
        namee: {type: String},
        namef: {type: String}
    })
);

const districts = mongoose.model(
    "districts",
    new mongoose.Schema({
        id: {type: String, index: true},
        name: {type: String},
        province_id: {type: Number, index: true}
    })
);

const sectors = mongoose.model(
    "sectors",
    new mongoose.Schema({
        id: {type: String, index: true},
        name: {type: String},
        district_id: {type: String, index: true}
    })
);

const cells = mongoose.model(
    "cells",
    new mongoose.Schema({
        id: {type: String, index: true},
        name: {type: String},
        sector_id: {type: String, index: true}
    })
);

const villages = mongoose.model(
    "villages",
    new mongoose.Schema({
        vill_id: {type: String, index: true},
        village: {type: String},
        cell_id: {type: String, index: true}
    })
);

// Export all models

module.exports.villages = villages;
module.exports.cells = cells;
module.exports.sectors = sectors;
module.exports.districts = districts;
module.exports.provinces = provinces;
