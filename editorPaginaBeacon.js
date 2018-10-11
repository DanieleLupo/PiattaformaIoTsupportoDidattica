var utente = leggiCookie('infoUtente');
if(utente == null){
    alert('Bisogna essere loggati.');
    window.location.href = "./login.html";
}
document.getElementById('labelInfoUtente').innerHTML = utente['matricola'] + " " + utente['nome'] + " " + utente['cognome'];

//FIXME: Caricare l'id dinamicamente
let IDpagina = 1;

var indiceAddBefore = 0;
var albero = document.getElementById('albero');
// Carico la pagina se già esiste
xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let risposta = this.responseText;
        if(risposta.indexOf('Errore:') > -1){
            return;
        }else{
            // Reverse
            //FIXME: Dovrebbe farlo finché c'è qualcosa da caricare
            risposta = risposta.substring(32); // Tolgo tutta l'intestazione
            risposta = risposta.substring(0,risposta.length - ('</body></html>').length-1);
            while(risposta.length > 0){
                console.log('Testo rimanente ' + risposta);
                if(risposta.indexOf('<p>') == 0){ // E' una <p>
                    let testo = risposta.substring(3,risposta.indexOf('</p>'));
                    reverseInserisciTesto(testo);
                    risposta = risposta.substring(3 + testo.length + 4);
                }else if(risposta.indexOf('<img') == 0){ // E' un'immagine
                    let src = risposta.substring(risposta.indexOf('src=\'')+5,risposta.indexOf('\'>'));
                    reverseInserisciImmagine(src);
                    risposta = risposta.substring(10 + src.length + ('\'></img>').length + 4);
                }else if(risposta.indexOf('<video') == 0){// E' un video
                    let src = risposta.substring(risposta.indexOf('source src=\'')+12,risposta.indexOf('\'></video>'));
                    reverseInserisciVideo(src);
                    risposta = risposta.substring(("<video width='420' height='340' controls><source src='").length + src.length + ("'></video><br>").length);                    
                }
            }
        }
    }
};
xhttp.open("POST", "./caricaPagina.php", false);
xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
xhttp.send('IDpagina=' + IDpagina);

function reverseInserisciTesto(testo){
    let div = document.createElement('div');
    div.id = indiceAddBefore++;
    let p = document.createElement('p');
    p.textContent = testo;
    p.onclick = function(){
        p.contentEditable = true;
        p.classList.add('editable');
    }
    div.appendChild(p);
    div.appendChild(document.createElement('br'));
    creaBarraFunzioni(div,null);
}

function reverseInserisciImmagine(src){
    let div = document.createElement('div');
    div.id = indiceAddBefore++;
    let image = document.createElement('img');
    image.src = src;
    div.appendChild(image);
    div.appendChild(document.createElement('br'));
    creaBarraFunzioni(div,null);
}

function reverseInserisciVideo(src){
    let div = document.createElement('div');
    div.id = indiceAddBefore++;
    let video = document.createElement('video');
    let source = document.createElement('source');
    source.src = src;
    video.appendChild(source);
    video.setAttribute('width',"420");
    video.setAttribute('height',"340");
    video.setAttribute('controls',true);
    div.appendChild(video);
    div.appendChild(document.createElement('br'));

    creaBarraFunzioni(div,null);
}

function inserisciTesto(after){
    let nuovoElemento = document.createElement('div');
    nuovoElemento.id = indiceAddBefore++;
    let p = document.createElement('p');
    p.onclick = function(){
        p.contentEditable = true;
        p.classList.add('editable');
    }
    nuovoElemento.appendChild(p);
    nuovoElemento.appendChild(document.createElement('br'));
    p.textContent = 'Click per modificare il testo';

    creaBarraFunzioni(nuovoElemento,after);
}

function inserisciImmagine(after){
    let nuovoElemento = document.createElement('div');
    nuovoElemento.id = indiceAddBefore++;
    let image = document.createElement('img');
    let url = prompt("Inserire il link dell'immagine:","");
    if(url == null){
        alert('Immagine non inserita.');
        return;
    }
    image.src = url;
    nuovoElemento.appendChild(image);
    nuovoElemento.appendChild(document.createElement('br'));
    creaBarraFunzioni(nuovoElemento,after);
}

function inserisciVideo(after){
    let nuovoElemento = document.createElement('div');
    nuovoElemento.id = indiceAddBefore++;
    let video = document.createElement('video');
    let url = prompt("Inserire l'URL del video:","");
    if(url == null){
        return;
    }
    let source = document.createElement('source');
    source.src = './media/' + url;
    video.appendChild(source);
    video.setAttribute('width',"420");
    video.setAttribute('height',"340");
    video.setAttribute('controls',true);
    nuovoElemento.appendChild(video);
    nuovoElemento.appendChild(document.createElement('br'));

    creaBarraFunzioni(nuovoElemento,after);
}

function creaBarraFunzioni(span,after){
    let idSpan = span.id;
    let btAggiungiTesto = document.createElement('button');
    btAggiungiTesto.name = idSpan;
    btAggiungiTesto.innerHTML = '<img src=\'./icone/addText.png\'"></img>';
    btAggiungiTesto.onclick = function(){
        aggiungiTesto(btAggiungiTesto.name);
    };
    btAggiungiTesto.classList.add('btn');
    btAggiungiTesto.classList.add('btn-default');    
    span.appendChild(btAggiungiTesto);
    
    let btAggiungiImmagine = document.createElement('button');
    btAggiungiImmagine.innerHTML = '<img src=\'./icone/addImg.png\'"></img>';
    btAggiungiImmagine.name = idSpan;
    btAggiungiImmagine.onclick = function(){
        aggiungiImmagine(btAggiungiImmagine.name);
    };
    btAggiungiImmagine.classList.add('btn');
    btAggiungiImmagine.classList.add('btn-default');    
    span.appendChild(btAggiungiImmagine);
    
    let btAggiungiVideo = document.createElement('button');
    btAggiungiVideo.innerHTML = '<img src=\'./icone/addVideo.png\'"></img>';
    btAggiungiVideo.name = idSpan;
    btAggiungiVideo.onclick = function(){
        aggiungiVideo(btAggiungiVideo.name);
    };
    btAggiungiVideo.classList.add('btn');
    btAggiungiVideo.classList.add('btn-default');    
    span.appendChild(btAggiungiVideo);
    
    let btElimina = document.createElement('button');
    btElimina.innerHTML = '<img src=\'./icone/trash.png\'"></img>';
    btElimina.onclick = function(){
        eliminaElemento(idSpan);
    };
    btElimina.classList.add('btn');
    btElimina.classList.add('btn-default');    
    span.appendChild(btElimina);
    
    if(null == after){
        albero.appendChild(span);
    }else{
        console.log(document.getElementById(after) + ' e ' + document.getElementById(after).nextSibling);
        albero.insertBefore(span,document.getElementById(after).nextSibling);        
    }

    document.getElementById('rigaIniziale').style.display ='none';
    document.getElementById('descrizioneIniziale').style.display = 'none';
}

function aggiungiTesto(afterThis){
    inserisciTesto(afterThis);
}

function aggiungiImmagine(afterThis){
    inserisciImmagine(afterThis);
}

function aggiungiVideo(afterThis){
    inserisciVideo(afterThis);
}

var tipoURLVideo = 'altro';
function setTipoURL(tipo){
    tipoURLVideo = tipo;
}

function eliminaElemento(elemento){
    if(confirm("Sicuro di voler eliminare questo elemento?")){
        albero.removeChild(document.getElementById(elemento));
        if(albero.children.length == 0){
            document.getElementById('rigaIniziale').style.display ='inline';
            document.getElementById('descrizioneIniziale').style.display = 'inline';
        }
    }
}

// TODO: Salvare tutto creando il file della pagina del beacon

function salva(){
    //TODO: Gestire se già esiste il file e si cancella qualcosa

    /**
     * Procedura:
     * 1) Creo il file da zero
     * 2) Aggiungo i vari contenuti
     * 3) Chiudo il file
     */

    // FIXME: Durante il testing userò il file 1, fare in modo che sia dinamico
    let IDpagina = 1;

    // Creo l'array da stampare
    let arrayContenuto = new Array();
    let elemento;
    for(let indice = 0; indice < albero.children.length; indice++){
        elemento = albero.children[indice].firstChild;
        switch(elemento.tagName){
            case 'P':
                arrayContenuto[indice] = "<p>" + elemento.textContent + "</p>";
                console.log('Dovrei salvare ' + elemento.textContent + ' | Ho salvato ' + arrayContenuto[indice])
                break;
            case 'IMG':
                arrayContenuto[indice] = "<img src='" + elemento.src + "'></img><br>";
                break;
            case 'VIDEO':
                arrayContenuto[indice] = "<video width='" + elemento.width + "' height='" + elemento.height + "' controls><source src='" + elemento.firstChild.src + "'></video><br>";
                break;
        }
    }

    console.log('Devo salvare ' + arrayContenuto.length + ' oggetti.');
    for(let indice = 0, modalita = 'inizio'; indice < arrayContenuto.length; indice++){
        if(indice == 0){
            modalita = 'inizio';
        }else{
            modalita = 'aggiungi';
        }        
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let risposta = this.responseText;
                if(risposta.indexOf('Errore:') > -1){
                    alert('Errore nella gestione del file. Provare a chiudere e riaprire.');
                    return;
                }
                //console.log(risposta.responseText);
            }
        };
        xhttp.open("POST", "./salvaPagina.php", false);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send('Contenuto=' + arrayContenuto[indice] + '&IDpagina=' + IDpagina + '&Modalita=' + modalita);
    }

    // Chiudo il file
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let risposta = this.responseText;
            if(risposta.indexOf('Errore:') > -1){
                alert('Errore nella gestione del file. Provare a chiudere e riaprire.');
                return;
            }
        }
    };
    xhttp.open("POST", "./salvaPagina.php", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send('IDpagina=' + IDpagina + '&Modalita=fine');

    // Alla fine faccio vedere il risultato
    window.open('./pagine/' + IDpagina + '.html');
}

function annulla(){
    window.close();
}