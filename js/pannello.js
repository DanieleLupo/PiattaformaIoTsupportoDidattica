var utente = leggiCookie('infoUtente');
if(utente == null){
    alert('Bisogna essere loggati.');
    window.location.href = "./login.html";
}
document.getElementById('labelInfoUtente').innerHTML = utente['matricola'] + " " + utente['nome'] + " " + utente['cognome'];

beacons = caricaBeacons();
permessi = caricaPermessi();
utenti = caricaUtenti();
funzionalitaSelezionata = 'home';
markers = new Array();

function caricaUtenti(){
    let uts;
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            console.log('utenti=' + risposta['utenti']);
            uts = risposta['utenti'];
        }
    };
    xhttp.open("POST", "./php/getUtenti.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
    return uts;
}

function caricaPermessi(){
    let p;
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }else{
                p = risposta['permessi'];
            }
            
        }
    };
    xhttp.open("POST", "./php/getPermessi.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
    return p;
}

var edifici = new Array();
edifici[0] = {"Nome":"F2","Piani":"-1,0,1","CentroLat":40.774491,"CentroLng":14.789754,"Imagebounds": new google.maps.LatLngBounds(
    new google.maps.LatLng(40.774160, 14.789230),
    new google.maps.LatLng(40.774780, 14.790140))};
    // TODO: Creare la planimetria
edifici[1] = {"Nome":"F3","Piani":"-1,0,1,2","CentroLat":40.775037,"CentroLng":14.789183,"Imagebounds":new google.maps.LatLngBounds(
    new google.maps.LatLng(40.774160, 14.789230),
    new google.maps.LatLng(40.774780, 14.790140))};

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
    caricaMappa();
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

function caricaMappa(){
    pulisciCampiBeaconInfo();
    markers = new Array();
    console.log('Carico la mappa');
    let edificioSelezionato = document.getElementById('selectEdificioMappaGrande').value;
    let objectEdificioSelezionato = null;
    let indiceEdificio = 0;
    for(let indice = 0; indice < edifici.length; indice++){
        if(edificioSelezionato == edifici[indice]['Nome']){
            objectEdificioSelezionato = edifici[indice];
            indiceEdificio = indice;
            break;
        }
    }
    // Centro edificio selezionato
    var uluru = {lat: parseFloat(objectEdificioSelezionato.CentroLat),lng: parseFloat(objectEdificioSelezionato.CentroLng)};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 19,
        center: uluru,
        disableDefaultUI:true
    });
    // Carico i markers dei beacons che si devono vedere in base all'edificio e il piano selezionato.
    // Per ogni marker scelgo il colore in base all'associazione con l'utente loggato
    var pinGreen = "32c900";
    var pinWhite = "ffffff";
    var color = "";
    let b;
    let pianoSelezionato = document.getElementById('selectPianoMappaGrande').value;
    for(let indice = 0, indiceMarkers = 0; indice < beacons.length; indice++){
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
            icon:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
            draggable: false
        });
        console.log('Nome edificio selezionato ' + objectEdificioSelezionato.Nome);

        // Carico overlay
        overlay = new google.maps.GroundOverlay(
            './planimetrie/' + objectEdificioSelezionato.Nome + '+' + pianoSelezionato + '.png',
            edifici[indiceEdificio]['Imagebounds']);
        overlay.setMap(map);


        marker.addListener('click',function(){
            //console.log('Marker position: ' + marker.getPosition());
            switch(funzionalitaSelezionata){
                case 'home':
                    showBeaconInfo(this);
                    break;
                case 'rimuoviBeacon':
                    selectBeaconRimuovi(this);
                    break;
                case 'associaBeacon':
                    selectBeaconAssocia(this);
                    break;
                case 'dissociaBeacon':
                    selectBeaconDissocia(this);
                    break;
                case 'gestisciBeacons':
                    selectBeaconGestisci(this);
                    break;
                }
            }
        );
        markers[indiceMarkers++] = {'Marker': marker, 'Beacon': b};
    }
}

function statoButtons(stato){
    if(stato){
        //TODO: Modificare il testo da Visualizza in Modifica
        document.getElementById('btVisualizzaPaginaBeaconSelezionato').removeAttribute('disabled');
        document.getElementById('btVisualizzaPaginaBeaconSelezionato').textContent = 'Modifica pagina'     
        document.getElementById('btSalvaBeaconSelezionato').removeAttribute('disabled');
        document.getElementById('nomeBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('descrizioneBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('latBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('lngBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('pianoBeaconSelezionato').removeAttribute('readonly');
        document.getElementById('edificioBeaconSelezionato').removeAttribute('readonly');
    }else{
        //TODO: Modificare il testo da Modifica a Visualizza
        document.getElementById('btSalvaBeaconSelezionato').setAttribute('disabled',true);
        //document.getElementById('btVisualizzaPaginaBeaconSelezionato').setAttribute('disabled',true);
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

//TODO: Da finire
function visualizzaPaginaBeaconSelezionato(){
    /*FIXME:
        Dovrei prima controllare se il beacon è associato all'utente
        - positivo: apro l'editor
        - negativo: apro la pagina in sola visualizzazione

        Dovrei dire in qualche modo il beacon selezionato (cookie??)
    */

    let beaconSelezionato;
    let macSelezionato = document.getElementById('macBeaconSelezionato').value;
    for(let indice = 0; indice < beacons.length; indice++){
        beaconSelezionato = beacons[indice];
        if(beaconSelezionato.MAC == macSelezionato){
            break;
        }else{
            beaconSelezionato = null;
        }
    }

    if(beaconSelezionato == null){
        alert('Errore nel caricamento del beacon. Rientrare e riprovare.');
        return;
    }  

    if(beaconSelezionato.Pagine.length < 1){
        alert('Il beacon non ha pagine associate.');
        return;
    }

    // Creo popup
    //TODO: Creare popup
    let popup = document.createElement('div');
    popup.style += "border:2px solid black;width:auto;height:auto;background:white;position:absolute;left:45%;top:45%;z-index:1;padding:1% 3% 1% 3%";
    let button;
    for(let indice = 0;indice < beaconSelezionato.Pagine.length; indice++){
        button = document.createElement('button');
        button.classList.add('btn');
        button.textContent = beaconSelezionato.Pagine[indice].substring(0,beaconSelezionato.Pagine[indice].length-5);
        let pagina = beaconSelezionato.Pagine[indice];
        button.onclick = function(){
            let path = beaconSelezionato.MAC;
            while(path.indexOf(':') > -1){
                path = path.replace(":","");
            }
            if(isMine(beaconSelezionato.MAC)){
                creaCookie('pagina',pagina);
                window.open('http://localhost/tesi/editorPaginaBeacon.html');
            }else{
                window.open('./pagine/' + path + "/" + pagina,'_blank','',false);
            }

        };
        popup.appendChild(button);
        popup.appendChild(document.createElement('br'));
    }
    document.body.appendChild(popup);
}

function caricaBeacons(){
    var elencoBeacons;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            elencoBeacons = JSON.parse(this.responseText);
            if(elencoBeacons['stato'] == "Errore"){
                alert(elencoBeacons['stato'] + ": " + elencoBeacons['messaggio']);
                return false;
            }
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

function getBeaconFromMarker(marker){
    let b = null;
    for(let indice = 0; indice < markers.length; indice++){
        if(markers[indice].Marker == marker){
            return markers[indice].Beacon;
        }
    }
    return null;
}

function getMarkerFromBeacon(beacon){
    let m = null;
    for(let indice = 0; indice < markers.length; indice++){
        if(markers[indice].Beacon.MAC == beacon.MAC){
            return markers[indice].Marker;
        }
    }
    return null;
}

function showBeaconInfo(marker){
    let beaconSelezionato = getBeaconFromMarker(marker);
    document.getElementById('macBeaconSelezionato').value = beaconSelezionato.MAC;
    document.getElementById('nomeBeaconSelezionato').value = beaconSelezionato.Nome;
    document.getElementById('descrizioneBeaconSelezionato').value = beaconSelezionato.Descrizione;
    document.getElementById('latBeaconSelezionato').value = beaconSelezionato.Lat;
    document.getElementById('lngBeaconSelezionato').value = beaconSelezionato.Lng;
    document.getElementById('edificioBeaconSelezionato').value = beaconSelezionato.Edificio;
    document.getElementById('pianoBeaconSelezionato').value = beaconSelezionato.Piano;
    statoButtons(isMine(beaconSelezionato.MAC));
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
    var nPermessiBeacons = 0;
    var nPermessiPermessi = 0;
    var nPermessiUtente = 0;

    var tempPermesso = "";
    var sizeOfPermissions = utente['permessi'].length;
    //console.log('sizeof permessi ' + sizeOfPermissions);
    for(i = 0; i < sizeOfPermissions; i++){
        tempPermesso = utente['permessi'][i]['Nome'];
        //console.log("Controllo il permesso: " + tempPermesso);
        document.getElementsByName(tempPermesso)[0].style = "display:inline";
        if(tempPermesso.indexOf('beacon') > 0){
            //console.log('Aggiunto permesso beacons.');
            nPermessiBeacons++;
        }else if(tempPermesso.indexOf('utente') > 0){
            //console.log('Aggiunto permesso utente.');            
            nPermessiUtente++;
        }else if(tempPermesso.indexOf('permesso') > 0){
            //console.log('Aggiunto permesso permesso.');            
            nPermessiPermessi++;
        }
    }

    // Nascondo tutto il menu se l'utente non dispone nessun permesso di quella categoria
    if(nPermessiBeacons == 0){
        document.getElementById('dropdownBeacon').style = "display:none";
    }
    if(nPermessiPermessi == 0){
        document.getElementById('dropdownPermessi').style = "display:none";
    }
    if(nPermessiUtente == 0){
        document.getElementById('dropdownUtente').style = "display:none";
    }
}

function nascondiTutti(){
    let divFunzioni = document.getElementsByClassName('funzione');
    let divDescrizioni = document.getElementsByClassName('descrizione');
    let dim = divFunzioni.length;
    for(let indice = 0; indice < dim; indice++){
        divFunzioni[indice].classList.add("nascondi");
    }
    dim = divDescrizioni.length;
    for(let indice = 0; indice < dim; indice++){
        divDescrizioni[indice].classList.add("nascondi");
    }
    let spanFiltriMappa = document.getElementById('spanFiltriMappa');
    spanFiltriMappa.classList.add('nascondi');
    let spanMappa = document.getElementById('spanMappa');
    spanMappa.classList.add('nascondi');
    let spazioPreFiltriMappa = document.getElementById('spazioPreFiltriMappa');
    spazioPreFiltriMappa.classList.add('nascondi');
    let spazioPreFunzionalita = document.getElementById('spazioPreFunzionalita');
    spazioPreFunzionalita.classList.add('nascondi');
    let spazioPostFunzionalita = document.getElementById('spazioPostFunzionalita');
    spazioPostFunzionalita.classList.add('nascondi');
}

function mostra(funzione){
    document.getElementById(funzione).classList.remove("nascondi");
}

function mostraDescrizione(descrizione){
    document.getElementsByClassName(descrizione)[0].classList.remove("nascondi");
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

// Funzione Home
function mostraHome(){
    funzionalitaSelezionata = 'home';
    mostraMappa();
    mostra('funzioneHome');
    mostraDescrizione('descrizioneHome');
}
mostraHome();

function mostraMappa(){
    let spanMappa = document.getElementById('spanMappa');
    spanMappa.classList.remove('nascondi');
    let spanFiltriMappa = document.getElementById('spanFiltriMappa');
    spanFiltriMappa.classList.remove('nascondi');
    let spazioPreFiltriMappa = document.getElementById('spazioPreFiltriMappa');
    spazioPreFiltriMappa.classList.remove('nascondi');

    // Abilito di nuovo le select del piano e dell'edificio nel caso siano state disabilitate
    document.getElementById('selectEdificioMappaGrande').removeAttribute('disabled');
    document.getElementById('selectPianoMappaGrande').removeAttribute('disabled');

}

// Funzioni legate ai beacon

//TODO: Fare in modo che l'utente clicki sulla mappa e salvi la posizione come Lat e Lng
function aggiungiBeacon(){
    var risp = checkPermission('Aggiungi beacon');
    //console.log(risp);
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    //nascondiMappaIniziale();
    nascondiTutti();
    mostraMappa();
    mostraDescrizione('descrizioneAggiungiBeacon');
    mostra('funzioneAggiungiBeacon');
    //alert('Disponi di questo permesso.');
}

function confermaAggiungiBeacon(){
    let mac, nome, descrizione, lat, lng, edificio, piano;
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
    lat = document.getElementById('latNuovoBeacon');
    if(!lat.checkValidity()){
        return false;
    }
    lng = document.getElementById('lngNuovoBeacon');
    if(!lng.checkValidity()){
        return false;
    }
    edificio = document.getElementById('edificioNuovoBeacon');
    if(!edificio.checkValidity()){
        return false;
    }
    piano = document.getElementById('pianoNuovoBeacon');
    if(!piano.checkValidity()){
        return false;
    }

    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert("Inserimento avvenuto con successo.");
        }
    };
    xhttp.open("POST", "./php/aggiungiBeacon.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("MAC=" + mac.value + "&Nome=" + nome.value + "&Descrizione=" + descrizione.value + "&Lat=" + lat.value + "&Lng=" + lng.value + "&Edificio=" + edificio.value + "&Piano=" + piano.value); 
}

function selectBeaconRimuovi(marker){
    let beaconSelezionato = getBeaconFromMarker(marker);
    let macBeaconDaEliminare = document.getElementById('macBeaconDaEliminare');
    for(let indice = 0; indice < beacons.length; indice++){
        if(beaconSelezionato.MAC == beacons[indice]['MAC']){
            macBeaconDaEliminare.selectedIndex = indice;
            macBeaconDaEliminare.onchange();
            break;
        }
    }
    marker.setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000");
}

function rimuoviBeacon(){
    funzionalitaSelezionata = 'rimuoviBeacon';
    var risp = checkPermission('Rimuovi beacon');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiTutti();
    mostraMappa();
    mostraDescrizione('descrizioneRimuoviBeacon');

    let macBeaconDaEliminare = document.getElementById('macBeaconDaEliminare');
    macBeaconDaEliminare.innerHTML = "";
    for(let indice = 0; indice < beacons.length; indice++){
        macBeaconDaEliminare.innerHTML += "<option>" + beacons[indice]['MAC'] + "</option>";
    }
    macBeaconDaEliminare.onchange = function(){
        let b = beacons[macBeaconDaEliminare.selectedIndex];
        let selectEdificio = document.getElementById('selectEdificioMappaGrande');
        let selectPiano = document.getElementById('selectPianoMappaGrande');
        let edificioDaSelezionare;
        for(let indice = 0; indice < edifici.length; indice++){
            if(edifici[indice]['Nome'] == b.Edificio){
                selectEdificio.selectedIndex = indice;
                selectEdificio.onchange();
                let piani = edifici[indice]['Piani'].split(',');
                for(let j = 0; j < piani.length; j++){
                    if(piani[j] == b.Piano){
                        selectPiano.selectedIndex = j;
                        selectPiano.onclick();
                        break;
                    }
                }
            }
        }
        
        let nomeBeaconDaEliminare = document.getElementById('nomeBeaconDaEliminare');
        nomeBeaconDaEliminare.value = b.Nome;
        nomeBeaconDaEliminare.setAttribute('readonly',true);
        let descrizioneBeaconDaEliminare = document.getElementById('descrizioneBeaconDaEliminare');
        descrizioneBeaconDaEliminare.setAttribute('readonly',true);
        descrizioneBeaconDaEliminare.value = b.Descrizione;
        let latBeaconDaEliminare = document.getElementById('latBeaconDaEliminare');
        latBeaconDaEliminare.setAttribute('readonly',true);
        latBeaconDaEliminare.value = b.Lat;
        let lngBeaconDaEliminare = document.getElementById('lngBeaconDaEliminare');
        lngBeaconDaEliminare.setAttribute('readonly',true);
        lngBeaconDaEliminare.value = b.Lng;
        let edificioBeaconDaEliminare = document.getElementById('edificioBeaconDaEliminare');
        edificioBeaconDaEliminare.setAttribute('readonly',true);
        edificioBeaconDaEliminare.value = b.Edificio;
        let pianoBeaconDaEliminare = document.getElementById('pianoBeaconDaEliminare');
        pianoBeaconDaEliminare.setAttribute('readonly',true);
        pianoBeaconDaEliminare.value = b.Piano;

        // Coloro il marker di rosso
        getMarkerFromBeacon(b).setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000");
    };
    macBeaconDaEliminare.onchange();
    mostra('funzioneRimuoviBeacon');
}

function confermaRimuoviBeacon(){
    let mac = document.getElementById('macBeaconDaEliminare');
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert("Eliminazione avvenuta con successo.");
            document.location.reload();
        }
    };
    xhttp.open("POST", "./php/rimuoviBeacon.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("MAC=" + mac.value); 
}

function associaBeacon(){
    funzionalitaSelezionata = 'associaBeacon';
    var risp = checkPermission('Associa beacon');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiTutti();

    // Carico le info degli utenti nella select
    let selectUtenteAssociareBeacon = document.getElementById('selectUtenteAssociareBeacon');
    selectUtenteAssociareBeacon.innerHTML = "";
    if(utenti.length < 1){
        alert('Non ci sono utenti nel DataBase.');
        return;
    }
    // Carico le informazioni nella select dell'utente
    for(let indice = 0; indice < utenti.length;indice++){
        selectUtenteAssociareBeacon.innerHTML += "<option>" + utenti[indice]['Matricola'] + "</option>";
    }

    // Associo il listener alla select
    selectUtenteAssociareBeacon.onchange = function(){
        let u = utenti[selectUtenteAssociareBeacon.selectedIndex];
        let nomeUtenteAssociareBeacon = document.getElementById('nomeUtenteAssociareBeacon');
        nomeUtenteAssociareBeacon.value = u.Nome;
        let cognomeUtenteAssociareBeacon = document.getElementById('cognomeUtenteAssociareBeacon');
        cognomeUtenteAssociareBeacon.value = u.Cognome;
    }
    selectUtenteAssociareBeacon.onchange();

    let selectBeaconAssociareBeacon = document.getElementById('selectBeaconAssociareBeacon');
    selectBeaconAssociareBeacon.innerHTML = "";
    if(beacons.length < 1){
        alert('Non ci sono beacons nel DataBase.');
        return;
    }
    // Carico le informazioni nella select dei beacons
    for(let indice = 0; indice < beacons.length;indice++){
        selectBeaconAssociareBeacon.innerHTML += "<option>" + beacons[indice]['MAC'] + "</option>";
    }

    // Associo il listener alla select
    selectBeaconAssociareBeacon.onchange = function(){
        let b = beacons[selectBeaconAssociareBeacon.selectedIndex];
        let selectEdificio = document.getElementById('selectEdificioMappaGrande');
        let selectPiano = document.getElementById('selectPianoMappaGrande');
        let edificioDaSelezionare;
        for(let indice = 0; indice < edifici.length; indice++){
            if(edifici[indice]['Nome'] == b.Edificio){
                selectEdificio.selectedIndex = indice;
                selectEdificio.onchange();
                let piani = edifici[indice]['Piani'].split(',');
                for(let j = 0; j < piani.length; j++){
                    if(piani[j] == b.Piano){
                        selectPiano.selectedIndex = j;
                        selectPiano.onclick();
                        break;
                    }
                }
            }
        }
        
        let nomeBeaconAssociareBeacon = document.getElementById('nomeBeaconAssociareBeacon');
        nomeBeaconAssociareBeacon.value = b.Nome;
        let descrizioneBeaconAssociareBeacon = document.getElementById('descrizioneBeaconAssociareBeacon');
        descrizioneBeaconAssociareBeacon.value = b.Descrizione;
        let latBeaconAssociareBeacon = document.getElementById('latBeaconAssociareBeacon');
        latBeaconAssociareBeacon.value = b.Lat;
        let lngBeaconAssociareBeacon = document.getElementById('lngBeaconAssociareBeacon');
        lngBeaconAssociareBeacon.value = b.Lng;
        let edificioBeaconAssociareBeacon = document.getElementById('edificioBeaconAssociareBeacon');
        edificioBeaconAssociareBeacon.value = b.Edificio;
        let pianoBeaconAssociareBeacon = document.getElementById('pianoBeaconAssociareBeacon');
        pianoBeaconAssociareBeacon.value = b.Piano;

        // Coloro il marker di blu
        getMarkerFromBeacon(b).setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0319bf");
    }
    mostraMappa();
    selectBeaconAssociareBeacon.onchange();

    mostraDescrizione('descrizioneAssociaBeacon');
    mostra('funzioneAssociaBeacon');
}

function selectBeaconAssocia(marker){
    let selectBeaconAssociareBeacon = document.getElementById('selectBeaconAssociareBeacon');
    let beaconSelezionato = getBeaconFromMarker(marker);
    for(let indice = 0; indice < beacons.length; indice++){
        if(beaconSelezionato.MAC == beacons[indice]['MAC']){
            selectBeaconAssociareBeacon.selectedIndex = indice;
            selectBeaconAssociareBeacon.onchange();
            break;
        }
    }
}

function confermaAssociaBeacon(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert('Associazione avvenuta con successo.');
                document.location.reload();
                return;
            }
        }
    };
    xhttp.open("POST", "./php/associaUtenteBeacon.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Matricola="+document.getElementById('selectUtenteAssociareBeacon').value + "&MAC=" + document.getElementById('selectBeaconAssociareBeacon').value);
}

function dissociaBeacon(){
    nascondiTutti();
    mostraMappa();
    mostraDescrizione('descrizioneDissociaBeacon');
    mostra('funzioneDissociaBeacon');
    funzionalitaSelezionata = 'dissociaBeacon';

    // Carico utenti
    let selectUtenteDissociareBeacon = document.getElementById('selectUtenteDissociareBeacon');
    selectUtenteDissociareBeacon.innerHTML = "";
    // select utenti
    for(let indice = 0; indice < utenti.length; indice++){
        selectUtenteDissociareBeacon.innerHTML += "<option>" + utenti[indice].Matricola + "</option>";
    }

    selectUtenteDissociareBeacon.onchange = function(){
        let u = utenti[document.getElementById('selectUtenteDissociareBeacon').selectedIndex];
        let nomeUtenteDissociareBeacon = document.getElementById('nomeUtenteDissociareBeacon');
        let cognomeUtenteDissociareBeacon = document.getElementById('cognomeUtenteDissociareBeacon');
        nomeUtenteDissociareBeacon.value = u.Nome;
        cognomeUtenteDissociareBeacon.value = u.Cognome;

        // Scarico la lista dei beacons associati al docente
        // poi popolo la select con i dati ricevuti
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var risposta = JSON.parse(this.responseText);
                if(risposta['stato'] == "Errore"){
                    alert(risposta['stato']+": " + risposta['messaggio']);
                    return false;
                }
                if(risposta['stato'] == 'Vuoto'){
                    alert('Questo utente non ha nessun beacon associato.');
                    return;
                }
                let beaconsAssociati = risposta['beaconsAssociati'];
                 // Popolo la select dei beacon in base all'utente selezionato
                let selectBeaconDissociareBeacon = document.getElementById('selectBeaconDissociareBeacon');
                selectBeaconDissociareBeacon.innerHTML = "";
                for(let indice = 0; indice < beaconsAssociati.length; indice++){
                    selectBeaconDissociareBeacon.innerHTML+="<option>" + beaconsAssociati[indice].MAC + "</option>";
                }
                selectBeaconDissociareBeacon.onchange = function(){
                    let b = beaconsAssociati[selectBeaconDissociareBeacon.selectedIndex];
                    let nomeBeaconDissociareBeacon = document.getElementById('nomeBeaconDissociareBeacon');
                    nomeBeaconDissociareBeacon.value = b.Nome;
                    let descrizioneBeaconDissociareBeacon = document.getElementById('descrizioneBeaconDissociareBeacon');
                    descrizioneBeaconDissociareBeacon.value = b.Descrizione;
                    let latBeaconDissociareBeacon = document.getElementById('latBeaconDissociareBeacon');
                    latBeaconDissociareBeacon.value =  b.Lat;
                    let lngBeaconDissociareBeacon = document.getElementById('lngBeaconDissociareBeacon');
                    lngBeaconDissociareBeacon.value = b.Lng;
                    let edificioBeaconDissociareBeacon = document.getElementById('edificioBeaconDissociareBeacon');
                    edificioBeaconDissociareBeacon.value = b.Edificio;
                    let pianoBeaconDissociareBeacon = document.getElementById('pianoBeaconDissociareBeacon');
                    pianoBeaconDissociareBeacon.value = b.Piano;

                    let selectEdificio = document.getElementById('selectEdificioMappaGrande');
                    let selectPiano = document.getElementById('selectPianoMappaGrande');
                    let edificioDaSelezionare;
                    for(let indice = 0; indice < edifici.length; indice++){
                        if(edifici[indice]['Nome'] == b.Edificio){
                            selectEdificio.selectedIndex = indice;
                            selectEdificio.onchange();
                            let piani = edifici[indice]['Piani'].split(',');
                            for(let j = 0; j < piani.length; j++){
                                if(piani[j] == b.Piano){
                                    selectPiano.selectedIndex = j;
                                    selectPiano.onclick();
                                    break;
                                }
                            }
                        }
                    }
                    // Coloro il marker di viola
                    getMarkerFromBeacon(b).setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|ba02ed");
                }
                selectBeaconDissociareBeacon.onchange();
            }
        };
        xhttp.open("POST", "./php/getBeaconsAssociati.php", false);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("Matricola="+u.Matricola);
    };
    selectUtenteDissociareBeacon.onchange();

    // Blocco le select dell'edificio e del piano in modo da far vedere sempre quello selezionato dalla select
    document.getElementById('selectEdificioMappaGrande').setAttribute('disabled',true);
    document.getElementById('selectPianoMappaGrande').setAttribute('disabled',true);

}

/*
    Sostanzialmente non dovrebbe succedere nulla se l'utente clicka il marker poiché altrimenti dovrei mostrare
    tutti gli utenti che sono associati a quel beacon.
*/
//FIXME: Decidere se serve poter selezionare il marker e caricare tutti gli utenti associati a quel beacon
function selectBeaconDissocia(marker){
    /*let selectBeaconDissociareBeacon = document.getElementById('selectBeaconDissociareBeacon');
    let b = beacons[selectBeaconDissociareBeacon.selectedIndex];
    marker.setIcon();
    let beaconSelezionato = null;
    for(let indice = 0; indice < beacons.length; indice++){
        if(marker.title == (beacons[indice]['Nome'] + "\n" + beacons[indice]['Descrizione'])){
            beaconSelezionato = beacons[indice];
            break;
        }
    }
    for(let indice = 0; indice < beacons.length; indice++){
        if(beaconSelezionato.MAC == beacons[indice]['MAC']){
            selectBeaconDissociareBeacon.selectedIndex = indice;
            break;
        }
    }
    let nomeBeaconDissociareBeacon = document.getElementById('nomeBeaconDissociareBeacon');
    nomeBeaconDissociareBeacon.value = b.Nome;
    let descrizioneBeaconDissociareBeacon = document.getElementById('descrizioneBeaconDissociareBeacon');
    descrizioneBeaconDissociareBeacon.value = b.Descrizione;
    let latBeaconDissociareBeacon = document.getElementById('latBeaconDissociareBeacon');
    latBeaconDissociareBeacon.value = b.Lat;
    let lngBeaconDissociareBeacon = document.getElementById('lngBeaconDissociareBeacon');
    lngBeaconDissociareBeacon.value = b.Lng;
    let edificioBeaconDissociareBeacon = document.getElementById('edificioBeaconDissociareBeacon');
    edificioBeaconDissociareBeacon.value = b.Edificio;
    let pianoBeaconDissociareBeacon = document.getElementById('pianoBeaconDissociareBeacon');
    pianoBeaconDissociareBeacon.value = b.Piano;*/
}

function confermaDissociaBeacon(){
    let u = document.getElementById('selectUtenteDissociareBeacon').value;
    let b = document.getElementById('selectBeaconDissociareBeacon').value;
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert('Beacon dissociato con successo.');
            document.location.reload();
        }
    }
    xhttp.open("POST", "./php/dissociaUtenteBeacon.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("Matricola="+u + "&MAC=" + b);
}

function gestisciBeacons(){
    funzionalitaSelezionata = 'gestisciBeacons';
    var risp = checkPermission();
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiTutti();
    mostraMappa();

    // Carico i beacons nella select
    let macBeaconGestisci = document.getElementById('macBeaconGestisci');
    macBeaconGestisci.innerHTML = "";
    for(let indice = 0; indice < beacons.length; indice++){
        macBeaconGestisci.innerHTML += "<option>" + beacons[indice]['MAC'] + "</option>";
    }
    macBeaconGestisci.onchange = function(){
        let b = beacons[macBeaconGestisci.selectedIndex];
        let selectEdificio = document.getElementById('selectEdificioMappaGrande');
        let selectPiano = document.getElementById('selectPianoMappaGrande');
        let edificioDaSelezionare;
        for(let indice = 0; indice < edifici.length; indice++){
            if(edifici[indice]['Nome'] == b.Edificio){
                selectEdificio.selectedIndex = indice;
                selectEdificio.onchange();
                let piani = edifici[indice]['Piani'].split(',');
                for(let j = 0; j < piani.length; j++){
                    if(piani[j] == b.Piano){
                        selectPiano.selectedIndex = j;
                        selectPiano.onclick();
                        break;
                    }
                }
            }
        }
        
        let nomeBeaconGestisci = document.getElementById('nomeBeaconGestisci');
        nomeBeaconGestisci.value = b.Nome;
        let descrizioneBeaconGestisci = document.getElementById('descrizioneBeaconGestisci');
        descrizioneBeaconGestisci.value = b.Descrizione;
        let latBeaconGestisci = document.getElementById('latBeaconGestisci');
        latBeaconGestisci.value = b.Lat;
        let lngBeaconGestisci = document.getElementById('lngBeaconGestisci');
        lngBeaconGestisci.value = b.Lng;
        let edificioBeaconGestisci = document.getElementById('edificioBeaconGestisci');
        edificioBeaconGestisci.value = b.Edificio;
        let pianoBeaconGestisci = document.getElementById('pianoBeaconGestisci');
        pianoBeaconGestisci.value = b.Piano;

        // Coloro il marker di azzurro
        getMarkerFromBeacon(b).setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|02effc");
    };
    macBeaconGestisci.onchange();

    mostra('funzioneGestisciBeacon');
}

function selectBeaconGestisci(marker){
    let beaconSelezionato = getBeaconFromMarker(marker);
    let macBeaconGestisci = document.getElementById('macBeaconGestisci');
    for(let indice = 0; indice < beacons.length; indice++){
        if(beaconSelezionato.MAC == beacons[indice]['MAC']){
            macBeaconGestisci.selectedIndex = indice;
            macBeaconGestisci.onchange();
            break;
        }
    }
    marker.setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|02effc");
}

function confermaGestisciBeacon(){
    // Salvo tutti i valori
    let mac = document.getElementById('macBeaconGestisci').value;
    let nome = document.getElementById('nomeBeaconGestisci').value;
    let descrizione = document.getElementById('descrizioneBeaconGestisci').value;
    let lat  = document.getElementById('latBeaconGestisci').value;
    let lng  = document.getElementById('lngBeaconGestisci').value;
    let edificio  = document.getElementById('edificioBeaconGestisci').value;
    let piano  = document.getElementById('pianoBeaconGestisci').value;
    // I campi vengono validati dal JS
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert('Le informazioni del Beacon sono state aggiornate con successo.');
            document.location.reload();
        }
    }
    xhttp.open("POST", "./php/salvaDatiBeacon.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("MAC=" + mac + "&Nome=" + nome + "&Descrizione=" + descrizione + "&Lat=" + lat + "&Lng=" + lng + "&Edificio=" + edificio + "&Piano=" + piano);
}

// Funzioni legate ai permessi

function aggiungiPermesso(){
    var risp = checkPermission('Aggiungi permesso');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiTutti();
    mostra('spazioPreFunzionalita');
    mostraDescrizione('descrizioneAggiungiPermesso');
    mostra('funzioneAggiungiPermesso');
    mostra('spazioPostFunzionalita');
}

function confermaAggiungiPermesso(){
    let nomeAggiungiPermesso = document.getElementById('nomeAggiungiPermesso');
    let descrizioneAggiungiPermesso = document.getElementById('descrizioneAggiungiPermesso');
    if(!(nomeAggiungiPermesso.validity.valid && descrizioneAggiungiPermesso.validity.valid)){
        return;
    }
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
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
    nascondiTutti();
    mostraDescrizione('descrizioneRimuoviPermesso');
    mostra('spazioPreFunzionalita');
    let selectPermessoDaEliminare = document.getElementById('selectPermessoDaEliminare');
    selectPermessoDaEliminare.innerHTML = "";
    for(let indice = 0; indice < permessi.length; indice++){
        selectPermessoDaEliminare.innerHTML += "<option>" + permessi[indice]['ID'] + "</option>";
    }
    selectPermessoDaEliminare.onchange = function(){
        let nomePermessoDaEliminare = document.getElementById('nomePermessoDaEliminare');
        nomePermessoDaEliminare.setAttribute('readonly', true);
        nomePermessoDaEliminare.value = permessi[document.getElementById('selectPermessoDaEliminare').selectedIndex].Nome;
        let descrizionePermessoDaEliminare = document.getElementById('descrizionePermessoDaEliminare');
        descrizionePermessoDaEliminare.setAttribute('readonly',true);
        descrizionePermessoDaEliminare.value = permessi[document.getElementById('selectPermessoDaEliminare').selectedIndex].Descrizione;
    };
    selectPermessoDaEliminare.onchange();
    mostra('funzioneRimuoviPermesso');
}

function confermaEliminaPermesso(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            console.log(risposta);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert("Eliminazione del permesso effettuata con successo.");
                document.location.reload();
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
    nascondiTutti();

    // popolo la select degli utenti
    let selectUtenteDaAssociare = document.getElementById('selectUtenteAssociarePermesso');
    selectUtenteDaAssociare.innerHTML = "";
    
    // Carico le informazioni nella select degli utenti
    for(var indice = 0; indice < utenti.length;indice++){
        selectUtenteDaAssociare.innerHTML += "<option>" + utenti[indice]['Matricola'] + "</option>";
    }

    // Associare il listener alla select
    selectUtenteDaAssociare.onchange = function(){
        document.getElementById('nomeUtenteAssociarePermesso').value = utenti[selectUtenteDaAssociare.selectedIndex]['Nome'];
        document.getElementById('cognomeUtenteAssociarePermesso').value = utenti[selectUtenteDaAssociare.selectedIndex]['Cognome'];
    }
    selectUtenteDaAssociare.onchange();

    // Popolo la select dei permessi
    var selectPermessoDaAssociare = document.getElementById('selectPermessoAssociarePermesso');
    selectPermessoDaAssociare.innerHTML = "";
    
    // Carico le informazioni nella select dei permessi
    for(var indice = 0; indice < permessi.length;indice++){
        selectPermessoDaAssociare.innerHTML += "<option>" + permessi[indice]['ID'] + "</option>";
    }

    // Associare il listener alla select
    selectPermessoDaAssociare.onchange = function(){
        document.getElementById('nomePermessoAssociarePermesso').value = permessi[selectPermessoDaAssociare.selectedIndex]['Nome'];
        document.getElementById('descrizionePermessoAssociarePermesso').value = permessi[selectPermessoDaAssociare.selectedIndex]['Descrizione'];
    }
    selectPermessoDaAssociare.onchange();

    mostraDescrizione('descrizioneAssociaPermesso');
    mostra('spazioPreFunzionalita');
    mostra('funzioneAssociaPermesso');
}

function confermaAssociaPermesso(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
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
    nascondiTutti();

    // Carico gli utenti
    var selectUtenteDaDissociare = document.getElementById('selectUtenteDissociarePermesso');
    selectUtenteDaDissociare.innerHTML = "";
    
    // Carico le informazioni nella select dei beacons
    for(var indice = 0; indice < utenti.length;indice++){
        selectUtenteDaDissociare.innerHTML += "<option>" + utenti[indice]['Matricola'] + "</option>";
    }

    selectUtenteDaDissociare.onchange = function(){
        document.getElementById('nomeUtenteDissociarePermesso').value = utenti[selectUtenteDaDissociare.selectedIndex]['Nome'];
        document.getElementById('cognomeUtenteDissociarePermesso').value = utenti[selectUtenteDaDissociare.selectedIndex]['Cognome'];

        // Aggiorno i valori nella select dei permessi
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var risposta = JSON.parse(this.responseText);
                if(risposta['stato'] == "Errore"){
                    alert(risposta['stato']+": " + risposta['messaggio']);
                    return false;
                }

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

                // Associo il listener alla select
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
    mostraDescrizione('descrizioneDissociaPermesso');
    mostra('spazioPreFunzionalita');
    mostra('funzioneDissociaPermesso');
}

function confermaDissociaPermesso(){
    var selectPermessoDaDissociare = document.getElementById('selectPermessoDissociarePermesso');
    if(selectPermessoDaDissociare.value.length <= 0){
        alert('Nessun permesso da dissociare.')
        return;
    }
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert('Permesso dissociato con successo.');
            document.location.reload();
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
    nascondiTutti();

    // Carico i permessi dal database nella select
    var selectPermessoGestisci = document.getElementById('selectPermessoGestisci');
    selectPermessoGestisci.innerHTML = "";
    for(var indice = 0; indice < permessi.length; indice++){
        selectPermessoGestisci.innerHTML += "<option>" + permessi[indice]['ID'] + "</option>";
    }

    selectPermessoGestisci.onchange = function (){
        document.getElementById('nomePermessoGestisci').value = permessi[selectPermessoGestisci.selectedIndex]['Nome'];
        document.getElementById('descrizionePermessoGestisci').value = permessi[selectPermessoGestisci.selectedIndex]['Descrizione'];
    }
    selectPermessoGestisci.onchange();
    mostra('spazioPreFunzionalita');
    mostraDescrizione('descrizioneGestisciPermesso');
    mostra('funzioneGestisciPermesso');
}

function confermaGestisciPermesso(){
    let id = document.getElementById('selectPermessoGestisci');
    let nome = document.getElementById('nomePermessoGestisci');
    let descrizione = document.getElementById('descrizionePermessoGestisci');
    if(!(id.checkValidity() && nome.checkValidity() && descrizione.checkValidity())){
        alert('Bisogna riempire tutti i campi.');
        return false;
    }
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert('Informazioni del permesso salvate con successo');
                document.location.reload();
            }
        }
    };
    xhttp.open("POST", "./php/gestisciPermesso.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("ID="+ id.value + "&Nome=" + nome.value + "&Descrizione=" + descrizione.value);
}

// Funzioni legate all'utente

function aggiungiUtente(){
    var risp = checkPermission('Aggiungi utente');
    if(risp==false){
        alert('Non disponi di questo permesso.');
        return;
    }
    nascondiTutti();
    mostraDescrizione('descrizioneAggiungiUtente');
    mostra('spazioPreFunzionalita');
    mostra('funzioneAggiungiUtente');
}

function confermaAggiungiUtente(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            if(risposta['stato'] == "Ok"){
                alert('Utente aggiunto con successo.');
                document.location.reload();
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
    nascondiTutti();
    mostraDescrizione('descrizioneRimuoviUtente');
    mostra('spazioPreFunzionalita');
    // Carico gli utenti all'interno della select
    let matricolaUtenteEliminare = document.getElementById('matricolaUtenteEliminare');
    matricolaUtenteEliminare.innerHTML = "";
    utentiRimovibili = new Array();
    for(let indice = 0, indiceRimovibili = 0; indice < utenti.length; indice++){
        if(utenti[indice].Matricola == utente.matricola){
            continue;
        }
        utentiRimovibili[indiceRimovibili++] = utenti[indice];
    }
    for(let indice = 0; indice < utentiRimovibili.length; indice++){
        matricolaUtenteEliminare.innerHTML += "<option>" + utentiRimovibili[indice].Matricola + "</option>";
    }
    matricolaUtenteEliminare.onchange = function(){
        let nomeUtenteEliminare = document.getElementById('nomeUtenteEliminare');
        let cognomeUtenteEliminare = document.getElementById('cognomeUtenteEliminare');
        let u = utentiRimovibili[document.getElementById('matricolaUtenteEliminare').selectedIndex];
        nomeUtenteEliminare.value = u.Nome;
        cognomeUtenteEliminare.value = u.Cognome;
        nomeUtenteEliminare.setAttribute('readonly',true);
        cognomeUtenteEliminare.setAttribute('readonly', true);
    };
    matricolaUtenteEliminare.onchange();
    mostra('funzioneRimuoviUtente');
}

function confermaRimuoviUtente(){
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var risposta = JSON.parse(this.responseText);
            if(risposta['stato'] == "Errore"){
                alert(risposta['stato']+": " + risposta['messaggio']);
                return false;
            }
            alert('Eliminazione avvenuta con successo');
            document.location.reload();
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
    nascondiTutti();
    // Carico le informazioni dell'utente nei vari campi
    document.getElementById('matricolaGestisciUtente').value = utente.matricola;    
    document.getElementById('nomeGestisciUtente').value = utente.nome;    
    document.getElementById('cognomeGestisciUtente').value = utente.cognome;  
    mostraDescrizione('descrizioneGestisciUtente'); 
    mostra('spazioPreFunzionalita'); 
    mostra('funzioneGestisciUtente');
}

function confermaGestisciUtente(){
    // Salvo i dati nel database
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
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
            // FIXME: non funziona l'aggiornamento del cookie
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