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

    // Salvo le informazioni nella variabile
    $Matricola = $_POST['Matricola'];
    $Nome = $_POST['Nome'];
    $Cognome = $_POST['Cognome'];

    // Mi connetto al DB
    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }

    $query = $connection->query("UPDATE utente SET Nome='$Nome', Cognome='$Cognome' WHERE Matricola='$Matricola'");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile aggiornare le informazioni dell'utente";
    }
    echo json_encode($toReturn);
    $connection->close();
?>