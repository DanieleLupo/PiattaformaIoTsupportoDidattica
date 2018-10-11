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
    if(!isset($_POST['ID'])){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "ID non settato.";
        die(json_encode($toReturn));
    }

    // Salvo le informazioni nella variabile
    $ID = $_POST['ID'];
    $Matricola = $_POST['Matricola'];
    
    // Mi connetto al DB
    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }

    $query = $connection->query("INSERT INTO ottiene VALUES ('$Matricola','".$ID."')");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile eseguire l'associazione.";
        //die(json_encode($toReturn));
    }
    echo json_encode($toReturn);
    $connection->close();
?>