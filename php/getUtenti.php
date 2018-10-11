<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";

    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }
    $query = $connection->query("SELECT Matricola, Nome, Cognome FROM utente");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile recuperare la lista dei beacons.";
        //echo(json_encode($toReturn));
    }
    // Campi tabella DB: Matricola Nome Cognome
    $indice = 0;
    while($riga = $query->fetch_row()){
        $toReturn['utenti'][$indice]['Matricola'] = $riga[0];
        $toReturn['utenti'][$indice]['Nome'] = $riga[1];
        $toReturn['utenti'][$indice]['Cognome'] = $riga[2];
        $indice++;
    }
    echo(json_encode($toReturn));
    $connection->close();
?>