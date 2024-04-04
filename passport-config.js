const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const users = require('./models/users')
const User = users; 
function initialize(passport,getUserByUsername){

    const authenticateUser = async (username, password,done)=>{

        const user = getUserByUsername(username);
        if(user == null){
            return done(null,false,{message:'No user with that username'});
        }
        try{
            if(await bcrypt.compare(password,user.password)){
                return done(null,user);
            }else{
                return done(null,false,{message:'Password incorrect'});
            }
        }catch(e){
            return done(e);
        }

    }
    passport.use(new LocalStrategy(User.authenticate(), authenticateUser)); 
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
}

module.exports = initialize