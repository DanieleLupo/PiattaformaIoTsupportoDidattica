<?php
    if(!isset($_POST['matricola']) || !isset($_POST['permesso'])){
        die("Errore: sono necessari matricola e nome del permesso.");
    }

    $matricola = $_POST['matricola'];
    $permesso = $_POST['permesso'];

    $db = "tesidanielelupo";
    $connection = new mysqli("localhost","root","",$db);
    if($connection->connect_error){
        die("Connessione fallita: ".$connection->connect_error);
    }

    // Chiamo la funzione dichiarata nel db
    $query = $connection->query("SELECT checkPermissionN('".$matricola."','".$permesso."')");
    if(null==$query){
        die("Errore: impossibile controllare il permesso. Riprovare più tardi");
    }
    $result = $query->fetch_row();
    echo $result[0] == 1;

    $connection->close();

?>