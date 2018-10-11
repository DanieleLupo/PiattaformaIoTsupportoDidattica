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
    $query = $connection->query("SELECT MAC, Nome, Descrizione, Lat, Lng, Edificio, Piano FROM beacon WHERE MAC in (SELECT MAC from gestisce WHERE Matricola='$Matricola')");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile recuperare la lista dei beacons.";
    }
    $indice = 0;
    while($riga = $query->fetch_row()){
        $toReturn['beaconsAssociati'][$indice]['MAC'] = $riga[0];
        $toReturn['beaconsAssociati'][$indice]['Nome'] = $riga[1];
        $toReturn['beaconsAssociati'][$indice]['Descrizione'] = $riga[2];
        $toReturn['beaconsAssociati'][$indice]['Lat'] = $riga[3];
        $toReturn['beaconsAssociati'][$indice]['Lng'] = $riga[4];
        $toReturn['beaconsAssociati'][$indice]['Edificio'] = $riga[5];
        $toReturn['beaconsAssociati'][$indice]['Piano'] = $riga[6];
        $indice++;
    }
    if($indice==0){
        $toReturn['stato'] ="Vuoto";
    }
    echo(json_encode($toReturn));
    $connection->close();
?>