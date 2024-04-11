var mongoose = require('mongoose');
var schema = mongoose.Schema;

let artifactSchema = new schema({
    name: {type:String, require:true},
    image: {type:String, require:true},
    description: {type:String, require:true},
    article: {type:String, require:true},
    source: {type:String, default:''},
    entryDate: {type:Date, default:Date.now},
});

module.exports = mongoose.model('artifact', artifactSchema, 'artifact');