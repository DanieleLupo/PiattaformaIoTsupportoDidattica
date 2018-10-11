<?php

    if(!isset($_POST['Contenuto'])){
        $Contenuto = "";
    }else{
        $Contenuto = $_POST['Contenuto'];
    }
    if(!isset($_POST['IDpagina'])){
        die('Errore: Pagina non definita.');
    }
    if(!isset($_POST['Modalita'])){
        die('Errore: Modalità non definita.');
    }

    //TODO: Estrapolare il nome del file dal beacon
    //TODO: Finire l'inizializzazione
    $INTESTAZIONE = 
    '<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <title></title>
    </head>
    <body style="text-align:center">';
    $FINE = "</body>\n</html>";
    $Contenuto = $_POST['Contenuto'];
    //echo $Contenuto;
    $Path = './pagine/';
    $IDpagina = $_POST['IDpagina'];
    $NomeFile = $Path.$IDpagina.'.html';
    $Modalita = $_POST['Modalita'];

    /**
     *  Gestire la modalità di apertura in base a:
     *  - se è la prima volta, creo il file da zero quindi serve l'intestazione
     *  - se l'intestazione è già esistente, bisogna aggiungere alla fine del file
     *  - se è la fine, bisogna chiudere i tag body e html
     */

    switch($Modalita){
        case 'inizio':
            /**
             * 1) Creo il nuovo file.
             * 2) Ci scrivo l'intestazione
             * 3) Scrivo l'inizio del body con quello che mi ha mandato
             * 4) Chiudo il file
             */
            
            $fp = fopen($NomeFile,'w');
            checkFile($fp);
            fwrite($fp,$INTESTAZIONE,strlen($INTESTAZIONE));
            fwrite($fp,$Contenuto, strlen($Contenuto));
            break;
        case 'aggiungi':
            /**
             * 1) Apro il file già esistente in append
             * 2) Scrivo quello che mi mandano
             * 3) Chiudo il file
             */

            $fp = fopen($NomeFile,'a');
            checkFile($fp);
            fwrite($fp,$Contenuto,strlen($Contenuto));
            break;
        case 'fine':
            /**
             * 1) Apro il file già esistente in append
             * 2) Scrivo la fine del file
             * 3) Chiudo il file
             */

            $fp=fopen($NomeFile,'a');
            checkFile($fp);
            fwrite($fp,$FINE);
            break;
    }
    fclose($fp);
    die('Ok');

    function checkFile($fp){
        if($fp == null){
            die("Errore: impossibile aprire il file.");
        }
    }

?>