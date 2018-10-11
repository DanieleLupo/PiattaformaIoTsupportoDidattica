<?php
    @require('connessioneDB.php');
    // TODO Aggiornare questo file
    // Creo il JSON con tutte le informazioni
    $datiUtente = array();

    if(!isset($_POST['username']) || !isset($_POST['password'])){
        $datiUtente['stato'] = "Errore";
        $datiUtente['messaggio'] = "Username o password non inseriti.";
        die(json_encode($datiUtente));
    }
    $username = $_POST['username'];
    $password = $_POST['password'];
    $db = "tesidanielelupo";
    $connection = getDBConnection();
    if($connection==null){
        $datiUtente['stato'] = "Errore";
        $datiUtente['messaggio'] = "Impossibile connettersi al db.";
        die(json_encode($datiUtente));
    }

    // Recupero le informazioni sull'account
    $query = $connection->query("SELECT * FROM utente WHERE Matricola='$username' AND Password='$password'");
    if($query == FALSE){
        $datiUtente['stato'] = "Errore";
        $datiUtente['messaggio'] = "Username o password errati.";
        die(json_encode($datiUtente));
    }
       
    if($result = $query->fetch_row()){
        $datiUtente['stato'] = "Ok";
        $datiUtente['messaggio'] = ""; 
        $datiUtente['matricola'] = $result[0];
        $datiUtente['nome'] = $result[1];
        $datiUtente['cognome'] = $result[2];
    }else{
        $datiUtente['stato'] = "Errore";
        $datiUtente['messaggio'] = "Username o password errati.";
    }

    // Recupero le informazioni sui permessi
    $permessi = array(
        array() // ID, Nome, Descrizione
    );
    $query = $connection->query("SELECT permesso.ID, permesso.Nome, permesso.Descrizione FROM ottiene, permesso WHERE ottiene.Matricola=".$username." AND ottiene.ID=permesso.ID");
    if($query == FALSE){
        $datiUtente['stato'] = "Errore";
        $datiUtente['messaggio'] = "Problemi nel recupero dei permessi.";
        die(json_encode($datiUtente));
    }
    // Ciclo finché ci sono permessi
    $i = 0;
    while($result = $query->fetch_row()){
        $permessi[$i]['ID'] = $result[0];
        $permessi[$i]['Nome'] = $result[1];
        $permessi[$i++]['Descrizione'] = $result[2];
    }
    $datiUtente['permessi'] = $permessi;

    // Recupero le informazioni sui beacons da gestire
    $beacons = array(
        array()    // MAC, Nome, Descrizione, Posizione
    );
    $query = $connection->query("SELECT beacon.MAC, beacon.Nome, beacon.Descrizione, beacon.Lat, beacon.Lng, beacon.Edificio, beacon.Piano FROM gestisce, beacon WHERE Matricola=".$username." AND gestisce.MAC=beacon.MAC");
    if($query == FALSE){
        $datiUtente['stato'] = "Errore";
        $datiUtente['messaggio'] = "Impossibile recuperare le informazioni sui beacons gestiti.";
        die(json_encode($datiUtente));
    }
    // Ciclo finché ci sono beacons
    $i = 0;
    while($result = $query->fetch_row()){
        $beacons[$i]['MAC'] = $result[0];
        $beacons[$i]['Nome'] = $result[1];
        $beacons[$i]['Descrizione'] = $result[2];
        $beacons[$i]['Lat'] = $result[3];
        $beacons[$i]['Lng'] = $result[4];
        $beacons[$i]['Edificio'] = $result[5];
        $beacons[$i]['Piano'] = $result[6];        
    }
    $datiUtente['beacons'] = $beacons;

    // Invio il JSON
    echo json_encode($datiUtente);
    // Chiudo la connessione
    $connection->close();
?>