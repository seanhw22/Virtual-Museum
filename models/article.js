var mongoose = require('mongoose');
var schema = mongoose.Schema;

let articleSchema = new schema({
    name: {type:String, require:true},
    icon: {type:String, require:true},
    description: {type:String, require:true},
    article: {type:String, require:true},
    entryDate: {type:Date, default:Date.now},
});

module.exports = mongoose.model('article', articleSchema, 'article');