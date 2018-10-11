// Modificare il messaggio di errore
document.addEventListener("DOMContentLoaded", function() {
    var elements = document.getElementsByClassName("form-control");
    for (var i = 0; i < elements.length; i++) {
        elements[i].oninvalid = function(e) {
            e.target.setCustomValidity("");
            if (!e.target.validity.valid) {
                e.target.setCustomValidity("Questo campo non puo' restare vuoto");
            }
        };
        elements[i].oninput = function(e) {
            e.target.setCustomValidity("");
        };
    }
});

function richiediCredenziali(){
    alert('Rivolgersi a Daniele Lupo per le credenziali');
}

function login(){
    var inUsername = document.getElementsByName('username')[0];
    var inPassword = document.getElementsByName('password')[0];
    if(!inUsername.validity.valid 
        || !inPassword.validity.valid){
            return false;
        }
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return;
            }
            var cookie = creaCookie('infoUtente',risposta);
            document.cookie = cookie;
            window.location.href = "./pannello.html";
            alert("");
        }
    };
    xhttp.open("POST", "./php/login.php", false);
    var username, password;
    username = document.getElementsByName('username')[0].value;
    password = document.getElementsByName('password')[0].value;
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username="+username+"&password="+password); 
}