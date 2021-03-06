var SelectedImage = null;
var SelectedImgName = null;
var imgArray=[];
$(function(){
	if($('#searchbytag').length){
		 $('#searchbytag').typeahead(	 	
		 	{
		 		onSelect: function(item) {
		 			console.log(item.text)
		 			location.replace('/showTags/'+item.text)
		    },
		   ajax: {
	            url: '/searchbytag',
	            method: 'get',
	            triggerLength: 1,
	            displayField: "tagName",
	        },

		 });
	}
	if($('#albumName').length){
	 	$('#albumName').typeahead(	 	
	 		{
	 			onSelect: function(item) {
	 				console.log(item.text)
	    	},
		   	ajax: {
	            url: '/searchAlbums',
	            method: 'get',
	            triggerLength: 1,
	            displayField: "albumName",
	        },
	 	});
	 }
	 $('.setAdmin').on('click',function(){
	 	var userId = $('input[name="super-user"]:checked').val();
	 	var params = {userId : userId};
	 	$.post('/updateUserList', params, function(data){
		});
	 });

	$('.create-album').on('click',function(){
		if($('.img-selector.active').length){
			$('#myModal').modal('toggle');
		}else{
			$('#alertModal').modal('toggle');
		}
	});
	$('#createAlbum').on('click',function(){
		var imgIdArray = [];
		$('.img-selector.active').each(function(){
			imgIdArray.push($(this).attr('id'));
		})
		var albumName = $('#myModal input[name="albumName"]').val();
		var params ={ albumName:albumName, idsss: imgIdArray};	
		$('.album-create-notification span').html(albumName);
		$.post('/saveAlbum', params, function(data){
		});
		$( document ).ajaxComplete(function() {
		  $('#myModal').modal('toggle');
		  $('.album-create-notification').addClass('show');
		});
	});
	$('.rename-image').on('click',function(){
		if($('.img-selector.active').length){
			if($('.img-selector.active').length > 1){
				$('#alertModal h4').not('.more-than-one-message').hide();
				$('#alertModal h4.more-than-one-message').removeClass('hide');
				$('#alertModal').modal('toggle');
			}else{
				var fileName = $('.img-selector.active').attr('imgname').split(".")[0];
				var fileExtention = $('.img-selector.active').attr('imgname').split(".")[1];
				$('#renameModal #oldName').val(fileName);
				$('#renameModal #oldExtention').val(fileExtention);
				$('#renameModal').modal('toggle');
			}
		}else{
			$('#alertModal').modal('toggle');
		}
	});
	$('#renameFile').on('click',function(){
		var oldName = $('#renameModal input[name="oldName"]').val();
		var oldExtention = $('#renameModal input[name="oldExtention"]').val();
		var newName = $('#renameModal input[name="newName"]').val();
		if(newName != ""){
			var params ={ id:$('.img-selector.active').attr('id'), oldName: oldName, extention: oldExtention, newName: newName};
			$.post("/renameImage",params,function(){}).complete(function(response){
				if(response.status == 200){
					$('#renameModal').modal('hide');
				}
			});
		}
	});
	$('#alertModal').on('hide.bs.modal',function(){
		$(this).find('h4').show();
		$(this).find('h4.more-than-one-message').addClass('hide');
	})
	$('.fav-image').on('click',function(){
		if($('#user-email').val() == "loggedOut"){
			$('#login').modal('show');
		}else{
			var _this = $(this);
			var params ={ ids: $(this).attr('id')};
			if($(this).hasClass('fav')){
				$.post('/removeFavourite', params,function(data){}).complete(function(){
					_this.removeClass('fav');
				});
			}else{
				$.post('/favourite', params, function(data){
				}).complete(function(response){
					_this.addClass('fav');
				});
			}
		}
	});
	$('.remove-favourite').on('click',function(){
		var parentElement = $(this).closest('li');
		var imgId = $(this).attr('id');
		var params = {ids:imgId};
		console.log(params)
		$.post('/removeFavourite', params,function(data){}).complete(function(){
			parentElement.remove();
		});
	})
	$('.remove-from-album').on('click',function(){
		var parentElement = $(this).closest('li');
		var albumName = $('#albumName').attr('album-name');
		var imgId = $(this).attr('id');
		var params = {ids:imgId,albumName:albumName};
		// console.log(params)
		$.post('/removeFromAlbum', params,function(data){}).complete(function(){
			parentElement.remove();
		});
	})
	$('.delete-image').on('click',function(){
		var xid = [];
		var xname = [];
		$('.img-box.active').each(function(){
			xid.push($(this).find('span.img-selector').attr('id'));
			xname.push($(this).find('span.img-selector').attr('imgname'));
		});
		var params ={ ids: xid, imageNames: xname};
		$.post('/deleteImage', params, function(data){
		});
		$( document ).ajaxComplete(function() {
		  document.location.reload();
		});
	});
	$('.cat-edit').on('click',function(){	
	 var name = $(this).attr('categoryname');
	 var parameters = { name: name};
	 $(this).closest('li').addClass('edited')
	$.get( '/editcategory', parameters, function(data)
		{
		 $popupContainer = $("#popup");
		 $popupContainer.html(data);

		}).done(function() { 		
			 $('#myModal').modal('toggle');
		});
		
	});

	$('#downloadImg').on('click',function(){		
		//var imgArray = [];
		var params ={ files:imgArray };	
		$.post('/download', params, function(data){
		});

		$( document ).ajaxComplete(function() {
			// $.get('/downloadImg/new.zip',function(data){})
			window.location.replace(window.location.protocol + "//" + window.location.host + '/downloadImg');
		});
	});

	$("#popup").on('click','#updatecategory', function(){
		var name = $("#categoryName").val();
		var oldValue = $("#categoryName").attr('value');
	 	var parameters ={ updatename:name, oldValue: oldValue};		
		$.get('/updatecategory', parameters, function(data)
			{
		 	 	$('#myModal').modal('toggle');
		 	 	$('.category-list').find('.edited').html('<a class="category" href="/category/'+name +'"><p class="cat-name">'+name+'</p></a><p class="settings"><a class="cat-edit" categoryname="'+name+'"></a></p>')
			});
	});

	 $("#addnewtag").keypress(function(e) {
		if (e.keyCode == 13) {
			var SelectedVal = $.trim($(this).val());
			$(this).val(" ");
			if(SelectedVal != undefined && SelectedVal != "")
			{			
				$('#tag-list').append('<div class="InfoPane-tag"><a class="InfoPane-tagLink" tag-name='+SelectedVal+'><div class="InfoPane-tagName"> #'+SelectedVal+'</div></a> <a class="InfoPane-removeTag"><i class="glyphicon glyphicon-remove"></i></a></div>');
				
			 	var parameters ={ tagName:SelectedVal, id: SelectedImage};		
				$.get('/saveTags', parameters, function(data)
					{
					 
					});

			}
		}
	});
	function changeFilename(string){
		var oFilename =string.split(".")[0];
		var oFileExtension = string.split(".")[1];
		return oFilename+"_"+Math.floor(Math.random() * (300 - 200 + 1) + 200)+"."+oFileExtension
	}
	var counterRequest = 0;
	function sendFile(property){
		$.post("/category",property,function(){

		}).done(function(){
			if($('.image-display-div').length){
				var totalImageDisplayDiv = $('.image-display-div').length;
				if(totalImageDisplayDiv == $('.done').length){
					location.reload();
				}
			}
		});
	}
	if($('#dropableDiv').length){
		var myDropzone = new Dropzone("#dropableDiv", 
			{ 
				url: "/checkImageExist",
				clickable: '.upload_link',
				init: function(){
					this.on("dragenter",function(file,responsenew){
						$('#dropableDiv').addClass('show');
					});
					this.on("drop",function(file,responsenew){
						console.log(this.files.length)
						$('#dropableDiv').removeClass('show');
					});
					this.on("dragleave",function(file,responsenew){
						$('#dropableDiv').removeClass('show');
					});
					this.on("adding",function(file,responsenew){
						console.log(123)
						$('.image-container').addClass('small')
					});

					this.on("success",function(file,responsenew){
						console.log(responsenew)
						var property = {"filePath" : responsenew.filePath, "fileName": responsenew.fileName}
						if(responsenew.exist){
							var changedFileName = changeFilename(responsenew.fileName);
							$('.popupImageDrag .popupImgContainer').append('<img class="pull-left" src="/images/photo.png"><div class="image-display-div">'+property.fileName+'<a href="javascript:void(0)" class="cancel-upload">X</a><p class="img-message">A file with this name already exists. Would you like to replace the existing one, or rename it and keep them both?<br><a href="javascript:void(0)" class="replace btn btn-success" data-image-name="'+responsenew.fileName+'" data-image-path="'+responsenew.filePath+'">Replace</a> <a href="javascript:void(0)" class="keep btn btn-danger" data-image-name="'+changedFileName+'" data-image-path="'+responsenew.filePath+'">Keep both</a></p></div><div class="clear"></div>');
							$('.popupImageDrag').show();
						}else{
							// $('.popupImageDrag .popupImgContainer').append('<div>'+property.fileName+'</div>')
							sendFile(property);
						}
					});
					this.on("totaluploadprogress",function(totalPercentage, totalBytesToBeSent, totalBytesSent ){
						console.log(totalPercentage)
					})
					this.on("queuecomplete",function(file,responsenew){
						$(document).ajaxComplete(function() {
							if(!$('.image-display-div').length){
								location.reload();
							}
						});
					});
				}
			}
		);
	}
	$(document).on('click','.replace,.keep',function(){
		var property = {"filePath" : $(this).data('image-path'), "fileName": $(this).data('image-name')}
		$(this).closest('.image-display-div').addClass('done');
		$(this).closest('.image-display-div .img-message').html("Done");
		sendFile(property);
	});
	$(document).on('click','.cancel-upload',function(){
		var totalImageDisplayDiv = $('.image-display-div').length;
		$(this).closest('.image-display-div').addClass('done canceled');
		$(this).closest('.image-display-div .img-message').html("Canceled")
		if(totalImageDisplayDiv == $('.done').length){
			location.reload();
		}else{
			console.log("you can't close")
		}
	});

/********************* Effects Js****************/
$('.img-selector').on('click',function(e){
	e.stopPropagation();
	var imgId = $(this).closest('.img-box').find('.img-selector').attr('id');
	$(this).toggleClass('active');
	$(this).closest('.img-box').toggleClass('active');
	$(this).parent().toggleClass('selected');
	$(".zipArchive").show();
	if($(this).hasClass('active'))
	{
		SelectedImage = $(this).attr('id');
		SelectedImgName = $(this).attr('imgName');
	}
	else{
		
		SelectedImage = null;	
		SelectedImgName = null
		$(".zipArchive").hide();		
	}
	imgArray.push(SelectedImgName);
		
});

$(".zipArchive").hide();

$("#img-info").on('click',function(){

	var tagContainer = $('.tagssection');	
	$('.image-container').toggleClass('small')
	if($(tagContainer).hasClass('show')){
		$(tagContainer).removeClass('show');
		$('#tag-list').empty();
		$('#imgInformation').empty();
	}else{
		$(tagContainer).addClass('show');	
		if(SelectedImage != null || SelectedImage != undefined){
			var parameters ={ id: SelectedImage};		
			$.get('/allTags', parameters, function(data){
				TagsArry = data[0].Tags;			  
			}).done(function(){
				if(TagsArry != undefined){
					$.each(TagsArry, function(i){
						$('#tag-list').append('<div class="InfoPane-tag"><a class="InfoPane-tagLink" tag-name='+TagsArry[i]+'><div class="InfoPane-tagName"> #'+TagsArry[i]+'</div></a> <a class="InfoPane-removeTag"><i class="glyphicon glyphicon-remove"></i></a></div>');
					});
				}
			});

			// Retrive Image meta Data		
	
			var imgParam = {imgname : SelectedImgName}

			$.get('/imginfo', imgParam, function(data){
				var makeModal,digitalZoomRatio,imageHeight,imageWidth,focalLenght,dateCreated;
				if(data.image.Make != undefined){
					makeModal = '<div class="row"><div class="col-sm-6">Model</div><div class="col-sm-6">'+ data.image.Make +'</div></div>';
					$("#imgInformation").append(makeModal);
				}
				if(data.exif.DigitalZoomRatio != undefined){
					digitalZoomRatio = '<div class="row"><div class="col-sm-6">Digital Zoom Ratio</div><div class="col-sm-6">'+ parseFloat(data.exif.DigitalZoomRatio).toFixed(2)+'</div></div>';
					$("#imgInformation").append(digitalZoomRatio);
				}
				if(data.exif.FocalLength != undefined){
					focalLenght = '<div class="row"><div class="col-sm-6">Focal Length</div><div class="col-sm-6">'+ data.exif.FocalLength+'</div></div>';
					$("#imgInformation").append(focalLenght);
				}
				if(data.exif.ExifImageHeight != undefined){
					imageHeight = '<div class="row"><div class="col-sm-6">Height</div><div class="col-sm-6">'+data.exif.ExifImageHeight+'</div></div>';
					$("#imgInformation").append(imageHeight);
				}
				if(data.exif.ExifImageWidth != undefined){
					imageWidth = '<div class="row"><div class="col-sm-6">Width</div><div class="col-sm-6">'+ data.exif.ExifImageWidth+'</div></div>';
					$("#imgInformation").append(imageWidth);
				}
				if(data.exif.CreateDate != undefined){
					dateCreated = '<div class="row"><div class="col-sm-6">Date Taken</div><div class="col-sm-6">'+ data.exif.CreateDate+'</div></div>';
					$("#imgInformation").append(dateCreated);
				}
			});
		}
	}
});


$(".tagssection").on('click','.InfoPane-removeTag', function(){
	
	var deleteTag  = $(this).prev('a').attr('tag-name') ;
	var parameters ={ id: SelectedImage, deleteTag : deleteTag};	
	var currentObject = $(this)	;
	$.get('/removeTag', parameters, function(data)
		{
			  $(currentObject).parents('.InfoPane-tag').remove();
		}).done(function()
		{			
			  $(currentObject).parents('.InfoPane-tag').remove();
		});

});

$('.image-container').on('click',function(e){
	$('.zipArchive').hide();
	$('.img-selector').removeClass('active');
	$('.img-action').removeClass('selected');
	imgIdArray = [];
})
});
