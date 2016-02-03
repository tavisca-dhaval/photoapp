// load all the things we need
// var LocalStrategy    = require('passport-local').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the user model

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
    	done(null, user)
        // User.findById(id, function(err, user) {
        //     done(err, user);
        // });
    });


    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
    	// profile.identifier=profile.id;
      	// return done(null, profile);
        // asynchronous
        // preocess.nextTick(function(){
        // 	return done(null, profile)
        // })
        
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {
                var db = req.db;
                var collection = db.get('user');
                collection.findOne({'email' : profile.emails[0].value},function(err,user){
                    if(err)
                        return done(err)
                    if(user){
                        return done(null, user);
                    }else{
                        collection.insert({userid:profile.id,token: token,name: profile.displayName,email: profile.emails[0].value,admin:false},{},function(err,records){
                            if(err)
                                throw err;
                            return done(null, records);
                        });
                    }
                })
            }

        });

    }));

};
