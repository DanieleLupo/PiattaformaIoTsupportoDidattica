<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";

    if(!isset($_POST['Matricola'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Matricola non settata.";
        die(json_encode($toReturn));
    }

    $Matricola = $_POST['Matricola'];

    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }
    $query = $connection->query("SELECT ID, Nome, Descrizione FROM permesso WHERE ID in (SELECT ID from ottiene WHERE Matricola='$Matricola')");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile recuperare la lista dei beacons.";
    }
    $indice = 0;
    while($riga = $query->fetch_row()){
        $toReturn['permessi'][$indice]['ID'] = $riga[0];
        $toReturn['permessi'][$indice]['Nome'] = $riga[1];
        $toReturn['permessi'][$indice]['Descrizione'] = $riga[2];
        $indice++;
    }
    echo(json_encode($toReturn));
    $connection->close();
?>