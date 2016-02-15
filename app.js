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
var archiver = require('archiver');
var expressSession = require('express-session');

// configuration ===============================================================

require('./config/passport')(passport); // pass passport for configuration

// New Code
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');

var app = express();

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

app.use(expressSession({
 secret : process.env.SESSION_SECRET ||'secret' ,
 saveUninitialized : false,
 resave : false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.get('/editcategory', routes.editcategory)
app.get('/updatecategory', routes.updatecategory)

app.get('/imginfo', routes.imageinformation)


// app.post('/saveAlbum', routes.saveAlbum)
app.post('/deleteImage', routes.deleteImage)
app.get('/allTags', routes.allTags)
app.get('/saveTags', routes.saveTags)
app.get('/removeTag', routes.removeTag)
app.get('/searchbytag', routes.searchimagebytags)


// app.get('/showTags', routes.showTags)

app.get('/showTags/:name', routes.tagDetails)

app.post('/checkImageExist',routes.imageExistCheck);

app.post('/category', routes.category)
// app.get('/albums', routes.allAlbums);
app.post('/favourite', routes.favourite);
app.post('/download',routes.download);
app.get('/downloadImg',routes.downloadImg);

// app.get('/albums/:name', routes.albumDetails)

// app.post('/doFavourite', routes.doFavourite)

/*app.get("/showTags/:name", function(req, res){
    res.render("uploads/tagsDetails");
});
*/





app.get("/", function(req,res){
    res.render("home");
});
// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

module.exports = app;