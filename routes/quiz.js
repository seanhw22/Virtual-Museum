const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Quiz = require('../models/quizzes');

router.use(express.static("public"));

function insert_br(text)
{
    var text_with_br = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    return text_with_br;

}

// create new quiz
router.post('/new', checkAdmin, async (req, res) => {
    let quizQuestion = req.body.quizQuestion;
    let answerIndex = req.body.answerIndex;
    var quizAnswers = [];
    var quizAnswer = {};

    for (let i = 1; i < answerIndex; i++) {
        var quizAnswer = {};
        quizAnswer.text = req.body['quizAnswer' + i];
        quizAnswer.correct = req.body['correct' + i] === 'true';
        quizAnswers.push(quizAnswer)
    }

    let qry = {question:quizQuestion};

    quizQuestion = insert_br(quizQuestion);

    let searchResults = await Quiz.findOne(qry).then( async(userData) => {
        if (!userData) {
            let newQuiz = new Quiz({
                question: quizQuestion,
                answers: quizAnswers,
            });

            let saveQuiz = await newQuiz.save();
        }
        res.redirect('/quiz-list')
    });
});

// delete quiz
router.get('/delete/:id', checkAdmin, async(req, res) => {

    let quizId = req.params.id;
    let qry = {_id:quizId};
    let deleteResult = await Quiz.deleteOne(qry);
    res.redirect('/quiz-list');
});

// get quiz
router.get('/:id', async(req, res) => {

    let id = req.params.id;
    let err = '';

    let qry = {_id:id};

    let itemResult = await Quiz.find(qry).then( (itemData) => {
        if (itemData == null) {
            err = 'Invalid ID';
        }

        res.render('edit-quiz', {title:'Edit Quiz', item:itemData, error:err});
    });
});

// update quiz
router.post('/save', checkAdmin, async(req, res) => {
    let quizId = req.body.quizId;
    let quizQuestion = req.body.quizQuestion;
    let answerIndex = req.body.answerIndex;
    console.log(answerIndex)
    var quizAnswers = [];
    var quizAnswer = {};
    for (let i = 1; i <= answerIndex; i++) {
        var quizAnswer = {};
        quizAnswer.text = req.body['quizAnswer' + i];
        quizAnswer.correct = req.body['correct' + i] === 'true';
        quizAnswers.push(quizAnswer)
    }
    console.log(quizAnswers)

    quizQuestion = insert_br(quizQuestion);

    let qry = {_id:quizId};

    let saveData = {
        $set: {
            question: quizQuestion,
            answers: quizAnswers
        }
    }

    let updateResult = await Quiz.updateOne(qry, saveData);

    res.redirect('/');
});

//check if admin
function checkAdmin(req,res,next){
    if(req.isAuthenticated() && req.user.admin == true){
        return next();
    }
    res.redirect('/');
}

module.exports = router;