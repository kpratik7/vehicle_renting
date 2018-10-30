var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://pratik:computer1993@cluster0-lmxzc.gcp.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true,
    useCreateIndex: true
});


var LocationSchema = mongoose.Schema({
    location_name: {
        type: String
    },
    location_image: {
        type: String
    }
});

var Location = module.exports = mongoose.model('Location', LocationSchema);

module.exports.getLocationById = function (id, callback) {
    Location.findById(id, callback);
    // console.log(id)
}

module.exports.addLocation = function (newLocation, callback) {
    newLocation.save(callback);
}