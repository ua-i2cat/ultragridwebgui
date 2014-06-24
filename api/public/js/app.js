//globals
var destinationIP;
var destinationPORT;
var source;
var vinput;
var vmode;
var vfec;
var ainput;
var amode;
var afec;
var localCheck = false;
var connectivity = false;
var transmission = false;
var videoResolution_O;
var videoFPS_O;
var videoBPS_O;
var videoResolution_C;
var videoFPS_C;
var videoBPS_C;
var videoResolution_A;
var videoFPS_A;
var videoBPS_A;

//startup
$(document).ready(function(){
	hideAll();
});
	
function hideAll(){
	hideSourceConfig();
}

function hideSourceConfig(){
	$('#videoConfig').hide();
	$('#audioConfig').hide();
	$('#inputCol').hide();
	$('#modeCol').hide();
	$('#fecCol').hide();
	$('#localCheck').hide();
	$('#connectivityCheck').hide();
	$('#transmissionSetter').hide();
	$('#videoParams').hide();
	$('#audioParams').hide();
	$('#localCheckButtonSuccess').hide();
	$('#connectivityCheckButtonSuccess').hide();
	$('#transmissionSetterButtonSuccess').hide();
	
}
function resetVariables(){
	vinput=false;
	vmode=false;
	vfec=false;
	ainput=false;
	amode=false;
	afec=false;
	$('#videoInput').html('Input <span class="caret">');
	$('#videoInputMode').html('Mode <span class="caret">');
	$('#videoInputFEC').html('FEC <span class="caret">');
	$('#audioInput').html('Input <span class="caret">');
	$('#audioInputMode').html('Mode <span class="caret">');
	$('#audioInputFEC').html('FEC <span class="caret">');
}

function globalListener(){
	//"listen" to start local check
	switch(source){
		case "video":
			if(vinput==true && vmode==true && vfec==true){
				$('#localCheck').show();
			}else{
				$('#localCheck').hide();
				localCheck = false;
				connectivity = false;
				transmission = false;
			}
			break;
		case "audio":
			if(ainput==true && amode==true && afec==true){
				$('#localCheck').show();			
			}else{
				$('#localCheck').hide();
				localCheck = false;
				connectivity = false;
				transmission = false;
			}
			break;
		case "both":
			if(vinput==true && vmode==true && vfec==true && ainput==true && amode==true && afec==true){
				$('#localCheck').show();			
			}else{
				$('#localCheck').hide();
				localCheck = false;
				transmission = false;
				connectivity = false;
			}
			break;
		default:
			$('#localCheck').hide();
			localCheck = false;
			transmission = false;
			connectivity = false;	
	}
	
	if(localCheck){
		$('#localCheckButtonSuccess').show();
		$('#connectivityCheck').show();
	} 
	else{
		$('#localCheckButtonSuccess').hide();
		$('#connectivityCheckButtonSuccess').hide();
		$('#connectivityCheck').hide();
		$('#transmissionSetter').hide();
	}
	
	if(connectivity){
		$('#connectivityCheckButtonSuccess').show();
		$('#transmissionSetter').show();
	}
	else{
		$('#connectivityCheckButtonSuccess').hide();
		$('#transmissionSetter').hide();
	}
	
	if(transmission){
		$('#transmissionSetterButtonSuccess').show();
	}
	else{
		$('#transmissionSetterButtonSuccess').hide();
	}

}

//source selector
$('a[id^="source_video"]').click(function(e) {  
	resetVariables();     
	$('#inputCol').show();
	$('#modeCol').show();
	$('#fecCol').show();
	$('#videoConfig').hide();
	$('#audioConfig').hide();
	$('#source').html("Video");
	$('#videoConfig').show();
	$('#videoParams').show();
	$('#audioParams').hide();
	source = "video";
	globalListener()
    e.preventDefault();
});
$('a[id^="source_audio"]').click(function(e) {  
	resetVariables();     
	$('#inputCol').show();
	$('#modeCol').show();
	$('#fecCol').show();
	$('#videoConfig').hide();
	$('#audioConfig').hide();
	$('#source').html("Audio");
	$('#audioConfig').show();
	$('#audioParams').show();
	$('#videoParams').hide();
	$('#dividerAV').hide();
	source = "audio";
	globalListener()
   	e.preventDefault();
});
$('a[id^="both"]').click(function(e) {
	resetVariables();       
	$('#inputCol').show();
	$('#modeCol').show();
	$('#fecCol').show();
	$('#videoConfig').hide();
	$('#audioConfig').hide();
	$('#source').html("Both");
	$('#videoConfig').show();
	$('#audioConfig').show();
	$('#videoParams').show();
	$('#audioParams').show();
	$('#dividerAV').show();
	source = "both";
	globalListener()
    e.preventDefault();
});

//video config selectors
//input selector
$('a[id^="videoInputDecklink"]').click(function(e) {       
	$('#videoInput').html("DeckLink");
	vinput = true;
	globalListener()
    e.preventDefault();
});
$('a[id^="videoInputTestcard"]').click(function(e) {       
	$('#videoInput').html("Testcard");
	vinput = true;
	globalListener()
    e.preventDefault();
});
//mode selector
$('a[id^="videoModeFullHDp"]').click(function(e) {       
	$('#videoInputMode').html("FullHD p");
	vmode = true;
	globalListener()
    e.preventDefault();
});
$('a[id^="videoModeHDp"]').click(function(e) {       
	$('#videoInputMode').html("HD p");
	vmode = true;
	globalListener()
    e.preventDefault();
});
$('a[id^="videoModeFullHDi"]').click(function(e) {       
	$('#videoInputMode').html("FullHD i");
	vmode = true;
	globalListener()
    e.preventDefault();
});
//fec selector
$('a[id^="videoFEC_ON"]').click(function(e) {       
	$('#videoInputFEC').html("ON");
	vfec = true;
	globalListener()
    e.preventDefault();
});
$('a[id^="videoFEC_OFF"]').click(function(e) {       
	$('#videoInputFEC').html("OFF");
	vfec = true;
	globalListener()
    e.preventDefault();
});

//audio config selectors
//input selector
$('a[id^="audioInputEmbedded"]').click(function(e) {       
	$('#audioInput').html("Embedded");
	ainput = true;
	globalListener()
    e.preventDefault();
});
$('a[id^="audioInputAnalog"]').click(function(e) {       
	$('#audioInput').html("Analog");
	ainput = true;
	globalListener()
    e.preventDefault();
});
$('a[id^="audioInputSoundcard"]').click(function(e) {       
	$('#audioInput').html("Soundcard");
	ainput = true;
	globalListener()
    e.preventDefault();
});
//mode selector
$('a[id^="audioModeWBstereo"]').click(function(e) {       
	$('#audioInputMode').html("WB stereo");
	amode = true;
	globalListener()
    e.preventDefault();
});
$('a[id^="audioModeNBmono"]').click(function(e) {       
	$('#audioInputMode').html("NB mono");
	amode = true;
	globalListener()
    e.preventDefault();
});
//fec selector
$('a[id^="audioFEC_ON"]').click(function(e) {       
	$('#audioInputFEC').html("ON");
	afec = true;
	globalListener()
    e.preventDefault();
});
$('a[id^="audioFEC_OFF"]').click(function(e) {       
	$('#audioInputFEC').html("OFF");
	afec = true;
	globalListener()
    e.preventDefault();
});

//LOCAL CHECK
$('button[id^="localCheckButton"]').click(function(e) {
	localCheck |= true;
	globalListener();
});

//CONNECTIVITY CHECK
$('button[id^="connectivityCheckButton"]').click(function(e) { 
	connectivity |= true;
	globalListener();
});

//TRANSMISSION
$('button[id^="transmissionSetterButton"]').click(function(e) { 
	transmission |= true;
	globalListener();
});
	-
	/*-
	-//WEBSOCKET EVENTS
	-//function onOpen(eventObject) {
	-//	console.log("WS open");
	-//}
	-//function onMessage(eventObject) {
	-//	console.log("WS message");
	-//	newMessage = JSON.parse(eventObject.data);
	-//	console.log(newMessage);
	-//}
	-//
	-//function onClose(eventObject) {
	-//	console.log("WS close");
	-//	console.log(eventObject);
	-//}
	-//
	-//function onError(eventObject) {
	-//	console.log("WS error");
	-//	console.log(eventObject);
	-//}
	-//
	-//webSocket = new WebSocket("ws://" + window.location.host
	-//		+ "/app");
	-//webSocket.onopen = onOpen;
	-//webSocket.onmessage = onMessage;
	-//webSocket.onclose = onClose;
	-//webSocket.onerror = onError;
	-//
	-//function sendCustomMessage(message) {
	-//	if (webSocket != null) {
	-//		webSocket.send(message);
	-//	}
	-//}
	-//
	-//function sendMessage() {
	-//	if (webSocket != null) {
	-//		var message = document.getElementById('message').value;
	-//		webSocket.send(message);
	-//	}
	-//}
	*/
