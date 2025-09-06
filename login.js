//   the login form
const LoginUpForm = document.getElementById("loginForm");
 LoginUpForm.addEventListener("submit",function(event){
    event.preventDefault();

    const loginUserName = document.getElementById("input-username").value.trim();
    const loginPassword = document.getElementById("input-password").value.trim();
    const alertNote = document.getElementById("Error");

    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");
    
    if(loginUserName === savedUsername && loginPassword === savedPassword ){
        alertNote.textContent ="Login succesful!"; 
        alertNote.style.color = "green";
        alertNote.style.display = "block";

        setTimeout(() => {
        location.href = "loan.html";
        }, 2000);  
    return;
         
    } else {

        alertNote.textContent ="Invalid Username or Password,try again";
        alertNote.style.color = "red"; 
        alertNote.style.display = "block";
    }
 })