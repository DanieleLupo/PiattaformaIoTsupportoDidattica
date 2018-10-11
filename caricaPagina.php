<?php
    if(!isset($_POST['IDpagina'])){
        die('Errore: id pagina non definito.');
    }

    $Path = './pagine/';
    $IDpagina = $_POST['IDpagina'];
    $NomeFile = $Path.$IDpagina.'.html';

    $fp = fopen($NomeFile,'r') or die('Errore: file non trovato');
    
    $contenuto = fread($fp,filesize($NomeFile));
    $toSend = substr($contenuto,strpos($contenuto,'<body style="text-align:center">'),strpos($contenuto,'</body>'));
    echo $toSend;
    fclose($fp);

?>