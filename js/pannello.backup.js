var utente = leggiCookie('infoUtente');
if(utente == null){
    alert('Bisogna essere loggati.');
    window.location.href = "./login.html";
}
document.getElementById('labelInfoUtente').innerHTML = utente['matricola'] + " " + utente['nome'] + " " + utente['cognome'];

beacons = caricaBeacons();

var edifici = new Array();
edifici[0] = {"Nome":"F2","Piani":"-1,0,1","CentroLat":40.774491,"CentroLng":14.789754};
edifici[1] = {"Nome":"F3","Piani":"-1,0,1,2","CentroLat":40.775037,"CentroLng":14.789183};

function popoloSelectEdificio(){
    var selectEdificio = document.getElementById('selectEdificioMappaGrande');
    selectEdificio.innerHTML = "";
    for(var indice = 0; indice < edifici.length; indice++){
        selectEdificio.innerHTML += "<option>" + edifici[indice]['Nome'] + "</option>";
    }
    selectEdificio.onchange();
}

//document.getElementById('selectPianoMappaGrande').addEventListener('onchange',alert('boh2'));
function popoloSelectPiano(){
    console.log('Chiamo popoloSelectPiano');
    var index = document.getElementById('selectEdificioMappaGrande').selectedIndex;
    var piani = edifici[index]['Piani'].split(',');
    var selectPiano = document.getElementById('selectPianoMappaGrande');
    selectPiano.innerHTML = "";
    for(var indice = 0; indice < piani.length; indice++){
        selectPiano.innerHTML+="<option>" + piani[indice] + "</option>";
    }
    //selectPiano.onchange;
    //alert('boh');
    //caricaMappa(); // TODO rimuovere se si lavora online
    pulisciCampiBeaconInfo();
}

function pulisciCampiBeaconInfo(){
    document.getElementById('macBeaconSelezionato').value = "";
    document.getElementById('nomeBeaconSelezionato').value = "";
    document.getElementById('descrizioneBeaconSelezionato').value = "";
    document.getElementById('latBeaconSelezionato').value = "";
    document.getElementById('lngBeaconSelezionato').value = "";
    document.getElementById('edificioBeaconSelezionato').value = "";
    document.getElementById('pianoBeaconSelezionato').value = "";
}

popoloSelectEdificio();
localCheckAllPermission();
nascondiTutti();
//caricaPlanimetrie();

//var planimetrie = caricaPlanimetrie();

function caricaMappa(){
    pulisciCampiBeaconInfo();
    console.log('Carico la mappa');
    // TODO Caricare in base all'edificio e piano selezionato
    let edificioSelezionato = document.getElementById('selectEdificioMappaGrande').value;
    let objectEdificioSelezionato = null;
    for(let indice = 0; indice < edifici.length; indice++){
        if(edificioSelezionato == edifici[indice]['Nome']){
            objectEdificioSelezionato = edifici[indice];
            break;
        }
    }
    // Centro edificio selezionato
    var uluru = {lat: parseFloat(objectEdificioSelezionato.CentroLat),lng: parseFloat(objectEdificioSelezionato.CentroLng)};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 19,
        center: uluru
    });
    // Carico i markers dei beacons che si devono vedere in base all'edificio e il piano selezionato.
    // Per ogni marker scelgo il colore in base all'associazione con l'utente loggato
    var pinGreen = "32c900";
    var pinWhite = "ffffff";
    var color = "";
    let b;
    let pianoSelezionato = document.getElementById('selectPianoMappaGrande').value;
    for(var indice = 0; indice < beacons.length; indice++){
        b = beacons[indice];
        if(b.Piano != pianoSelezionato || b.Edificio != edificioSelezionato){
            console.log('Scarto ' + b.Nome + " " + b.Edificio + "diverso " + edificioSelezionato  + "o il piano " + b.Piano + " diverso " + pianoSelezionato);
            continue;
        }
        console.log('Carico ' + b.Nome + " " + b.Edificio + " " + b.Piano);
        if(isMine(b['MAC'])){
            color = pinGreen;
            console.log('Mio quindi verde');
        }else{
            color = pinWhite;
            console.log('Non mio quindi bianco');
        }
        let marker = new google.maps.Marker({
            position: {lat:parseFloat(b.Lat), lng:parseFloat(b.Lng)},
            map: map,
            title:b.Nome + "\n" + b.Descrizione,
            icon:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color
        });
        marker.addListener('click',function(){showBeaconInfo(this);});
    }
}

function statoButtons(stato){
    if(stato){
        document.getElementById('btVisualizzaPaginaBeaconSelezionato').removeAttribute('disabled');        
        document.getElementById('btSalvaBeaconSelezionato').removeAttribute('disabled');
        document.getElementById('nomeBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('descrizioneBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('latBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('lngBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('pianoBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('edificioBeaconSelezionato').removeAttribute('readonly');
    }else{
        document.getElementById('btSalvaBeaconSelezionato').setAttribute('disabled',true);
        document.getElementById('btVisualizzaPaginaBeaconSelezionato').setAttribute('disabled',true);
        document.getElementById('nomeBeaconSelezionato').setAttribute('readonly',true);
        document.getElementById('descrizioneBeaconSelezionato').setAttribute('readonly',true);
        document.getElementById('latBeaconSelezionato').setAttribute('readonly',true);
        document.getElementById('lngBeaconSelezionato').setAttribute('readonly',true);
        document.getElementById('pianoBeaconSelezionato').setAttribute('readonly',true);
        document.getElementById('edificioBeaconSelezionato').setAttribute('readonly',true);
    }
}

function salvaBeaconSelezionato(){
    let macBeaconSelezionato = document.getElementById('macBeaconSelezionato');    
    let nomeBeaconSelezionato = document.getElementById('nomeBeaconSelezionato');
    let descrizioneBeaconSelezionato = document.getElementById('descrizioneBeaconSelezionato');
    let latBeaconSelezionato = document.getElementById('latBeaconSelezionato');
    let lngBeaconSelezionato = document.getElementById('lngBeaconSelezionato');
    let pianoBeaconSelezionato = document.getElementById('pianoBeaconSelezionato');
    let edificioBeaconSelezionato = document.getElementById('edificioBeaconSelezionato');

    if(!(nomeBeaconSelezionato.validity.valid ||
        descrizioneBeaconSelezionato.validity.valid ||
        latBeaconSelezionato.validity.valid ||
        lngBeaconSelezionato.validity.valid ||
        pianoBeaconSelezionato.validity.valid ||
        edificioBeaconSelezionato.validity.valid)){
        alert('Bisogna compilare tutti i campi.')
    }else{
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                risposta = JSON.parse(this.responseText);
                if(risposta['stato'] == "Errore"){
                    alert(risposta['stato'] + ": " + risposta['messaggio']);
                    return false;
                }
                if(risposta['stato'] == "Ok"){
                    alert('Modifica avvenuta con successo.');
                    document.location.reload();
                    return true;
                }

            }
        };
        xhttp.open("POST", "./php/salvaDatiBeacon.php", false);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("MAC=" + macBeaconSelezionato.value + "&Nome=" + nomeBeaconSelezionato.value + "&Descrizione=" + descrizioneBeaconSelezionato.value + "&Lat=" + latBeaconSelezionato.value + "&Lng=" + lngBeaconSelezionato.value + "&Edificio=" + edificioBeaconSelezionato.value + "&Piano=" + pianoBeaconSelezionato.value);
    }
}

function visualizzaPaginaBeaconSelezionato(){

}

function caricaBeacons(){
    // Carico i beacons dal db
    var elencoBeacons;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            elencoBeacons = JSON.parse(this.responseText);
            if(elencoBeacons['stato'] == "Errore"){
                alert(elencoBeacons['stato'] + ": " + elencoBeacons['messaggio']);
                return false;
            }
            /*var listaBeacons = document.getElementById('listaBeacons');
            for(var indice = 0; indice < elencoBeacons['beacons'].length; indice++){
                listaBeacons.innerHTML += "<li onclick=\"showBeaconInfo(this)\" name=\"" + elencoBeacons['beacons'][indice]['Nome'] + "\">" + elencoBeacons['beacons'][indice]['Posizione'] + " - " + elencoBeacons['beacons'][indice]['Nome'] + "</li>"
            }*/
        }
    };
    xhttp.open("POST", "./php/getBeacons.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();

    return elencoBeacons['beacons'];
}

function isMine(mac){
    for(var indice = 0; indice < utente['beacons'].length; indice++){
        if(mac == utente['beacons'][indice]['MAC']){
            return true;
        }
    }
    return false;
}

function showBeaconInfo(marker){
    let beaconSelezionato = null;
    for(let indice = 0; indice < beacons.length; indice++){
        if(marker.title == (beacons[indice]['Nome'] + "\n" + beacons[indice]['Descrizione'])){
            beaconSelezionato = beacons[indice];
            break;
        }
    }
    document.getElementById('macBeaconSelezionato').value = beaconSelezionato.MAC;
    document.getElementById('nomeBeaconSelezionato').value = beaconSelezionato.Nome;
    document.getElementById('descrizioneBeaconSelezionato').value = beaconSelezionato.Descrizione;
    document.getElementById('latBeaconSelezionato').value = beaconSelezionato.Lat;
    document.getElementById('lngBeaconSelezionato').value = beaconSelezionato.Lng;
    document.getElementById('edificioBeaconSelezionato').value = beaconSelezionato.Edificio;
    document.getElementById('pianoBeaconSelezionato').value = beaconSelezionato.Piano;
    statoButtons(isMine(beaconSelezionato.MAC));

    //document.getElementById('posizioneBeaconSelezionato').value = risposta['beacon']['Posizione'];
    /*xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato'] + ": " + risposta['messaggio']);
                return false;
            }
            document.getElementById('macBeaconSelezionato').value = risposta['beacon']['MAC'];
            document.getElementById('nomeBeaconSelezionato').value = risposta['beacon']['Nome'];
            document.getElementById('descrizioneBeaconSelezionato').value = risposta['beacon']['Descrizione'];
            document.getElementById('posizioneBeaconSelezionato').value = risposta['beacon']['Posizione'];

            if(isMine(risposta['beacon']['MAC'])){
                document.getElementById('btModificaBeaconSelezionato').removeAttribute('disabled');
                document.getElementById('nomeBeaconSelezionato').removeAttribute('readonly');
                document.getElementById('descrizioneBeaconSelezionato').removeAttribute('readonly');
                document.getElementById('posizioneBeaconSelezionato').removeAttribute('readonly');
            }else{
                document.getElementById('btModificaBeaconSelezionato').setAttribute('disabled', true);
                document.getElementById('nomeBeaconSelezionato').setAttribute('readonly',true);
                document.getElementById('descrizioneBeaconSelezionato').setAttribute('readonly',true);
                document.getElementById('posizioneBeaconSelezionato').setAttribute('readonly',true);
            }

        }
    };
    xhttp.open("POST", "./php/getBeaconInfo.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("MAC=" + beacon.name);*/
}

function modificaBeaconSelezionato(){
    var mMAC = document.getElementById('macBeaconSelezionato').value;
    var mNome = document.getElementById('nomeBeaconSelezionato').value;
    var mDescrizione = document.getElementById('descrizioneBeaconSelezionato').value;
    var mPosizione = document.getElementById('posizioneBeaconSelezionato').value;

    for(var indice = 0; indice < utente['beacons'].length; indice++){
        if(utente['beacons'][indice]['MAC'] == mMAC){
            if(mNome != utente['beacons'][indice]['Nome'] || mDescrizione != utente['beacons'][indice]['Descrizione'] || mPosizione != utente['beacons'][indice]['Posizione']){
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        console.log(this.responseText);
                        risposta = JSON.parse(this.responseText);
                        if(risposta['stato'] == "Errore"){
                            alert(risposta['stato'] + ": " + risposta['messaggio']);
                            return false;
                        }
                        if(risposta['stato'] == "Ok"){
                            alert('Modifica avvenuta con successo.');
                            return true;
                        }

                    }
                };
                xhttp.open("POST", "./php/salvaDatiBeacon.php", false);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("MAC=" + mMAC + "&Nome=" + mNome + "&Descrizione=" + mDescrizione + "&Posizione=" + mPosizione);
            }
        }
    }
    
}

document.getElementById('selectPianoMappaGrande').onchange = function(){
    aggiornaMappa();
}
document.getElementById('selectPianoMappaGrande').onchange();

function aggiornaMappa(){
    /*var edificio = document.getElementById('selectEdificioMappaGrande').value;
    var piano = document.getElementById('selectPianoMappaGrande').value;
    document.getElementById('immagineMappaGrande').src="./planimetrie/" + edificio + "+" + piano + ".png";
    document.getElementById('immagineMappaGrande').setAttribute('usemap','#' + edificio + '+' + piano);*/
}

function nascondiMappaIniziale(){
    document.getElementById('mappaIniziale').style="display:none";
}

function checkPermission(permission){
    // Controllo se dispone dei permessi necessari
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = this.responseText;
            //console.log(risposta);
            if(risposta == 0 || risposta == 1){
                return risposta == 1;
            }else{
                alert(risposta);
            }
        }
    };
    xhttp.open("POST", "./php/checkPermission.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("matricola="+utente['matricola']+"&permesso="+permission); 
}

function localCheckAllPermission(){
    // I contatori servono per vedere quanti permessi l'utente dispone di una categoria
    var nPermessiBeacons = 4;
    var nPermessiPermessi = 3;
    var nPermessiUtente = 3;

    var tempPermesso = "";
    var sizeOfPermissions = utente['permessi'].length;
    for(i = 0; i < sizeOfPermissions; i++){
        tempPermesso = utente['permessi'][i]['Nome'];
        //console.log("Controllo il permesso: " + tempPermesso);
        document.getElementsByName(tempPermesso)[0].style = "display:inline";
        if(tempPermesso.indexOf('beacon') > 0){
            nPermessiBeacons--;
        }else if(tempPermesso.indexOf('utente') > 0){
            nPermessiUtente--;
        }else if(tempPermesso.indexOf('permesso') > 0){
            nPermessiPermessi--;
        }
    }

    // Nascondo tutto il menu se l'utente non dispone nessun permesso di quella categoria
    if(nPermessiBeacons == 4){
        document.getElementById('dropdownBeacon').style = "display:none";
    }
    if(nPermessiPermessi == 3){
        document.getElementById('dropdownPermessi').style = "display:none";
    }
    if(nPermessiUtente == 3){
        document.getElementById('dropdownUtente').style = "display:none";
    }
}

function nascondiTutti(){
    var divFunzioni = document.getElementsByClassName('funzione');
    var dim = divFunzioni.length;
    for(indice = 0; indice < dim; indice++){
        divFunzioni[indice].classList.add("nascondi");
    }
}

function mostra(funzione){
    document.getElementById(funzione).classList.remove("nascondi");
}

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

// Funzioni legate ai beacon

function aggiungiBeacon(){
    var risp = checkPermission('Aggiungi beacon');
    //console.log(risp);
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();
    mostra('aggiungiBeacon');
    //alert('Disponi di questo permesso.');
}

function confermaAggiungiBeacon(){
    var mac, nome, descrizione, posizione;
    mac = document.getElementById('macNuovoBeacon');
    if(!mac.checkValidity()){
        return false;
    }
    nome = document.getElementById('nomeNuovoBeacon');
    if(!mac.checkValidity()){
        return false;
    }
    descrizione = document.getElementById('descrizioneNuovoBeacon');
    if(!descrizione.checkValidity()){
        return false;
    }
    posizione = document.getElementById('posizioneNuovoBeacon');
    if(!posizione.checkValidity()){
        return false;
    }

    // Tutti i campi sono stati validati da JS

    // Chiamata ajax al file php
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert("Inserimento avvenuto con successo.");
        }
    };
    xhttp.open("POST", "./php/aggiungiBeacon.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("MAC=" + mac.value + "&Nome=" + nome.value + "&Descrizione=" + descrizione.value + "&Posizione=" + posizione.value); 
}

function rimuoviBeacon(){
    var risp = checkPermission('Rimuovi beacon');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();
    // TODO popolare la select con i beacon presenti nel db
    // Faccio una query al db facendomi restituire tutti i beacons
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            console.log(risposta);
            // Se non ci sono beacons non ha senso il resto del codice
            if(risposta['beacons'].length < 1){
                alert('Non ci sono beacons');
                console.log('Non ci sono beacons nel DB');
                return;
            }
            // C'è almeno un beacon
            var selectBeacons = document.getElementById('selectBeaconDaEliminare');
            var str = "";
            for(var indice = 0; indice < risposta['beacons'].length;indice++){
                str+="<option>" + risposta['beacons'][indice]['MAC'] + "</option>";
            }
            selectBeacons.innerHTML = str;

            selectBeacons.onchange = function(){
                // Mostrare le informazioni di ogni beacon
                var divInfo = document.getElementById('infoBeaconDaEliminare');
                divInfo.innerHTML = "<br>";
                var elemento = risposta['beacons'][selectBeacons.selectedIndex];
                //divInfo.innerHTML += "<label>" + "MAC: </label><input class=\"form-control\" type=\"text\" readonly value='"+ elemento['MAC'] + "'></input>";
                divInfo.innerHTML += "<label>" + "Nome: </label><input class=\"form-control\" type=\"text\" readonly value='"+ elemento['Nome'] + "'></input>";
                divInfo.innerHTML += "<label>" + "Descrizione: </label><input class=\"form-control\" type=\"text\" readonly value='"+ elemento['Descrizione'] + "'></input>";
                divInfo.innerHTML += "<label>" + "Posizione: </label><input class=\"form-control\" type=\"text\" readonly value='"+ elemento['Posizione'] + "'></input>";                
            }
            selectBeacons.onchange();
        }
    };
    xhttp.open("POST", "./php/getBeacons.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
    mostra('rimuoviBeacon');
}

function confermaRimuoviBeacon(){
    //console.log('Dovrei rimuovere un beacon.');
    var mac;
    mac = document.getElementById('selectBeaconDaEliminare');
    /*if(!mac.checkValidity()){
        //console.log("Campo non valido");
        return false;
    }*/
    // Tutti i campi sono stati validati da JS

    // Chiamata ajax al file php
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert("Eliminazione avvenuta con successo.");
        }
    };
    xhttp.open("POST", "./php/rimuoviBeacon.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    console.log(mac.value);
    xhttp.send("MAC=" + mac.value); 
}

function associaBeacon(){
    var risp = checkPermission();
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();

    // Carico le info degli utenti nella select
    // Chiamata ajax al file php
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            console.log(risposta);
            var selectUtentiDaAssociare = document.getElementById('selectUtenteAssociare');
            if(risposta['utenti'].length < 1){
                alert('Non ci sono utenti nel DataBase.');
                return;
            }
            // Carico le informazioni nella select dell'utente
            for(var indice = 0; indice < risposta['utenti'].length;indice++){
                selectUtentiDaAssociare.innerHTML += "<option>" + risposta['utenti'][indice]['Matricola'] + "</option>";
            }

            // Associare il listener alla select
            selectUtentiDaAssociare.onchange = function(){
                var spanInfoUtenteDaAssociare = document.getElementById('infoUtenteDaAssociare');
                spanInfoUtenteDaAssociare.innerHTML="";
                spanInfoUtenteDaAssociare.innerHTML+="<label>Nome</label><input class=\"form-control\" type=\"text\" readonly value='"+ risposta['utenti'][selectUtentiDaAssociare.selectedIndex]['Nome'] + "'></input>";
                spanInfoUtenteDaAssociare.innerHTML+="<label>Cognome</label><input class=\"form-control\" type=\"text\" readonly value='"+ risposta['utenti'][selectUtentiDaAssociare.selectedIndex]['Cognome'] + "'></input>";
            }
            selectUtentiDaAssociare.onchange();
        }
    };
    xhttp.open("POST", "./php/getUtenti.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();

    // Chiamata ajax al file php
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            console.log(risposta);

            var selectBeaconDaAssociare = document.getElementById('selectBeaconAssociare');
            if(risposta['beacons'].length < 1){
                alert('Non ci sono beacons nel DataBase.');
                return;
            }
            // Carico le informazioni nella select dei beacons
            for(var indice = 0; indice < risposta['beacons'].length;indice++){
                selectBeaconDaAssociare.innerHTML += "<option>" + risposta['beacons'][indice]['MAC'] + "</option>";
            }

            // Associare il listener alla select
            selectBeaconDaAssociare.onchange = function(){
                var spanInfoBeaconDaAssociare = document.getElementById('infoBeaconDaAssociare');
                spanInfoBeaconDaAssociare.innerHTML="";
                spanInfoBeaconDaAssociare.innerHTML+="<label>Nome</label><input class=\"form-control\" type=\"text\" readonly value='"+ risposta['beacons'][selectBeaconDaAssociare.selectedIndex]['Nome'] + "'></input>";
                spanInfoBeaconDaAssociare.innerHTML+="<label>Descrizione</label><input class=\"form-control\" type=\"text\" readonly value='"+ risposta['beacons'][selectBeaconDaAssociare.selectedIndex]['Descrizione'] + "'></input>";
                spanInfoBeaconDaAssociare.innerHTML+="<label>Posizione</label><input class=\"form-control\" type=\"text\" readonly value='"+ risposta['beacons'][selectBeaconDaAssociare.selectedIndex]['Posizione'] + "'></input>";
            }
            selectBeaconDaAssociare.onchange();
        }
    };
    xhttp.open("POST", "./php/getBeacons.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();

    // Fine carimento
    mostra('associaBeacon');
}

function confermaAssociaBeacon(){

    // Chiamata ajax al file php
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert('Associazione avvenuta con successo.');
                return;
            }
        }
    };
    xhttp.open("POST", "./php/associaUtenteBeacon.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Matricola="+document.getElementById('selectUtenteAssociare').value + "&MAC=" + document.getElementById('selectBeaconAssociare').value);
}

function dissociaBeacon(){
    alert('Da sviluppare');
}

function confermaDissociaBeacon(){
    alert('Da sviluppare');
}

function gestisciBeacons(){
    
    var risp = checkPermission();
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();
    alert('Da sviluppare');
    mostra('gestisciBeacon');
}

// Funzioni legate ai permessi

function aggiungiPermesso(){
    var risp = checkPermission('Aggiungi permesso');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();
    mostra('aggiungiPermesso');
}

function confermaAggiungiPermesso(){
    // Aggiungo il permesso al DataBase tramite php
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert('Permesso creato con successo.');
                return true;
            }
        }
    };
    xhttp.open("POST", "./php/aggiungiPermesso.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Nome="+document.getElementById('nomeAggiungiPermesso').value + "&Descrizione=" + document.getElementById('descrizioneAggiungiPermesso').value);
}

function rimuoviPermesso(){
    var risp = checkPermission('Rimuovi permesso');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();
    // Chiamata AJAX per popolare la select
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            var selectPermessoDaEliminare = document.getElementById('selectPermessoDaEliminare');
            selectPermessoDaEliminare.innerHTML = "";
            for(var indice = 0; indice < risposta['permessi'].length; indice++){
                selectPermessoDaEliminare.innerHTML += "<option>" + risposta['permessi'][indice]['ID'] + "</option>";
            }

            selectPermessoDaEliminare.onchange = function (){
                document.getElementById('nomePermessoDaEliminare').value = risposta['permessi'][selectPermessoDaEliminare.selectedIndex]['Nome'];
                document.getElementById('descrizionePermessoDaEliminare').value = risposta['permessi'][selectPermessoDaEliminare.selectedIndex]['Descrizione'];
            }
            selectPermessoDaEliminare.onchange();
        }
    };
    xhttp.open("POST", "./php/getPermessi.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
    mostra('rimuoviPermesso');
}

function confermaEliminaPermesso(){
    // Chiamata AJAX per eliminare il permesso
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert("Eliminazione del permesso effettuata con successo.");
                return true;
            }
        }
    };
    xhttp.open("POST", "./php/eliminaPermesso.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("ID=" + document.getElementById('selectPermessoDaEliminare').value);
}

function associaPermesso(){
    var risp = checkPermission('Associa permesso');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();

    // Popolo la select degli utenti
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            console.log(risposta);

            var selectUtenteDaAssociare = document.getElementById('selectUtenteAssociarePermesso');
            selectUtenteDaAssociare.innerHTML = "";
            
            // Carico le informazioni nella select dei beacons
            for(var indice = 0; indice < risposta['utenti'].length;indice++){
                selectUtenteDaAssociare.innerHTML += "<option>" + risposta['utenti'][indice]['Matricola'] + "</option>";
            }

            // Associare il listener alla select
            selectUtenteDaAssociare.onchange = function(){
                document.getElementById('nomeUtenteAssociarePermesso').value = risposta['utenti'][selectUtenteDaAssociare.selectedIndex]['Nome'];
                document.getElementById('cognomeUtenteAssociarePermesso').value = risposta['utenti'][selectUtenteDaAssociare.selectedIndex]['Cognome'];
            }
            selectUtenteDaAssociare.onchange();
        }
    };
    xhttp.open("POST", "./php/getUtenti.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();

    // Popolo la select dei permessi
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            console.log(risposta);

            var selectPermessoDaAssociare = document.getElementById('selectPermessoAssociarePermesso');
            selectPermessoDaAssociare.innerHTML = "";
            
            // Carico le informazioni nella select dei beacons
            for(var indice = 0; indice < risposta['permessi'].length;indice++){
                selectPermessoDaAssociare.innerHTML += "<option>" + risposta['permessi'][indice]['ID'] + "</option>";
            }

            // Associare il listener alla select
            selectPermessoDaAssociare.onchange = function(){
                document.getElementById('nomePermessoAssociarePermesso').value = risposta['permessi'][selectPermessoDaAssociare.selectedIndex]['Nome'];
                document.getElementById('descrizionePermessoAssociarePermesso').value = risposta['permessi'][selectPermessoDaAssociare.selectedIndex]['Descrizione'];
            }
            selectPermessoDaAssociare.onchange();
        }
    };
    xhttp.open("POST", "./php/getPermessi.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();

    mostra('associaPermesso');
}

function confermaAssociaPermesso(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert('Permesso associato con successo.');
        }
    };
    xhttp.open("POST", "./php/associaUtentePermesso.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Matricola=" + document.getElementById('selectUtenteAssociarePermesso').value + "&ID=" + document.getElementById('selectPermessoAssociarePermesso').value);
}

function dissociaPermesso(){
    var risp = checkPermission('Dissocia permesso');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();

    /* Logica:
        Quando seleziono un utente, aggiorno la select dei permessi
        Il tasto conferma prende la matricola e l'id del permesso
    */
    // Carico gli utenti
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            console.log(risposta);

            var selectUtenteDaDissociare = document.getElementById('selectUtenteDissociarePermesso');
            selectUtenteDaDissociare.innerHTML = "";
            
            // Carico le informazioni nella select dei beacons
            for(var indice = 0; indice < risposta['utenti'].length;indice++){
                selectUtenteDaDissociare.innerHTML += "<option>" + risposta['utenti'][indice]['Matricola'] + "</option>";
            }

            // Associare il listener alla select
            selectUtenteDaDissociare.onchange = function(){
                document.getElementById('nomeUtenteDissociarePermesso').value = risposta['utenti'][selectUtenteDaDissociare.selectedIndex]['Nome'];
                document.getElementById('cognomeUtenteDissociarePermesso').value = risposta['utenti'][selectUtenteDaDissociare.selectedIndex]['Cognome'];

                // Aggiorno anche i valori nella select dei permessi
                var xhttp;
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        // Ricevo il JSON e lo converto in array
                        //console.log(this.responseText);
                        var risposta = JSON.parse(this.responseText);
                        //console.log(risposta);
                        // Controllo lo stato
                        if(risposta['stato'] == "Errore"){
                            alert(risposta['stato']+": " + risposta['messaggio']);
                            return false;
                        }
                        console.log(risposta);

                        var selectPermessoDaDissociare = document.getElementById('selectPermessoDissociarePermesso');
                        selectPermessoDaDissociare.innerHTML = "";
                        
                        // Carico le informazioni nella select dei beacons
                        if(risposta['permessi'] == null || risposta['permessi'].length < 1){
                            document.getElementById('nomePermessoDissociarePermesso').value = 'Nessun permesso trovato';
                            document.getElementById('descrizionePermessoDissociarePermesso').value = 'Nessun permesso trovato';                            
                            return false;
                        }
                        for(var indice = 0; indice < risposta['permessi'].length;indice++){
                            selectPermessoDaDissociare.innerHTML += "<option>" + risposta['permessi'][indice]['ID'] + "</option>";
                        }

                        // Associare il listener alla select
                        selectPermessoDaDissociare.onchange = function(){
                            document.getElementById('nomePermessoDissociarePermesso').value = risposta['permessi'][selectPermessoDaDissociare.selectedIndex]['Nome'];
                            document.getElementById('descrizionePermessoDissociarePermesso').value = risposta['permessi'][selectPermessoDaDissociare.selectedIndex]['Descrizione'];
                        }
                        selectPermessoDaDissociare.onchange();
                    }
                };
                xhttp.open("POST", "./php/getPermessiAssociati.php", false);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("Matricola=" + selectUtenteDaDissociare.value);
            }
            selectUtenteDaDissociare.onchange();
        }
    };
    xhttp.open("POST", "./php/getUtenti.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();

    mostra('dissociaPermesso');
}

function confermaDissociaPermesso(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            //console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert('Permesso dissociato con successo.');
        }
    };
    xhttp.open("POST", "./php/dissociaUtentePermesso.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Matricola=" + document.getElementById('selectUtenteDissociarePermesso').value + "&ID=" + document.getElementById('selectPermessoDissociarePermesso').value);
}

function gestisciPermesso(){
    var risp = checkPermission('Gestisci permesso');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();

    // Carico i permessi dal database nella select
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            var selectPermessoGestisci = document.getElementById('selectPermessoGestisci');
            selectPermessoGestisci.innerHTML = "";
            for(var indice = 0; indice < risposta['permessi'].length; indice++){
                selectPermessoGestisci.innerHTML += "<option>" + risposta['permessi'][indice]['ID'] + "</option>";
            }

            selectPermessoGestisci.onchange = function (){
                document.getElementById('nomePermessoGestisci').value = risposta['permessi'][selectPermessoGestisci.selectedIndex]['Nome'];
                document.getElementById('descrizionePermessoGestisci').value = risposta['permessi'][selectPermessoGestisci.selectedIndex]['Descrizione'];
            }
            selectPermessoGestisci.onchange();
        }
    };
    xhttp.open("POST", "./php/getPermessi.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();

    mostra('gestisciPermesso');
}

function confermaGestisciPermesso(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert('Informazioni del permesso salvate con successo');
                return true;
            }
        }
    };
    xhttp.open("POST", "./php/gestisciPermesso.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("ID="+ document.getElementById('selectPermessoGestisci').value + "&Nome=" + document.getElementById('nomePermessoGestisci').value + "&Descrizione=" + document.getElementById('descrizionePermessoGestisci').value);
}

// Funzioni legate all'utente

function aggiungiUtente(){
    var risp = checkPermission('Aggiungi utente');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();
    mostra('aggiungiUtente');
}

function confermaAggiungiUtente(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert('Utente aggiunto con successo.');
                return true;
            }
        }
    };
    xhttp.open("POST", "./php/aggiungiUtente.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Matricola="+ document.getElementById('matricolaNuovoUtente').value + "&Nome=" + document.getElementById('nomeNuovoUtente').value + "&Cognome=" + document.getElementById('cognomeNuovoUtente').value + "&Password=" + document.getElementById('passwordNuovoUtente').value);
}

function rimuoviUtente(){
    var risp = checkPermission('Rimuovi utente');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();
    // TODO Da implementare
    // Carico gli utenti dal db nella select
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            console.log(risposta);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }

            // Rimuovo l'utente loggato in modo da non autoeliminarsi
            // Se c'è solo un utente, allora è quello loggato
            if(risposta['utenti'].length == 1){
                alert('Non ci sono altri utenti.');
                return false;
            }
            // C'è più di un utente
            for(var indice = 0; indice < risposta['utenti'].length; indice++){
                if(risposta['utenti'][indice]['Matricola'] == utente['matricola']){
                    console.log("Sono uguali? " + (risposta['utenti'][indice]['Matricola'] == utente['matricola']));
                    risposta['utenti'].splice(indice,1);
                    break;
                }
            }

            var matricolaUtenteEliminare = document.getElementById('matricolaUtenteEliminare');
            matricolaUtenteEliminare.innerHTML += "";
            for(var indice = 0; indice < risposta['utenti'].length; indice++){
                matricolaUtenteEliminare.innerHTML += "<option>" + risposta['utenti'][indice]['Matricola'] + "</option>";
            }
            matricolaUtenteEliminare.onchange = function(){
                nomeUtenteEliminare.value = risposta['utenti'][matricolaUtenteEliminare.selectedIndex]['Nome'];
                cognomeUtenteEliminare.value = risposta['utenti'][matricolaUtenteEliminare.selectedIndex]['Cognome'];
            };
            matricolaUtenteEliminare.onchange();
        }
    };
    xhttp.open("POST", "./php/getUtenti.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
    mostra('rimuoviUtente');
}

function confermaRimuoviUtente(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert('Eliminazione avvenuta con successo');
            document.location.reload();
            return true;
        }
    };
    xhttp.open("POST", "./php/eliminaUtente.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Matricola=" + document.getElementById('matricolaUtenteEliminare').value);
}

function gestisciUtente(){
    var risp = checkPermission('Gestisci utente');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiMappaIniziale();
    nascondiTutti();
    // Carico le informazioni dell'utente nei vari campi
    document.getElementById('matricolaGestisciUtente').value = utente.matricola;    
    document.getElementById('nomeGestisciUtente').value = utente.nome;    
    document.getElementById('cognomeGestisciUtente').value = utente.cognome;    
    mostra('gestisciUtente');
}

function confermaGestisciUtente(){
    // Salvo i dati nel database
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Ricevo il JSON e lo converto in array
            //console.log(this.responseText);
            var risposta = JSON.parse(this.responseText);
            // Controllo lo stato
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert('Dati aggiornati con successo.\nBisogna effettuare l\'accesso');
            eliminaCookie('infoUtente');
            window.location.href = "./login.html";
            // Aggiorno i dati nel cookie
            // TODO non funziona l'aggiornamento del cookie
            /*utente['Nome'] = document.getElementById('nomeGestisciUtente').value;
            utente['Cognome'] = document.getElementById('cognomeGestisciUtente').value;
            eliminaCookie('infoUtente');
            document.cookie = creaCookie('infoUtente', utente);
            utente = leggiCookie('infoUtente');*/

        }
    };
    xhttp.open("POST", "./php/salvaDatiUtente.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Matricola=" + document.getElementById('matricolaGestisciUtente').value + "&Nome=" + document.getElementById('nomeGestisciUtente').value + "&Cognome=" + document.getElementById('cognomeGestisciUtente').value);
}