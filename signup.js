// validating password
function validate(password){
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&$%_£"*\-?])[a-zA-Z\d@&$%_£"*\-?]{7,}$/;

return regex.test(password);
}
// the sign up form
const signUpForm = document.getElementById("signUpForm")
  signUpForm.addEventListener("submit", function(event){
    event.preventDefault();
    const UserName= document.getElementById("username").value;
    const password= document.getElementById("password").value;
    const errorBox = document.getElementById("errorMsg");

if(!validate(password)){
    errorBox.textContent ="Password invalid, must have 7 characters with uppercase, lowercase ,number and character"; 
    errorBox.style.display = "block";
 
    return;
     
}
  errorBox.textContent = "";
  errorBox.style.display = "none";

localStorage.setItem("username",UserName);
localStorage.setItem("password",password);

 location.href = "login.html";;


  })

