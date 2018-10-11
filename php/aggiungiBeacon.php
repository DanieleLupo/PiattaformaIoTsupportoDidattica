<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";
    
    // Campi db: MAC Nome Descrizione Posizione
    if(!isset($_POST['MAC'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "MAC non settato.";
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
    if(!isset($_POST['Lat'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Latitudine non settata.";
        die(json_encode($toReturn));
    }
    if(!isset($_POST['Lng'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Longitudine non settata.";
        die(json_encode($toReturn));
    }
    if(!isset($_POST['Edificio'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Edificio non settato.";
        die(json_encode($toReturn));
    }
    if(!isset($_POST['Piano'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Piano non settato.";
        die(json_encode($toReturn));
    }

    // Salvo le informazioni nella variabile
    $MAC = $_POST['MAC'];
    $Nome = $_POST['Nome'];
    $Descrizione = $_POST['Descrizione'];
    $Lat = $_POST['Lat'];
    $Lng = $_POST['Lng'];
    $Edificio = $_POST['Edificio'];
    $Piano = $_POST['Piano'];

    // Mi connetto al DB
    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }

    $query = $connection->query("INSERT INTO beacon VALUES ('$MAC','$Nome','$Descrizione','$Lat','$Lng','$Edificio','$Piano')");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile eseguire l'inserimento del nuovo beacon.";
        die(json_encode($toReturn));
    }
    die(json_encode($toReturn));
    $connection->close();
?>