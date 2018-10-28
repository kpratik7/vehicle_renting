var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://pratik:computer1993@cluster0-lmxzc.gcp.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true,
    useCreateIndex: true
});


// var db = mongoose.connection;

//user schema
var VehicleSchema = mongoose.Schema({
    vehicle_id: {
        type: String,
        index: true
    },
    vehicle_type: {
        type: String
    },
    vehicle_name: {
        type: String
    },
    vehicle_manuf: {
        type: String
    },
    vehicle_inuse: {
        type: Boolean,
        default: false
    }
});

var Vehicle = module.exports = mongoose.model('Vehicle', VehicleSchema);

module.exports.getUserById = function (id, callback) {
    Vehicle.findById(id, callback);
    // console.log(id)
}

module.exports.addVehicle = function (newVehicle, callback) {
    newVehicle.save(callback);
}