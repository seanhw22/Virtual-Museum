const express = require("express");
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const users = require('./models/users.js')
const passport = require('passport')
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require("express-ejs-layouts");
const artifactRoute = require('./routes/artifact.js')
const artifacts = require('./models/artifacts.js');
const User = users;
const Artifact = artifacts;

//mongo
dotenv.config()
const PORT = process.env.PORT || 3000
const MONGO_URL = process.env.MONGO_URL

app.use(express.json())

app.use(morgan('dev'))

mongoose.connect(MONGO_URL)
    .then(() => console.log(`MongoDB connected ${MONGO_URL}`))
    .catch(err => console.log(err))

//init passport and others
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

app.use(express.urlencoded({ extended: true }));

app.use (methodOverride('_method'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize()); 
app.use(passport.session());


const initializePassport = require('./passport-config');

initializePassport(
    passport,
    username => User.find(user => user.username === username)
);

//ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//static
app.use(express.static("public"));

//layouts
app.use(expressLayouts);

// -----
const mahasiswa = [
    {name : "Sean", email : "sean.535220019@stu.untar.ac.id"},
    {name : "Aldo", email : "valentino.535220040@stu.untar.ac.id"},
    {name : "Paulin", email : "paulina.535220048@stu.untar.ac.id"}
]

app.use(function(req, res, next) {
    res.locals.loggedIn = req.loggedIn;
    next();
});
// -----

// homepage
app.get('/', async(req, res) => {
    const artifactResult = (await Artifact.find().lean());
    res.render("index.ejs", {title : "Museum Virtual", mahasiswa : mahasiswa, layouts : 'layout', loggedIn : req.isAuthenticated(), data : artifactResult, search:'', message:''})
});

// search
app.post('/search', async(req, res) => {
    const artifactResult = (await Artifact.find().lean());
    let q = req.body.searchInput;
    let artifactData = null;
    let qry = {name:{$regex:'^' + q, $options:'i'}};
    let message = '';
  
    if (q != null) {
        let artifactSearch = await Artifact.find(qry).then( (data) => {
            artifactData = data;
            if(artifactData.length == 0){
                artifactData = artifactResult;
                message = 'No results.'
            }
        });
    } else {
        q = 'Search';
        artifactData = artifactResult;
    }
  
    res.render("index.ejs", {title : "Museum Virtual", mahasiswa : mahasiswa, layouts: 'layout', loggedIn : req.isAuthenticated(), data : artifactData, search:q, message:message});
});

//login
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
});

//register
app.get('/register', checkNotAuthenticated,(req, res) => {
    res.render('register');
});

//post login
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

//post register
app.post('/register', function(req, res, next) {
    User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err) {
      if (err) {
        console.log('Error while registering user! Error : ', err);
        return next(err);
      }
      console.log('User registered!');
  
      res.redirect('/login');
    });
});

//check authentication
function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
};

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

//logout
app.delete('/logout', (req, res, next) => {
    req.logOut(function
    (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// artifact
app.use('/artifact', artifactRoute);

app.get('/add-artifact', checkAuthenticated, (req, res) => {
    res.render("add-artifact.ejs", {layouts: 'layout'})
});

app.get('/artifact-list', checkAuthenticated, async(req, res) => {
    const artifactResult = (await Artifact.find().lean());
    res.render("artifact.ejs", {layouts: 'layout', data : artifactResult, search:'', message:''})
})

// search for artifact in modify artifacts
app.post('/q', checkAuthenticated, async(req, res) => {
    const artifactResult = (await Artifact.find().lean());
    let q = req.body.searchInput;
    let artifactData = null;
    let qry = {name:{$regex:'^' + q, $options:'i'}};
    let message = '';
  
    if (q != null) {
        let artifactSearch = await Artifact.find(qry).then( (data) => {
            artifactData = data;
            if(artifactData.length == 0){
                artifactData = artifactResult;
                message = 'No results.'
            }
        });
    } else {
        q = 'Search';
        artifactData = artifactResult;
    }
  
    res.render("artifact.ejs", {layouts: 'layout', data : artifactData, search:q, message:message});
});

// port
app.listen(PORT, () => {
    console.log(`Webserver app listening on port ${PORT}`);
})