

var phoneStr;
var regularExpression;

function isPhoneValid(input){

    phoneStr = input;
    regularExpression = /^[0-9]{10}$/;


    if(regularExpression.test(input)){
        return true;
    }
    else{
        return false;
    }

}

var emailRegex;

function isEmailValid(input){

    emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if(emailRegex.test(input)){
        return true;
    }
    else{
        return false;
    }
}

var passwordRegex;

function isPasswordValid(input){

    //atleast 1 lowercase, 1 uppercase, 1 numeric, one special character !@#$%^&*,length eight characters or more 
    passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    
    if(passwordRegex.test(input)){
        return true;
    }
    else{
        return false;
    }
}


const validation = {
    isPhoneValid, isPasswordValid, isEmailValid
}

module.exports = validation;








