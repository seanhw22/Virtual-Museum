const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/users');

router.use(express.static("public"));

// delete user
router.get('/delete/:id', checkAdmin, async(req, res) => {

    let userId = req.params.id;
    let qry = {_id:userId};
    let deleteResult = await User.deleteOne(qry);
    res.redirect('/user-list');
});

// get user
router.get('/:id', checkAdmin, async(req, res) => {

    let id = req.params.id;
    let err = '';

    let qry = {_id:id};

    let itemResult = await User.find(qry).then( (itemData) => {
        if (itemData == null) {
            err = 'Invalid ID';
        }

        res.render('edit-user-admin', {title:'Edit Admin Priviliges', item:itemData, error:err});
    });
});

// update user admin priviliges
router.post('/save', checkAdmin, async(req, res) => {
    let userId = req.body.userId;
    var userAdmin;
    if (req.body.admin == 'true'){
        userAdmin = true;
    } else {
        userAdmin = false;
    }

    let qry = {_id:userId};

    let saveData = {
        $set: {
            admin: userAdmin
        }
    }

    let updateResult = await User.updateOne(qry, saveData);

    res.redirect('/user-list');
});

router.get('/:id/update-password', checkAuthenticated, async(req,res) => {
    res.render('update-password', {id : req.params.id})
})

// update password
router.post('/:id/update-password', checkAuthenticated, async(req,res) => {
    let qry = {_id:req.params.id};
    User.findOne(qry).then( (user) => {
        user.changePassword(req.body.old, req.body.new)
        .then(() => {
            console.log('Password changed.');
            res.redirect('/');
        })
        .catch((error) => {
            console.log(error);
        })
    })
    .catch((error) => {
        console.log(error);
    });
})

// delete own account
router.get('/:id/delete-self', checkAuthenticated, async(req, res) => {

    let userId = req.params.id;
    let qry = {_id:userId};
    let deleteResult = await User.deleteOne(qry);
    res.redirect('/');
});

//check authentication
function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
};

//check if admin
function checkAdmin(req,res,next){
    if(req.isAuthenticated() && req.user.admin == true){
        return next();
    }
    res.redirect('/');
}

module.exports = router;