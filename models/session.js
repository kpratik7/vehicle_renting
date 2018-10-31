var mongoose = require('mongoose');
var mongodb = require('mongodb')

mongoose.connect('mongodb+srv://pratik:computer1993@cluster0-lmxzc.gcp.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true,
    useCreateIndex: true
});

var db = mongoose.connection;

var SessionSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    vehicle_id: {
        type: String,
        index: true
    },
    session_start: {
        type: Number,
        default: Date
    },
    session_end: {
        type: Number,
        default: null
    }
});

var Session = module.exports = mongoose.model('Session', SessionSchema);

module.exports.getUserById = function (id, callback) {
    Session.findById(id, callback);
    // console.log(id)
}

module.exports.addSession = function (newSession, callback) {
    newSession.save(callback);
}