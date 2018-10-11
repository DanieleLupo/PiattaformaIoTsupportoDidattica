<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";
    
    // Campi db: MAC Nome Descrizione Posizione
    if(!isset($_POST['ID'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "ID non settato.";
        die(json_encode($toReturn));
    }

    // Salvo le informazioni nella variabile
    $ID = $_POST['ID'];

    // Mi connetto al DB
    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }

    $query = $connection->query("DELETE FROM permesso WHERE ID=$ID");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile eseguire l'eliminazione del permesso.";
    }
    echo json_encode($toReturn);
    $connection->close();
?>