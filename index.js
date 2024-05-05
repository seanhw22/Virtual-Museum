const express = require("express");
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const users = require('./models/users.js');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require("express-ejs-layouts");
const flash = require('express-flash');
const artifactRoute = require('./routes/artifact.js');
const artifacts = require('./models/artifacts.js');
const userRoute = require('./routes/user.js');
const forgotPasswordRoute = require('./routes/forgot-password.js');
const quizzes = require('./models/quizzes.js');
const quizRoute = require('./routes/quiz.js')
const User = users;
const Artifact = artifacts;
const Quiz = quizzes;

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
app.use(flash());
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
    var id = '';
    var name = '';
    var admin = false;
    if(req.isAuthenticated()){
        id = req.user._id;
        name = ', '+req.user.username;
        admin = req.user.admin;
    }
    res.render("index.ejs", { 
        id : id,
        name : name,
        admin: admin,
        title : "Museum Virtual", 
        mahasiswa : mahasiswa, 
        layouts : 'layout', 
        loggedIn : req.isAuthenticated(), 
        data : artifactResult, 
        search:'', 
        message:'',
    });
});

// search in homepage
app.post('/search', async(req, res) => {
    var sort = req.body.sort;
    const artifactResult = (await Artifact.find().lean());
    var id;
    var name = '';
    var admin = false;
    if(req.isAuthenticated()){
        id = req.user._id;
        name = ', '+req.user.username;
        admin = req.user.admin;
    }
    let q = req.body.searchInput;
    let artifactData = null;
    let qry = {name:{$regex: q, $options:'i'}};
    let message = '';
  
    if (q != null) {
        var artifactSearch;
        if (sort == "ascending"){
            artifactSearch = await Artifact.find(qry).sort({ name: 1 });
        } else if (sort == "descending"){
            artifactSearch = await Artifact.find(qry).sort({ name: -1 });
        } else {
            artifactSearch = await Artifact.find(qry);
        }
        artifactData = artifactSearch;
        if(artifactData.length == 0){
            artifactData = artifactResult;
            message = 'No results.'
        }
    } else {
        q = 'Search';
        artifactData = artifactResult;
    }
  
    res.render("index.ejs", {
        id : id,
        name : name,
        admin: admin,
        title : "Museum Virtual", 
        mahasiswa : mahasiswa, 
        layouts: 'layout', 
        loggedIn : 
        req.isAuthenticated(), 
        data : artifactData, 
        search:q, 
        message:message});
});

//login
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', {message:''})
});

//register
app.get('/register', checkNotAuthenticated,(req, res) => {
    res.render('register', { messages: {} });
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
        res.render('register', { messages: { error: err.message } });
      }
      else {
        res.redirect('/login');
      }
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

// check if admin
function checkAdmin(req,res,next){
    if(req.isAuthenticated() && req.user.admin == true){
        return next();
    }
    res.redirect('/');
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

app.get('/add-artifact', checkAdmin, (req, res) => {
    res.render("add-artifact.ejs", {layouts: 'layout'})
});

app.get('/artifact-list', checkAdmin, async(req, res) => {
    const artifactResult = (await Artifact.find().lean());
    res.render("artifact.ejs", {layouts: 'layout', data : artifactResult, search:'', message:''})
})

// search for artifact in modify artifacts
app.post('/q', checkAdmin, async(req, res) => {
    var sort = req.body.sort;
    const artifactResult = (await Artifact.find().lean());
    let q = req.body.searchInput;
    let artifactData = null;
    let qry = {name:{$regex: q, $options:'i'}};
    let message = '';
  
    if (q != null) {
        var artifactSearch;
        if (sort == "ascending"){
            artifactSearch = await Artifact.find(qry).sort({ name: 1 });
        } else if (sort == "descending"){
            artifactSearch = await Artifact.find(qry).sort({ name: -1 });
        } else {
            artifactSearch = await Artifact.find(qry);
        }
        artifactData = artifactSearch;
        if(artifactData.length == 0){
            artifactData = artifactResult;
            message = 'No results.'
        }
    } else {
        q = 'Search';
        artifactData = artifactResult;
    }
  
    res.render("artifact.ejs", {layouts: 'layout', data : artifactData, search:q, message:message});
});

//quiz
app.use('/quiz', quizRoute);

app.get('/take-quiz', checkAuthenticated, async(req,res) => {
    const quizResult = (await Quiz.find().lean());
    res.render('quiz.ejs', {data: quizResult})
})

app.get('/quiz-list', checkAdmin, async(req, res) => {
    const quizResult = (await Quiz.find().lean());
    res.render("quiz-list.ejs", {layouts: 'layout', data : quizResult, search:'', message:''})
})

app.get('/add-quiz', checkAdmin, (req, res) => {
    res.render("add-quiz.ejs", {layouts: 'layout'})
});

app.post('/quiz-search', checkAdmin, async(req, res) => {
    var sort = req.body.sort;
    const quizResult = (await Quiz.find().lean());
    let q = req.body.searchInput;
    let quizData = null;
    let qry = {question:{$regex: q, $options:'i'}};
    let message = '';
  
    if (q != null) {
        var quizSearch;
        if (sort == "ascending"){
            quizSearch = await Quiz.find(qry).sort({ question: 1 });
        } else if (sort == "descending"){
            quizSearch = await Quiz.find(qry).sort({ question: -1 });
        } else {
            quizSearch = await Quiz.find(qry);
        }
        quizData = quizSearch;
        if(quizData.length == 0){
            quizData = quizResult;
            message = 'No results.'
        }
    } else {
        q = 'Search';
        quizData = quizResult;
    }
  
    res.render("quiz-list.ejs", {layouts: 'layout', data : quizData, search:q, message:message});
});

// modify users
app.use('/user', userRoute);

app.get('/user-list', checkAdmin, async(req, res) => {
    const userResult = (await User.find().lean());
    let currentUserData = req.user.username;
    res.render("modify-users.ejs", {layouts: 'layout', data : userResult, current: currentUserData, search:'', message:''})
})

app.post('/user-search', checkAdmin, async(req, res) => {
    var sort = req.body.sort;
    console.log(sort)
    const userResult = (await User.find().lean());
    let q = req.body.searchInput;
    let userData = null;
    let qry = {username:{$regex: q, $options:'i'}};
    let message = '';
    let currentUserData = req.user.username;
  
    if (q != null) {
        var userSearch;
        if (sort == "ascending"){
            userSearch = await User.find(qry).sort({ name: 1 });
        } else if (sort == "descending"){
            userSearch = await User.find(qry).sort({ name: -1 });
        } else {
            userSearch = await User.find(qry);
        }
        userData = userSearch;
        if(userData.length == 0){
            userData = userResult;
            message = 'No results.'
        }
        if(userData.length == 1 && userData[0].username == currentUserData){
            userData = userResult;
            message = 'You cannot search & set admin priviliges on your own account.'
        }
    } else {
        q = 'Search';
        userData = userResult;
    }
  
    res.render("modify-users.ejs", {layouts: 'layout', data : userData, current: currentUserData, search:q, message:message});
});

// forgot password
app.use('/forgot-password', forgotPasswordRoute);

// account settings
app.get('/account-settings', checkAuthenticated, async(req,res) => {
    const id = req.user._id;
    res.render("account-settings", {id: id})
})

// port
app.listen(PORT, () => {
    console.log(`Webserver app listening on port ${PORT}`);
})