module.exports = {
  cleanArray : function cleanArray(obj){
    var newArray = [];
    for(var i = 0; i<obj.length; i++){
    		var trimedObj = obj[i].trim()
        if (trimedObj){
          newArray.push(trimedObj);
      }
    }
    return newArray;
  },
  isLoggedIn: function isLoggedIn(req, res, next) {
      if (req.isAuthenticated())
          return next();

      res.redirect('/login');
  },
  setCookie: function setCookie(userEmail) {
      var d = new Date();
      d.setTime(d.getTime() + (24*60*60*1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = "userEmail="+userEmail+";"+expires;
  },
  getRandomName : function createName (objStr)
  {
    alert(objStr+"_"+Math.floor(Math.random() * (300 - 200 + 1) + min))
    return objStr+"_"+Math.floor(Math.random() * (300 - 200 + 1) + min);
  }
};




