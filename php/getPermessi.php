<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";
    
    // Mi connetto al DB
    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }

    $query = $connection->query("SELECT * FROM permesso");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile eseguire l'inserimento del permesso.";
    }
    $indice = 0;
    while($riga = $query->fetch_row()){
        $toReturn['permessi'][$indice]['ID'] = $riga[0];
        $toReturn['permessi'][$indice]['Nome'] = $riga[1];
        $toReturn['permessi'][$indice++]['Descrizione'] = $riga[2];
    }
    echo json_encode($toReturn);
    $connection->close();
?>