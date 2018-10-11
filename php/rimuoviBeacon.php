<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";

    // Controllo se sono stati ricevuti tutti i parametri
    if(!isset($_POST['MAC'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "MAC non ricevuto.";
    }

    $MAC = $_POST['MAC'];

    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }
    $query = $connection->query("DELETE FROM beacon WHERE beacon.MAC='$MAC'");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile eseguire la cancellazione.";
    }

    echo(json_encode($toReturn));
    $connection->close();
?>