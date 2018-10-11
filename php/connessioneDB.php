<?php
    function getDBConnection(){
        $db = "tesidanielelupo";
        $con = new mysqli("localhost","root","",$db);
        if($con->connect_error){
            return null;
        }else{
            return $con;
        }
        //return $connection;
    }
?>