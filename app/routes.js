var customeJS = require('../public/js/node-scripts.js');
var ObjectID = require('mongodb').ObjectID;
var qs = require('qs');
var fs  = require('fs');
module.exports = function(app, passport) {

    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/login', function(req, res) {
        res.render('login');
    });

    app.get("*",function(req,res,next){
        res.locals.user = req.user || null;
        next();
    });
    // PROFILE SECTION =========================

    // PROFILE SECTION =========================
    app.get('/users', customeJS.isLoggedIn,function(req, res, next) {
        var db = req.db;
        var userCollection = db.get("user");
        var userid = req.user._id;
        userCollection.find(
            {_id: userid},
            function(err,docs){
                if(docs[0].admin){
                    userCollection.find({},{},function(err,docs){
                        res.render('userlist', {
                            userData : docs
                        });
                    });
                }else{
                    res.redirect("/category")
                }
            }
        )
    });
    app.post('/updateUserList', function(req,res){
        var db = req.db;
        var usercollection = db.get("user");
        var nobj = new ObjectID(req.body.userId);
        usercollection.update(
            {},
            {$set:{"admin":false}},
            {multi: true},
            function(err,docs){
                usercollection.update(
                    {"_id" : nobj},
                    {$set: {"admin":true}},
                    {upsert:true},
                    function(err,docs){
                        res.sendStatus(true);
                    }
                )
            }
        )
    });
    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('back');
    });

    app.get("/category", function(req, res){
        var email;
        var db = req.db;
        var collection = db.get('photocollection');
        var usercollection = db.get('user');
        var imgIds = "";
        if(req.user){
            usercollection.find({email:req.user.email},function(err,docs){
                if(docs[0].ImgIds)
                    imgIds = docs[0].ImgIds.toString();
            });
        }
        collection.find({},function(err,docs) {
            res.render("uploads/drag-drop",{imgIds:imgIds,images:docs});
        });
    });
    app.get('/favourite', function(req,res){
        if(req.user != undefined){
            var userEmail = req.user.email;
            var db = req.db;
            var photocollection = db.get('photocollection');
            var usercollection = db.get('user');
            usercollection.find({email:userEmail},function(err,docs){
                var Ids = [];
                var favImgIds  = docs[0].ImgIds;
                if(favImgIds !== undefined){
                    for( i = 0 ; i < favImgIds.length; i++)  
                    {
                        Ids.push(new ObjectID(favImgIds[i]))
                    }
                    photocollection.find(

                        { _id: { $in: Ids}},

                        function(err, docs)
                        {
                            res.render("userFavourite", {categoryImage:docs}) ;   
                        }
                    )
                }else{
                    res.render("userFavourite", {categoryImage:[]});
                    res.end();
                }
            });
        }else{
            res.redirect("/category")
        }
    });
    app.post("/renameImage",function(req,res){
        var db = req.db;
        var collection = db.get('photocollection');
        var oldName = req.body.oldName+"."+req.body.extention;
        var newName = req.body.newName+"."+req.body.extention;
        var oldFilePath = './public/images/'+oldName;
        var oldThumbFilePath = './public/images/thumb/'+oldName;
        var newFilePath = './public/images/'+newName;
        var newThumbFilePath = './public/images/thumb/'+newName;
        fs.rename(oldFilePath, newFilePath, function (err, data) {
            if(err) console.log(err)
        });
        fs.rename(oldThumbFilePath, newThumbFilePath, function (err, data) {
            if(err) console.log(err)
        });
        collection.update(
            { _id: req.body.id},
            {$set:{"filename":newName}},
            function(err,docs){
                res.send(200)
            }
        )
    });
    app.get("/searchAlbums",function(req, res){   
        console.log(req.query)
        var txtval = req.query.query
        var db = req.db;    
        var collection = db.get('albumCollection');
        collection.find(
                {albumName : {'$regex': txtval}},   
                function(err, docs){                
                    res.send(docs);
                }
            )
    });
    app.post('/saveAlbum',function(req,res){
        var db = req.db;    
        var albumCollection = db.get('albumCollection');
        var x=qs.parse(req.body);
        for(var i=0;i<x.idsss.length;i++){
            var nobj= new ObjectID(x.idsss[i]);
            albumCollection.update(
                {albumName : req.body.albumName},
                {$addToSet : {"ImgIds": nobj}},
                {upsert : true} ,
                function(err, docs){                
                     
                    res.send(docs);
                }       
            )
        }
    });
    app.get('/albums',function(req,res){
        var db = req.db;    
        var collection = db.get('albumCollection');

        collection.find(
            {},
            function(err, docs){
                res.render("uploads/albums",{albumsList:docs})          
            }
        );
    });
    app.get('/albums/:name', function(req,res){
        var db = req.db;    
        var collection = db.get('albumCollection');
        var photocollection = db.get('photocollection');
        var albumName = req.params.name;

        collection.find({albumName : albumName},
            function(err, docs)     
                {
                    var Ids = [];
                    var ImageIdReleatedwithAlbum  = docs[0].ImgIds

                    for( i = 0 ; i < ImageIdReleatedwithAlbum.length; i++)  
                    {
                        Ids.push(new ObjectID(ImageIdReleatedwithAlbum[i]))
                    }

                    photocollection.find(

                        { _id: { $in: Ids}},

                        function(err, docs)
                        {
                            res.render("uploads/albumDetails", {categoryImage:docs, albumName : albumName}) ;   
                        }
                    )
                }
            )
    })
    app.get("/showTags",function(req,res){
        var db = req.db;    
        var collection = db.get('tagCollection');

        collection.find(
            {},
            function(err, docs){
                res.render("uploads/tags",{TagsList:docs})          
            }
        );
    });
    app.post('/removeFavourite',function(req,res){
        var db = req.db;    
        var userCollection = db.get('user');
        var nobj= new ObjectID(req.body.ids);
        if(req.user){
            userCollection.update(
                {email: req.user.email},
                {$pull:{"ImgIds": nobj}},
                {multi:true},
                function(err,docs){
                    res.send(true);
                }
            )
        }else{
            res.end();
        }
    })
    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        // app.get('/login', function(req, res) {
        //     res.render('login.ejs', { message: req.flash('loginMessage') });
        // });

        // // process the login form
        // app.post('/login', passport.authenticate('local-login', {
        //     successRedirect : '/profile', // redirect to the secure profile section
        //     failureRedirect : '/login', // redirect back to the signup page if there is an error
        //     failureFlash : true // allow flash messages
        // }));

        // // SIGNUP =================================
        // // show the signup form
        // app.get('/signup', function(req, res) {
        //     res.render('signup.ejs', { message: req.flash('loginMessage') });
        // });

        // // process the signup form
        // app.post('/signup', passport.authenticate('local-signup', {
        //     successRedirect : '/profile', // redirect to the secure profile section
        //     failureRedirect : '/signup', // redirect back to the signup page if there is an error
        //     failureFlash : true // allow flash messages
        // }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google'), 
            function(req,res,next){
                res.redirect("back")
            }
        );

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
        // app.get('/connect/local', function(req, res) {
        //     res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        // });
        // app.post('/connect/local', passport.authenticate('local-signup', {
        //     successRedirect : '/profile', // redirect to the secure profile section
        //     failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        //     failureFlash : true // allow flash messages
        // }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/hello',
                failureRedirect : '/'
            }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/hello');
        });
    });
};