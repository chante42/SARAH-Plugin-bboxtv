
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



exports.init = function (config, SARAH){
	
}


//
// sleep 
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
	 	console.log("sendOrder " + ordres[i]);
		varbinds[j++] =
		    {
		        oid: "1.3.6.1.4.1.8711.101.13.1.3.28.0",
		        type: snmp.ObjectType.OctetString,
		        value: ordres[i]
		    };    

		// pour essayer d'améliorer  les suite d'ordre pour les chaine > 10
		//varbinds[j++] =
		//    {
		//        oid: "1.3.6.1.4.1.8711.101.13.1.3.28.0",
		//        type: snmp.ObjectType.OctetString,
		//        value: "1"
		//    };    

		i++; 
	}

	session.set (varbinds, function (error, varbinds) {
	    if (error) {
	        console.error ("snmp" + error.toString ());
	    } else {
	        console.log ("message snmp envoyé");
	        
	    }
	});

}

exports.action = function(data, callback, config, SARAH){
	var ordre = new Array();

	// initialise le mobude SNMP.
	config = config.modules.bboxTV;
  	if (!config.adress_ip){
    	callback({ 'tts': 'Vous devez configurer le plugin bboxTV avec le adresse I.P du décodeur Bbox Sensation' });
    	console.log('Vous devez configurer le plugin bboxTV avec le adresse I.P du décodeur Bbox Sensation');
    	return;
  	}
  	else {
	  session = snmp.createSession (config.adress_ip, "public", snmpOptions);
	}

	// Si aucune "key" n'est passée, ça veut dire qu'on n'a pas reçu d'ordre
	if (!data.key){
	    callback({ 'tts': 'Aucun ordre' });
	    return;
	}
	console.log("key"+data.key);

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


