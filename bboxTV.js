//
//
// Saisir ici le nom que vous voulez associé au périphérique dons l'adresse MAC est l'indice du tableau associatif
//
var hosts={};
hosts['00:06:66:72:1a:db'] ='camera gabriel cable';
hosts['00:12:04:a0:23:af'] ="camera gabriel wifi";
hosts['98:fe:94:00:48:c8'] = "iphone 5 de Chante";
hosts['68:09:27:bf:76:0e'] = "iphone 4S de chante";
hosts['00:18:7f:00:50:ae'] = "Zibase";
hosts['00:11:32:0a:2b:05'] = "Synology";
hosts['1c:6f:65:d3:ca:e2'] = "i5";
hosts['00:21:6b:1e:79:c2'] = "portable Sylvie wifi";
hosts['74:f0:6d:6e:3f:36'] = "PAW";
hosts['b8:27:eb:30:a8:63'] = "raspberry pi xbmc cable";
hosts['80:1f:02:9b:ad:2b'] = "raspberry pi xbmc wifi";
hosts['d4:3d:7e:7d:2d:05'] = "PC fixe Sylvie";
hosts['00:19:df:95:a8:57'] = "STB tele salon";
hosts['00:19:db:9e:bc:26'] = "Nabaztag";
hosts['04:1e:64:79:0c:c1'] = "Iphone 3GS salle de bain";
hosts['5c:0a:5b:93:80:99'] = "Telephone Samsung Sylvie";
hosts['3c:8b:fe:41:15:07'] = "Tablette Galaxy tab gabriel";
hosts['d8:a2:5e:05:71:41'] = "IPAD Benjamin";
hosts['38:e7:d8:dc:0b:6c'] = "TEL Linda";
hosts['5c:0a:5b:37:dd:1f'] = "TEL Benjamin";
hosts['b8:27:eb:e6:66:95'] = "raspberry pi test cable";
hosts['a def3           '] = "raspberry pi test wifi";
hosts['f4:81:39:18:9a:44'] = "imprimante CANON MG5350 Wifi";
hosts['2c:39:96:52:63:61'] = "STB sensation";

var UrlModem="";
//
// function : CRON
//
exports.cron = function(callback, task, SARAH){
  
  //console.log("Process CRON : ");
  
  		
  setTimeout((function() {
	infos(task);
	}), 1000);
	
	callback({'tts': ""});
}

var dataInfos;

//
// function : info
//
var infos = function (config) {
	
	console.log(" -> BboxTV : Data info");

	var result=quiEstLaBbox(config);

	

	
};

exports.infos = infos;


// Paramètre de configuration des requêtes SNMP 
var snmp = require ("./lib/net-snmp");
	var snmpOptions = {
	    port: 161,
	    retries: 1,
	    timeout: 5000,
	    transport: "udp4",
	    trapPort: 162,
	    version: snmp.Version1
	};


var sarahLocal;
exports.init = function (config, SARAH){
	
  	
}


//
// function :  sleep 
//
// Attends un nombre de miliseconde avant de rendre la main
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// 
// function : sendOrder 
// 
// Envois les ordres en SNMP a la BBOX sensation
var sendOrder = function(ordres) { 
	var i = 0;
	var j= 0 ;
	var varbinds= new Array();

	 if (ordres.length === 0) {
	 	return
	 }		

	 while(i< ordres.length) {
	 	//console.log("sendOrder " + ordres[i]);
		varbinds[j++] =
		    {
		        oid: "1.3.6.1.4.1.8711.101.13.1.3.28.0",
		        type: snmp.ObjectType.OctetString,
		        value: ordres[i]
		    };    

		i++; 
	}

	session.set (varbinds, function (error, varbinds) {
	    if (error) {
	        console.error ("bboxTV (snmp ):" + error.toString ());
	        sarahLocal.speak("La bibox ne répond pas, êtes vous sure qu'elle est branché ?");

	    } else {
	        console.log ("message snmp envoyé");
	        
	    }
	});

}



//
// function :  action
//
exports.action = function(data, callback, config, SARAH){
	var ordre = new Array();
	sarahLocal = SARAH;
	// initialise le mobude SNMP.
	configOrig = config;
	config = config.modules.bboxTV;
	// je suis obliger de tricher car le task de la crontab ne permet pas de recuperer les parametres
  	UrlModem = config.url_modem;

  	if (!config.adress_ip_stb){
    	callback({ 'tts': 'Vous devez configurer le plugin bboxTV avec le adresse I.P du décodeur Bbox Sensation' });
    	console.log('Vous devez configurer le plugin bboxTV avec le adresse I.P du décodeur Bbox Sensation');
    	return;
  	}
  	else {
	  session = snmp.createSession (config.adress_ip_stb, "public", snmpOptions);
	}

	// Si aucune "key" n'est passée, ça veut dire qu'on n'a pas reçu d'ordre
	if (!data.key){
	    callback({ 'tts': 'Aucun ordre' });
	    return;
	}
	console.log("key"+data.key);

	if (data.key == "bboxIP") {
		callback(quiEstLaBbox(config));
		return;
	}
	if (data.key == "config") {
		chaine = quiEstLaBbox(configOrig);

		callback({ 'tts': chaine });
		return;
	}
	// Si chaine et inferieur a 3 cela veux dire que c une chaine si egal 4 action telecommande
   	var lenKey = data.key.length ;

   	if (lenKey == 4) {
		//-----	
		// Code de Pascal Linssen
		// pharse aléatoire pour la réponces  a la commande vocale
		var phrase_success = new Array();
		    phrase_success[1] = ' Si tu veux !';
		    phrase_success[2] = ' Comme tu la demander !';
		    phrase_success[3] = ' Avec plaisir !';
			phrase_success[4] = ' Daccor !';
			phrase_success[5] = ' Je le fais de suite !';
		random = Math.floor((Math.random()*(phrase_success.length-1))+1);
		phrase_select = phrase_success[random]; 		


		// recherche la 1ere valeur != 0
		var i = 1;
		var flagZero = 0;
		var tmp ="";
		while (i < lenKey) {
			if (data.key[i] == "O") {
				i++;
				continue;
			}
			if (data.key[i] == "0" && flagZero == 0) {
				i++;
				continue;
			}
			flagZero=1;
			tmp = tmp + data.key[i];
			i++;
		}

		ordre[0] = tmp;
		sendOrder(ordre);

		// Code de Pascal Linssen
		// pharse aleratoire
		callback({'tts': phrase_select});

		return;
	} 
	
	// Mis en forme pour le touche
	// tableau pour les touche 0-9
	var myChain=new Array("59","50","51","52","53","54","55","56","57","58");

	var i = 0;
	while (i< lenKey){
		ordre[i] = myChain[data.key.substring(i,i+1)];
		console.log("ordre[i] " + ordre[i]);
		i++;
	}
	sendOrder(ordre);

	callback({'tts': data.key})

}



// appel manuel par : http://127.0.0.1:8080/sarah/quiEstLaBbox/
//
// function  : quiEstLaBbox
//
quiEstLaBbox = function(config){


	if (!UrlModem) {
		return("<br/><strong>Paramètre invalide : l'url du Modem n'est pas définie</strong><br/>"); 
	}

	url = UrlModem;
	sendURL(url, function(body){

		var reIP = new RegExp('var listParamLANHostConf.*', 'g'); 
		// recherche de la variable : var listParamLANHostConf 
		tmp  = reIP.exec(body );

		// traitement d'erreur si la page ne contient pas la chaine recherché
		if (tmp !== null) {
			bodyIP = tmp[0];
		}
		else {  
			return('parse error dans la recherche des IP connecté sur réseau géré par la BBOX');
		}

		// recherche des equipement qui on une IP 
		bodyIP = bodyIP.replace('var listParamLANHostConf = eval(\'(','');  
		bodyIP = bodyIP.replace(')\');','');

		if ( CheckJson(bodyIP)=== false) {
        	return("parse error dans la recherche des IP connecté sur réseau géré par la BBOX");
        }
		// parse le json
		var json = JSON.parse(bodyIP);
		console.log('--------------------------------------------');
		//console.log('JSON', json);

		var resultat="";
		var util = require('util');

		for (var line  in json) {
			if (line !="Count") {
				
				if (json[line].Active == "1") {
 
					resultat = resultat + util.format('%s\t[%s]\t[%s]\t%s\t[%s]\t[%s]=> ',
						json[line].IPAddress,
						json[line].MACAddress,
						json[line].Hostname,
						json[line].LeaseRemaining,
						json[line].AddressingType,
						json[line].InterfaceType);
					try {
						resultat = resultat +"\t"+hosts[json[line].MACAddress]+".\n";
					}
					catch(e) {
						resultat = resultat + "\n";
					}
				}
			}
		}

		console.log(resultat);

		// recherche de l'IP de la SetUpBox en recherchant l'object JSON : ManageableDevices
		var reSTB = new RegExp('var ManageableDevices.*', 'g'); 
		// recherche de la variable : var listParamLANHostConf 
		tmp  = reSTB.exec(body );

		// traitement d'erreur si la page ne contient pas la chaine recherché
		if (tmp !== null) {
			bodySTB = tmp[0];
		}
		else {  
			return("parse error dans la recherche des IP connecté sur réseau géré par la BBOX");
		}

		bodySTB = bodySTB.replace('var ManageableDevices = ','');  
		bodySTB = bodySTB.replace(';','');  
		console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		console.log (bodySTB);

        if ( CheckJson(bodySTB)=== false) {
        	return("parse error dans la recherche des IP connecté sur réseau géré par la BBOX")
        	
        }
		var json1 = JSON.parse(bodySTB);

		//"MACAddress" : "2c:39:96:52:63:61","IPAddress" : "192.168.1.98"		
		resultat = resultat + "\n\n["+ json1.Device[1].MACAddress +"] =>";
		resultat = resultat + json1.Device[1].IPAddress;

		resultatHTML = resultat.replace(/\n/g,"<BR/>");
		console.log(resultat);

		// sauvegarde dans le fichier de resultat
		var fs = require('fs');
		var file = 'plugins/bboxTV/ListeIp.html';
		fs.writeFileSync(file, resultatHTML, { encoding: 'utf8', flag: 'w'});
		return;
		
	});

	
		
}

var request = require('request');

//
// function : sendURL
//
var sendURL = function(url, cb) {
	// le user-agent est nécessaire, sinon le 1er appel fonctionne mais pas les autre request ne se termine jamais
	// Merci JP Encausse.
	request.post({uri : url, 
			  headers: {
        			'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
        		}
    }, function (err, response, body){
		if (err ||response.statusCode != 200) {
			console.log("bboxTV : sendURL  -> L'action a échoué");
			return;
		}
		
		cb(body);
		
	});

}

//
// function : CheckMACAddress
//
function CheckMACAddress(macAddr) {
    var regExpIP = new RegExp("^([0-9a-f]{2}([:-]|$)){6}$");
    if (!regExpIP.test(macAddr)) return false;
    
	return true;
}

//
// function : CheckJson
//
function CheckJson(jsonString) {
	return( !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(jsonString.replace(/"(\\.|[^"\\])*"/g, ''))) && 
		eval('(' + jsonString + ')'));
}
        