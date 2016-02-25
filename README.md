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

### 2. Drag & Drop to upload photos
photoApp uses third-party javascript library [Dropzonejs](http://www.dropzonejs.com/) to uplopad photos, using drag-and-drop method, as well as by browsing from file system. Include the flie ```<script src="./path/to/dropzone.js"></script>```. Dropzone is now activated and available as ```window.Dropzone```. Using this, super-user can upload `single photo` as well as `multiple photos` at a time. If duplicate photo are added, it provides a check on, whether to keep both copies or replace the existing one.

### 3. Search based on file name or #tags
photoApp gives user, the ability to search images, based on the **_#tags_** or **_file name_**. The search box uses the bootstrap  **autosuggest** feature, to help the search. As soon as the user types first three characters of the name of file or tag, it auto-populates the dropdown with the already existing labels.

### 4. #Tags
It facilitates the user, for adding/deleting/editing the tags to the images. Each image can be added to single or multiple #tags, as per the image. Selecting an image, and then click the ![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1") icon, which in turn opens 

### 5. Exifdata
EXIF stands for Exchangeable Image File, a format that is a standard for storing interchange information in digital photography image files using JPEG compression. All new digital cameras use the EXIF annotation, storing information on the image such as shutter speed, exposure compensation, F number, what metering system was used, if a flash was used, ISO number, date and time the image was taken, white balance, auxiliary lenses that were used and resolution.

### 6. Image Gallery
`fancybox` library is used for displaying images in the style of "lightbox" that floats overtop of web page. 
