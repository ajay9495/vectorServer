
const validation = require('../Validation');

function validateSignupData(req,res,next){


    var isDataValid = true;
    var requestBody = req.body;
  
    if(requestBody.name.value == ""){

        isDataValid = false;
    }
  
    if(!validation.isEmailValid(requestBody.email.value)){
  
      isDataValid = false;
    }
  
    if(!validation.isPhoneValid(requestBody.phone.value)){
  
      isDataValid = false;
    }
  
    if(!validation.isPasswordValid(requestBody.password.value)){
      
      isDataValid = false;
    }

    if(requestBody.password.value !=  requestBody.confirmPassword.value){

      isDataValid = false;
    }
  
    if(!isDataValid){
  
      return res.json({status:"failed",message:"Invalid request"});
  
    }
  
    next();
  
}

function validateLoginData(req, res, next){

  var isDataValid = true;
  var requestBody = req.body;

  if(!validation.isEmailValid(requestBody.email.value)){

    isDataValid = false;
  }

  if(!validation.isPasswordValid(requestBody.password.value)){

    isDataValid = false;
  }

  if(!isDataValid){
    return res.json({status: "the data is not  valid"});
  }

  next();

}


const auth = {
    validateSignupData, validateLoginData
}
  
module.exports = auth;
















