const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Artifact = require('../models/artifacts');

router.use(express.static("public"));

function insert_br(text)
{
    var text_with_br = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    return text_with_br;

}

// create new artifact
router.post('/new', checkAdmin, async (req, res) => {
    let artifactName = req.body.artifactName;
    let artifactImage = req.body.artifactImage;
    let artifactDescription = req.body.artifactDescription;
    let artifactArticle = req.body.artifactArticle;
    let artifactSource = req.body.artifactSource;
    let qry = {name:artifactName};

    artifactDescription = insert_br(artifactDescription);
    artifactArticle = insert_br(artifactArticle);

    let searchResults = await Artifact.findOne(qry).then( async(userData) => {
        if (!userData) {
            let newArtifact = new Artifact({
                name: artifactName,
                image: artifactImage,
                description: artifactDescription,
                article: artifactArticle,
                source: artifactSource,
            });

            let saveArtifact = await newArtifact.save();
        }
        res.redirect('/artifact-list')
    });
});

// delete artifact
router.get('/delete/:id', checkAdmin, async(req, res) => {

    let artifactId = req.params.id;
    let qry = {_id:artifactId};
    let deleteResult = await Artifact.deleteOne(qry);
    res.redirect('/artifact-list');
});

// get artifact
router.get('/:id', checkAdmin, async(req, res) => {

    let id = req.params.id;
    let err = '';

    let qry = {_id:id};

    let itemResult = await Artifact.find(qry).then( (itemData) => {
        if (itemData == null) {
            err = 'Invalid ID';
        }

        res.render('edit-artifact', {title:'Edit Artifact', item:itemData, error:err});
    });
});

// update artifact
router.post('/save', checkAdmin, async(req, res) => {
    let artifactId = req.body.artifactId;
    let artifactName = req.body.artifactName;
    let artifactImage = req.body.artifactImage;
    let artifactDescription = req.body.artifactDescription;
    let artifactArticle = req.body.artifactArticle;
    let artifactSource = req.body.artifactSource;

    artifactDescription = insert_br(artifactDescription);
    artifactArticle = insert_br(artifactArticle);

    let qry = {_id:artifactId};

    let saveData = {
        $set: {
            name: artifactName,
            image: artifactImage,
            description: artifactDescription,
            article: artifactArticle,
            source: artifactSource,
        }
    }

    let updateResult = await Artifact.updateOne(qry, saveData);

    res.redirect('/artifact-list');
});

//check if admin
function checkAdmin(req,res,next){
    if(req.isAuthenticated() && req.user.admin == true){
        return next();
    }
    res.redirect('/');
}

module.exports = router;