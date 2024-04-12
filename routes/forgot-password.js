const express = require('express');
const router = express.Router();
const User = require('../models/users');
router.use(express.static("public"));

router.get('/', checkNotAuthenticated, (req,res) => {
    res.render('forgot-check-user', {message: ''})
})
router.post('/', checkNotAuthenticated, async(req,res) => {
    var username = req.body.username;
    let qry = {username:username};
    User.findOne(qry).then( (user) => {
        if (user){
            res.redirect(`/forgot-password/${user._id}`)
        }
        else {
            res.render('forgot-check-user', {message: 'This user does not exist.'})
        }
    })
    .catch((error) => {
        console.log(error);
    });
})
router.get('/:id', checkNotAuthenticated, async(req,res) => {
    let qry = {_id : req.params.id};
    try {
        const user = await User.findOne(qry);
        const username = user.username;
        res.render('forgot-change-password', {id : req.params.id, username: username, message: ''});
    } catch (error) {
        console.error(error);
    }
})
router.post('/:id', checkNotAuthenticated, async(req,res) => {
    let qry = {_id:req.params.id};
    User.findOne(qry).then(function(sanitizedUser){
        if (sanitizedUser){
            sanitizedUser.setPassword(req.body.password, function(){
                sanitizedUser.save();
                res.render('login', {message: 'Password reset successful.'});
            });
        } else {
            res.render('forgot-check-user', {message: 'This user does not exist.'});
        }
    },function(err){
        console.error(err);
    })
    .catch((error) => {
        console.log(error);
    });
})

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

module.exports = router;