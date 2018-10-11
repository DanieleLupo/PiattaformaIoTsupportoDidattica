<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";

    if(!isset($_POST['MAC'])){
        $toReturn['stato']="Errore";
        $toReturn['messaggio'] = "MAC non settato";
        die(json_encode($toReturn));
    }

    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }
    $query = $connection->query("SELECT * FROM beacon");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile recuperare la lista dei beacons.";
        //echo(json_encode($toReturn));
    }
    // Campi tabella DB: MAC Nome Descrizione Lat Lng Edificio Posizione
    while($riga = $query->fetch_row()){
        $toReturn['beacon']['MAC'] = $riga[0];
        $toReturn['beacon']['Nome'] = $riga[1];
        $toReturn['beacon']['Descrizione'] = $riga[2];
        $toReturn['beacon']['Lat'] = $riga[3];
        $toReturn['beacon']['Lng'] = $riga[4];
        $toReturn['beacon']['Edificio'] = $riga[5];
        $toReturn['beacon']['Piano'] = $riga[6];        
    }
    echo(json_encode($toReturn));
    $connection->close();
?>