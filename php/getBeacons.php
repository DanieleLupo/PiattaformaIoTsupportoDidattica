<?php
    @require('connessioneDB.php');
    // Oggetto da restituire
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";

    $connection = getDBConnection();
    if($connection == null){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Connessione al DataBase non riuscita";
        die(json_encode($toReturn));
    }
    $query = $connection->query("SELECT * FROM beacon");
    if(null==$query){
        $toReturn['stato'] = "Errore";
        $toReturn['messaggio'] = "Impossibile recuperare la lista dei beacons.";
        //echo(json_encode($toReturn));
    }
    // Campi tabella DB: MAC Nome Descrizione Posizione
    $indice = 0;
    while($riga = $query->fetch_row()){
        $toReturn['beacons'][$indice]['MAC'] = $riga[0];
        $toReturn['beacons'][$indice]['Nome'] = $riga[1];
        $toReturn['beacons'][$indice]['Descrizione'] = $riga[2];
        $toReturn['beacons'][$indice]['Lat'] = $riga[3];
        $toReturn['beacons'][$indice]['Lng'] = $riga[4];
        $toReturn['beacons'][$indice]['Edificio'] = $riga[5];
        $toReturn['beacons'][$indice]['Piano'] = $riga[6];
        $toReturn['beacons'][$indice++]['Pagine'] = getPagine($riga[0]);
    }
    echo(json_encode($toReturn));
    $connection->close();

    function getPagine($mac){
        $path = ".././pagine/";
        $nomeCartella = "";
        $parts = explode(":",$mac);
        foreach( $parts as $e){
            $nomeCartella = $nomeCartella.$e;
        }
        if(!file_exists($path.$nomeCartella)){
            die('Errore: Cartella non trovata.');
        }
        
        $files = array();
        
        if($handle = opendir($path.$nomeCartella)){
            $indice = 0;
            while($file = readdir($handle)){
                if(!is_dir($path.$nomeCartella.'/'.$file)){
                    if($file != "." & $file != ".."){
                        $files [$indice++] = $file;
                    }
                }
            }
        }
        closedir($handle);
        //$files = json_encode($files);
        return $files;
    }
?>