const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Artifact = require('../models/artifacts');

router.post('/new', async (req, res) => {
    let artifactName = req.body.artifactName;
    let artifactImage = req.body.artifactImage;
    let artifactDescription = req.body.artifactDescription;
    let artifactArticle = req.body.artifactArticle;

    let qry = {name:artifactName};

    let searchResults = await Artifact.findOne(qry).then( async(userData) => {
        if (!userData) {
            let newArtifact = new Artifact({
                name: artifactName,
                image: artifactImage,
                description: artifactDescription,
                article: artifactArticle
            });

            let saveArtifact = await newArtifact.save();
        }
        res.redirect('/logged-in')
    });
});

module.exports = router;