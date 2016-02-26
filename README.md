# PhotoApp
PhotoApp is a tool to access all the image-related work under a single application. It facilitates the users to search and download images, based on the **_#tags_** and **_file names_**. It is developed using the Nodejs and ExpressJs with the Jade templating engine.

## Getting started with PhotoApp API

### 1. Authentication
PhotoApp uses `passport-google-oauth` strategy [Passport](http://passportjs.org/) for authenticating with [Google](http://www.google.com/) using OAuth 1.0a and OAuth 2.0. This module lets you authenticate using Google in your Node.js applications. By plugging into Passport, Google authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/)

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
PhotoApp uses third-party javascript library [Dropzonejs](http://www.dropzonejs.com/) to uplopad photos, using drag-and-drop method, as well as by browsing from file system. Include the flie ```<script src="./path/to/dropzone.js"></script>```. Dropzone is now activated and available as ```window.Dropzone```. Using this, super-user can upload `single photo` as well as `multiple photos` at a time. If duplicate photo are added, it provides a check on, whether to keep both copies or replace the existing one. To read and save the uploaded file:
``` Javascript
fs.readFile(req.files.displayImage.path, function (err, data) {
  // ...
  var newPath = __dirname + "/uploads/uploadedFileName";
  fs.writeFile(newPath, data, function (err) {
    res.redirect("back");
  });
});
```

### 3. Search based on file name or #tags
PhotoApp gives user, the ability to search images, based on the **_#tags_**. The search box uses the bootstrap  **autosuggest** feature, for the search. As soon as the user types first character of the tag, it auto-populates the dropdown with the already existing labels matching the same.

### 4. #Tags
It facilitates the user, for adding/deleting/editing the tags to the images. Each #tag can be assigned to single or multiple images. User can view images based on the #tags, selecting the **Tags** tab. Clicking on each `#tag` opens the images assigned with it. 
```Javascript

exports.saveTags = function(req, res)
{
	var tagName = req.query.tagName;
	var id = new ObjectID(req.query.id);

	var db = req.db;	
	var collection = db.get('xyz');
	var tagCollection = db.get('abc');
	collection.update( ... )
	tagCollection.update( ... )
};
```

### 5. Exifdata
EXIF stands for Exchangeable Image File, a format that is a standard for storing interchange information in digital photography image files using JPEG compression. All new digital cameras use the EXIF annotation, storing information on the image such as shutter speed, exposure compensation, F number, what metering system was used, if a flash was used, ISO number, date and time the image was taken, white balance, auxiliary lenses that were used and resolution.

### 6. Image Gallery
`fancybox` library is used for displaying images in the style of "lightbox" that floats overtop of web page.

### 7. Rename Image

User provided certain access rights, can rename. 

Inline-style: 
![rename image](https://drive.google.com/file/d/0B77YCQPaVz3PaDRscTIyV1hTM3c/view?usp=sharing"Rename Image")
