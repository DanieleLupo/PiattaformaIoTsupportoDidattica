function creaCookie(nome, valore){
    return [nome,'=',JSON.stringify(valore),'; domain=', window.location.host.toString(),'; path=/;'].join('');
}

function leggiCookie(nome){
    var result = document.cookie.match(new RegExp(nome + '=([^;]+)'));
    result && (result = JSON.parse(result[1]));
    return result;
}

function eliminaCookie(nome){
    document.cookie = [nome, '=; expires=Thu 01-Jan-1970 00:00:01 GMT; path=/; domain=.', window.location.host.toString()].join('');
}

function logout(nome){
    eliminaCookie(nome);
    window.location.href = "./login.html";
}

/*function caricaBarraUtente(){
    var ut = leggiCookie('infoUtente');
        if(ut == null){
            alert('Bisogna essere autenticati.');
            window.location.href = ".././login.html";
        }
        var infoBarra = document.getElementById('barraUtente');
        var tastoLogout = "<button class=\"buttonLogout btn btn-default\" onclick=\"logout('infoUtente')\"><img src=\"./icone/logout.png\" alt=\"Esci\"><br>Esci</button>";
        var info = "<label class=\"labelBarraUtente\">" + ut['matricola'] + "\t" + ut['nome'] + " " + ut['cognome'] + "</label>";
        infoBarra.innerHTML = tastoLogout + info;
}*/