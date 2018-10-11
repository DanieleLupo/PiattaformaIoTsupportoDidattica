<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";
    
    // Campi db: MAC Nome Descrizione Posizione
    if(!isset($_POST['Matricola'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Matricola non settata.";
        die(json_encode($toReturn));
    }
    if(!isset($_POST['Nome'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Nome non settato.";
        die(json_encode($toReturn));
    }
    if(!isset($_POST['Cognome'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Cognome non settato.";
        die(json_encode($toReturn));
    }
    if(!isset($_POST['Password'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Password non settata.";
        die(json_encode($toReturn));
    }

    // Salvo le informazioni nella variabile
    $Matricola = $_POST['Matricola'];
    $Nome = $_POST['Nome'];
    $Cognome = $_POST['Cognome'];
    $Password = $_POST['Password'];

    // Mi connetto al DB
    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }

    $query = $connection->query("INSERT INTO utente VALUES ('$Matricola','$Nome','$Cognome','$Password')");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile eseguire l'inserimento dell'utente.";
        die(json_encode($toReturn));
    }
    die(json_encode($toReturn));
    $connection->close();
?>