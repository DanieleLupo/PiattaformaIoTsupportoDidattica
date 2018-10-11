<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";
    
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

    $query = $connection->query("UPDATE beacon SET Nome='$Nome', Descrizione='$Descrizione', Lat='$Lat', Lng='$Lng', Edificio='$Edificio', Piano='$Piano' WHERE MAC='$MAC'");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile aggiornare le informazioni del beacon.";
    }
    echo json_encode($toReturn);
    $connection->close();
?>