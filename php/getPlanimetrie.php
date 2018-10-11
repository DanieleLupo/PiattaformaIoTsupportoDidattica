<?php
    $toReturn = array();
    $toReturn['stato'] = "Ok";
    $toReturn['messaggio'] = "";
    $toReturn['files'] = array();
    $indice = 0;
    // la path è di 17
    foreach (glob(".././planimetrie/*.png") as $filename) {
        $toReturn['files'][$indice++] = substr($filename,17);
    }
    echo json_encode($toReturn);
?>