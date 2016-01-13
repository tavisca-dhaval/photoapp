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


module.exports = app;