<?php

if(!isset($_POST['MAC'])){
    die('Errore: MAC non definito.');
}

if(!file_exists('./pagine/'.$MAC)){
    die('Errore: Cartella non trovata.');
}

$files = null;

if($handle = opendir('./pagine/'.$MAC)){
    while($file = readdir($handle)){
        if(!is_dir('./pagine/'.$MAC.'/'.$file)){
            if ($file != "." & $file != "..") $files[] = $file;
        }
    }
}
closedir($handle);
echo json_encode($files);