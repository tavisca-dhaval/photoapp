var express = require('express');
var fs       = require('fs');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mkdirp = require('mkdirp');
var connect = require('connect');
var easyimg = require('easyimage');
var fse = require('fs-extra');
var routes = require('./routes');
var user = require('./routes/users');
var qs = require('qs');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var session = require('express-session');
var FacebookStrategy = require('passport-facebook').Strategy;

var GOOGLE_CONSUMER_KEY = '978631038383-mc0lf23hgbhnrcvm8b22un241vdq04f0.apps.googleusercontent.com';
var GOOGLE_CONSUMER_SECRET = 'hMcJZNWysmQhGTtZdIWFRYdA';

var FACEBOOK_APP_ID = '1117700208242214';
var FACEBOOK_APP_SECRET = 'bec64151b08c653d5d98f793e37c74e7';


// New Code
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');

var app = express();

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(connect.methodOverride());

app.use(connect.cookieParser());
app.use(connect.logger('dev'));
app.use(connect.bodyParser());
app.use(connect.json());
app.use(connect.urlencoded());


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.get('/editcategory', routes.editcategory)
app.get('/updatecategory', routes.updatecategory)

app.get('/imginfo', routes.imageinformation)


app.post('/saveAlbum', routes.saveAlbum)
app.post('/deleteImage', routes.deleteImage)
app.get('/allTags', routes.allTags)
app.get('/saveTags', routes.saveTags)
app.get('/removeTag', routes.removeTag)
app.get('/searchbytag', routes.searchimagebytags)


app.get('/showTags', routes.showTags)

app.get('/showTags/:name', routes.tagDetails)

app.post('/checkImageExist',routes.imageExistCheck);

app.post('/category', routes.category)
app.get('/albums', routes.allAlbums);
app.get('/login', routes.login);

app.get('/albums/:name', routes.albumDetails)


/*app.get("/showTags/:name", function(req, res){
    res.render("uploads/tagsDetails");
});
*/





app.get("/", function(req,res){
    res.render("home");
});

app.get("/users/new", function(req, res){
    res.render("new");
});
/*
app.get("/users", function(req, res){
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});
*/

app.post('/users', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {
            res.redirect("users");
        }
    });
});

app.param('name',function(req,res,next,name){
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({username: name},function(err,docs){
        getUser = docs[0];
        next();
    })
})

app.get('/users/:name',function(req, res){
    res.render("show",{user: getUser});
})
app.get('/users/:name/edit',function(req, res){
    res.render("edit",{user: getUser});
});

app.put('/users/:name',function(req,res){
    var db = req.db;
    var collection = db.get('usercollection');
    collection.update(
        {username : req.params.name},
        {$set : {username : req.body.username}},
        function(err){
            res.redirect('/users')
        }
    )
});

app.get("/category/new", function(req, res){
    res.render('uploads/new');
});

app.get("/category", function(req, res){
    var db = req.db;
    var collection = db.get('photocollection');
    collection.find({},{},function(err,docs) {
        res.render("uploads/drag-drop",{images:docs.reverse()});
    });
});

// login/signup

app.get('/login',function(req,res){
    res.render('login');
})
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CONSUMER_KEY,  
    clientSecret: GOOGLE_CONSUMER_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile);
    done(null, profile);
  }
));

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    profileFields: ['id', 'displayName', 'photos', 'email', 'name'],
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // User.findOrCreate(. .., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
    process.nextTick(function() {
        if (!profile.provider) profile.provider = 'facebook';
        // console.log(process);
        done(null, profile);
    });
  }
));

passport.serializeUser(function(user, done) {  
    console.log('serializeUser');
    if (!user){
      throw new Error('invalid user, login failed!');
    }
    else {
      session.user = {
        id: user.id,
        displayName: user.displayName,
        email: user.emails[0].value,
        provider: user.provider
      }
      console.log(session.user);
    };

    done(null, session.user);
});

passport.deserializeUser(function(id, done) {  
    console.log('deserializeUser');
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['email']
}));
  
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/users' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('login success');
    res.redirect('/login');
});


// Redirect the user to Facebook for authentication.  When complete, Facebook will redirect the user back to the application 
// at '/auth/facebook/callback'
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email']
}));

// Facebook will redirect the user to this URL after approval.  Finish the authentication process by attempting to obtain an 
// access token. If access was granted, the user will be logged in.  Otherwise, authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/users' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('login success');
    res.redirect('/login');
});

module.exports = app;