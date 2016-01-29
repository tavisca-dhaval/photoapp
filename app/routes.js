var customeJS = require('../public/js/node-scripts.js');
var ObjectID = require('mongodb').ObjectID;
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
    app.get('/hello', customeJS.isLoggedIn, function(req, res) {
        console.log(req.user)
        res.render('hello', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    app.get('/test',customeJS.isLoggedIn,function(req,res){
        res.render('test',{
            user:req.user
        });
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
    app.get('/favourite', customeJS.isLoggedIn, function(req,res){
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
        })
    });

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
            passport.authenticate('google', {
                successRedirect : '/category',
                failureRedirect : '/'
            }));

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

// route middleware to ensure user is logged in
// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated())
//         return next();

//     res.redirect('/login');
// }