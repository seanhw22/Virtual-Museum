var mongoose = require('mongoose');
var schema = mongoose.Schema;

const answerSchema = new schema({
    text: { type: String, required: true },
    correct: { type: Boolean, default: false }
});

const quizSchema = new schema({
    question: { type: String, required: true },
    answers: [answerSchema]
});

module.exports = mongoose.model('quiz', quizSchema, 'quiz');