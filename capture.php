<?php

/* [!] Note: Make sure you properly validate input server side! */

$imagedata = $_REQUEST['imagedata']; //get the image data
$filename = htmlentities($_REQUEST['filename']); //get the filename (optional)

$imagedata = str_replace('data:image/jpeg;base64,', '', $imagedata); //remove the dataURL first part
//OR $imagedata = substr($imagedata, strpos($imagedata, ",")+1);
$imagedata = base64_decode($imagedata); //base64 decode the image data

file_put_contents("upload/".$filename.date("_Y-m-d-H-i-s_").uniqid().".jpg", $imagedata); //save to jpg file with filename, datetime and a unique id

echo 'true'; //respond back to the AJAX call with something

?>