var fs  = require('fs');
var mkdirp = require('mkdirp');
var easyimg = require('easyimage');
var fse = require('fs-extra');
var path = require('path');
var ObjectID = require('mongodb').ObjectID;
var customeJS = require('../public/js/node-scripts.js');
var ExifImage = require('exif').ExifImage;
var bodyParser = require('body-parser');
var qs = require('qs');
var session = require('express-session');
var archiver = require('archiver');


exports.editcategory = function(req, res){   
    var cName = req.query.name;
    var db = req.db;
    var collection = db.get('photocollection');
    collection.find({catName:cName}, function(err, docs){
        res.render("uploads/edit", {category: docs[0],title:"Update category"});

    });
};

exports.updatecategory = function(req, res)
{
	var updatename = req.query.updatename;
	var oldname = req.query.oldValue;

	if(updatename === oldname){
        res.redirect('/category');
    }else{
        var db = req.db;
        var collection = db.get('photocollection');
        collection.update(
            {catName : oldname},
            {$set : {"catName": updatename}},
            {multi: true},
            function(err){            	
                fse.copy(path.join(__dirname, "../public/images/"+oldname), path.join(__dirname, "../public/images/"+updatename), function(err){
                    if (err) {
                        return console.error(err);
                    }
                    fse.remove(path.join(__dirname, "../public/images/"+oldname), function (err) {
                        if (err) return console.error(err)
                        fse.removeSync(path.join(__dirname, "../public/images/"+oldname));
                    	res.send("Demo");

                    });
                });
                
            }
        )
    }
};

exports.saveTags = function(req, res)
{
	var tagName = req.query.tagName;
	var id = new ObjectID(req.query.id);

	var db = req.db;	
	var collection = db.get('photocollection');
	var tagCollection = db.get('tagCollection');
	collection.update(
            {_id : id},
            {$addToSet : {"Tags": tagName}},  
            {multi: true},      
            function(err, docs){            	
	             
	            res.send(docs);
            }
        )
	tagCollection.update(
			{tagName : tagName},
			{$addToSet : {"ImgIds": id}},
			{upsert : true} ,
			function(err, docs){            	
	             
	            res.send(docs);
            }		

		)

	
};
exports.allTags = function(req, res)
{
	var id = new ObjectID(req.query.id);

	var db = req.db;	
	var collection = db.get('photocollection');
	collection.find(
            {_id : id},	
            function(err, docs){            	
	             
	             res.send(docs);
            }
        )
	
	
};
exports.removeTag = function(req, res)
{
	var deleteTag = req.query.deleteTag;
	var id = new ObjectID(req.query.id);

	var db = req.db;	
	var collection = db.get('photocollection');
	var tagCollection = db.get('tagCollection');
	collection.update(
            {_id : id},
            {$pull : {"Tags": deleteTag}},            
            function(err, docs){            	
	             
	             res.send("Tag Removed");
            }
        )
	tagCollection.update({tagName : deleteTag},
	{$pull : {"ImgIds": id}},   
	function(err, docs)
		{			
		}
	)
	
};


exports.tagDetails = function(req, res)
{
	var db = req.db;	
	var collection = db.get('tagCollection');
	var photocollection = db.get('photocollection');
	var tagName = req.params.name;

	collection.find({tagName : tagName},
		function(err, docs)		
			{

				var Ids = [];
				var ImageIdReleatedwithTags  = docs[0].ImgIds

				for( i = 0 ; i < ImageIdReleatedwithTags.length; i++)	
				{
					Ids.push(new ObjectID(ImageIdReleatedwithTags[i]))
				}

				photocollection.find(

					{ _id: { $in: Ids}},

					function(err, docs)
					{
						res.render("uploads/tagsDetails", {categoryImage:docs, tagName : tagName}) ;	
					}
				)

			}
		)

};
exports.imageinformation = function(req, res)
{
	var imgname = req.query.imgname;

	new ExifImage({ image : path.join(__dirname,'../public/images/'+imgname+'')}, function (error, exifData) {		
    if (error)
        console.log('Error: '+error.message);
    else
        res.send(exifData); // Do something with your data! 
	});
};

exports.imageExistCheck = function(req, res){
	var db = req.db;
    var collection = db.get('photocollection');
    var filePath = req.files.file.path;
    collection.find({"filename":req.files.file.name},function(err, docs){
    	var property = {"exist": false, "filePath" : req.files.file.path,"fileName":req.files.file.name};
    	if(docs.length > 0){
    		property.exist = true;
    	}
    	res.send(property)
    });
}

exports.category = function(req, res)
{	
	var db = req.db;
    var collection = db.get('photocollection');
    var filePath = './public/images/'+req.body.fileName; 
    var fileOName = req.body.fileName.split(".")[0];
    var extension =  req.body.fileName.split(".")[1];
	fs.readFile(req.body.filePath, function (err, data) {
	    // write image file into image folder
	    fs.writeFile(filePath,data,function(err){
	        if(err){
	        	throw(err)
	        }else{
	        	collection.update(
	        	{
			        filename: req.body.fileName
			    },
			    {
			        filename: req.body.fileName
			    }
			    ,{upsert: true}
			    ,function(err,categories){
			        if (err){
			            res.json(err);  
			        }
			    });
	        	res.send(true);
	        }

	    });
	    easyimg.resize({
	         src: req.body.filePath, 
	         dst:'./public/images/thumb/'+req.body.fileName,
	         width:235,
	         height:700
	      }).then(
	      function(image) {
	         console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
	      },
	      function (err) {
	        console.log(err);
	      }
	    );
	});
};
exports.searchimagebytags = function(req, res)
{	
	var txtval = req.query.query
	var db = req.db;	
	var collection = db.get('tagCollection');
	collection.find(
            {"tagName" : {'$regex': txtval}},	
            function(err, docs){            	
				res.send(docs);
            }
        )
}
exports.download = function (req, res) {
	var output = fs.createWriteStream('./public/new.zip');
	var archive = archiver('zip');
	var filesNames = qs.parse(req.body).files;
	console.log(filesNames);	
	var selected = [];

	for(var i=0;i<filesNames.length;i++){
		selected.push(filesNames[i])
	}
		// for (var i =0 ; i < filesNames.length; i++) {
		// 	selected.push(filesNames[i]);
		// }
	
	output.on('close', function() {
	  console.log(archive.pointer() + ' total bytes');
	  console.log('archiver has been finalized and the output file descriptor has closed.');
	  return res.status(200).send('OK').end();
	  // res.download('./public/' + "/new.zip")
	});

	archive.on('error', function(err) {
	  throw err;
	});
	archive.pipe(output);

	archive.bulk([	    
	    { expand: true, cwd: 'public/images/', src: [selected], dest: '/'}
	]);

	archive.finalize();
	
};
exports.downloadImg = function(req,res){
	// var filePath = './public/'+req.params.file;
	// console.log(req.params.file)
	res.download('./public/new.zip',function(err){
		// fs.unlink('./public/new.zip')
	});
}
exports.deleteImage = function(req, res)
{
	var db = req.db;	
	var collection = db.get('photocollection');
	var albumCollection = db.get('albumCollection');
	var tagCollection = db.get('tagCollection');
	var x=qs.parse(req.body);
	for(var i=0;i<x.ids.length;i++){
		var nobj= new ObjectID(x.ids[i]);
		var imgname = x.imageNames[i];
		fse.remove(path.join(__dirname, "../public/images/"+imgname), function (err) {
            if (err) return console.error(err)
        });
		fse.remove(path.join(__dirname, "../public/images/thumb/"+imgname), function (err) {
            if (err) return console.error(err)
        });
		albumCollection.update(
			{},
			{$pull : {"ImgIds": nobj}},
			{ multi: true },
			function(err,docs){
				res.send(docs)
			}
		)
		tagCollection.update(
			{},
			{$pull : {"ImgIds": nobj}},
			{ multi: true },
			function(err,docs){
				res.send(docs)
			}
		)
		collection.remove(
            {_id : nobj},            
            function(err, docs){      
            	res.send(docs)
            }
        );
	}
};

exports.favourite = function(req,res){
	var db = req.db;	
	var userCollection = db.get('user');
	var nobj= new ObjectID(req.body.ids);
	if(req.user){
		userCollection.update(
			{email: req.user.email},
			{$addToSet:{"ImgIds": nobj}},
			{multi:true},
			function(err,docs){
				res.send(true);
			}
		)
	}else{
		res.end();
	}
}