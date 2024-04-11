var mongoose = require('mongoose');
var schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

let usersSchema = new schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    },
    entryDate: {type:Date, default:Date.now}
});

usersSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', usersSchema, 'users');