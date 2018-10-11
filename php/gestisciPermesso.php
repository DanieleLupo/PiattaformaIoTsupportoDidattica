<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";
    
    // Campi db: MAC Nome Descrizione Posizione
    if(!isset($_POST['ID'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "ID del permesso non settato.";
        die(json_encode($toReturn));
    }
    if(!isset($_POST['Nome'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Nome non settato.";
        die(json_encode($toReturn));
    }
    if(!isset($_POST['Descrizione'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Descrizione non settata.";
        die(json_encode($toReturn));
    }

    // Salvo le informazioni nella variabile
    $ID = $_POST['ID'];
    $Nome = $_POST['Nome'];
    $Descrizione = $_POST['Descrizione'];

    // Mi connetto al DB
    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }

    $query = $connection->query("UPDATE `permesso` SET `Nome`='$Nome',`Descrizione`='$Descrizione' WHERE ID='$ID'");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile eseguire l'aggiornamento delle informazioni del permesso.";
        die(json_encode($toReturn));
    }
    die(json_encode($toReturn));
    $connection->close();
?>