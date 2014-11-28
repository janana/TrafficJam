<?php

header("");
$url = "http://api.sr.se/api/v2/traffic/messages?size=100&format=json&pagination=false&indent=true";
$rawJson = file_get_contents($url);

echo $rawJson;
