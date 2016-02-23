# photoapp
photoapp is a tool to access all the image-related work under a single application. It facilitates the users to search and download images, based on the **_#tags_** and **_file names_**.

## Getting started with OneDrive API

### 1. Authentication
photoapp uses `passport-google-oauth` strategy [Passport](http://passportjs.org/) for authenticating with [Google](http://www.google.com/) using OAuth 1.0a and OAuth 2.0. This module lets you authenticate using Google in your Node.js applications. By plugging into Passport, Google authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/)

```Javascript
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;

passport.use(new GoogleStrategy({
    consumerKey: GOOGLE_CONSUMER_KEY,
    consumerSecret: GOOGLE_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```
Use `passport.authenticate()`, specifying the `'google'` strategy, to authenticate requests.
