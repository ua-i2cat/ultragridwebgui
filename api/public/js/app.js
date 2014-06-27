$( function() {	

	// globals
	var controlPort = "5054";
	var videoInput;
	var videoMode;
	var videoFEC;
	var videoIP = "127.0.0.1";
	var videoRxPort = "5004";
	var videoTxPort = "5004";
	var videoCMD = "";
	var audioInput;
	var audioMode;
	var audioFEC;
	var audioIP = "127.0.0.1";
	var audioRxPort = "5006";
	var audioTxPort = "5006";
	var audioCMD = "";
	var cmnd = "";
	var statsInterval;
	var statsRefreshInterval = 1000; //1 second
	var state;
	
	//startup
	$(document).ready(function() {
		//get current state
		$.ajax({
			type : 'GET',
			url : "/ultragrid/gui/state",
			async : false,
			success: function(msg){
				console.log(msg);
				state = msg;
				if(state.port == 0){
					$('#configurationRow').removeClass('is-enabled');
					$('#configurationRow').addClass('is-disabled');
					$('#reset_button').removeClass('is-enabled');
					$('#reset_button').addClass('is-disabled');
					$('#setcontrol_button').show();
					$('#setcontrol_input').show();
					$('#setcontrol_label').show();
				} else {
					$('#configurationRow').removeClass('is-disabled');
					$('#configurationRow').addClass('is-enabled');
					$('#reset_button').removeClass('is-disabled');
					$('#reset_button').addClass('is-enabled');
					$('#setcontrol_button').hide();
					$('#setcontrol_input').hide();
					$('#setcontrol_label').hide();
				}
				process_state();
			},
			error: function(xhr, msg) { 
				console.log('ERROR: '+msg + '\n' + xhr.responseText);
			}
		});
	});
	//First configuration requirement
	$("#setcontrol_button").click(
		function() {
			if(!$('#setcontrol_input').val() == '') controlPort = $('#setcontrol_input').val();
			$.ajax({
				type : 'POST',
				url : "/ultragrid/gui/set_controlport",
				data : "port="+controlPort,
				async : false,
				success: function(msg){
					console.log(msg);
					state = msg;
					process_state();
				},
				error: function(xhr, msg) { 
					console.log('ERROR: '+msg + '\n' + xhr.responseText);
				}
			});
			location.reload();
	});
	/**
	 * LOCAL CHECK
	 */
	$("#localCheckButton").click(
		function() {
			if(!$('#enable_video').is(':checked') && !$('#enable_audio').is(':checked')){
				alert("Please, at least select one media type.");
			}
			// video inputs
			if ($('#enable_video').is(':checked')) {
				videoInput = $('#cd-dropdown-video-input')
						.find(":selected").text();
				set_video_mode();
				set_video_fec();
				
				create_video_cmd();
			}
			// audio inputs
			if ($('#enable_audio').is(':checked')) {
				audioInput = $('#cd-dropdown-audio-input')
						.find(":selected").text();
				set_audio_mode();
				set_audio_fec();
				
				create_audio_cmd();
			}
			
			process_config();
	});
	
	function create_video_cmd(){
		if(videoInput == "undefined" || (videoInput != "v4l2" && videoMode == "undefined") || videoFEC == "undefined"){
			alert("Undefined parameters are not allowed");
		}
		if(!$('#videoIP').val() == '') videoIP = $('#videoIP').val();
		if(!$('#videoRxPort').val() == '') videoRxPort = $('#videoRxPort').val();
		if(!$('#videoTxPort').val() == '') videoTxPort = $('#videoTxPort').val();
		
		videoCMD = "-t "+videoInput+""+videoMode+" "+videoFEC;	
	}
	function create_audio_cmd(){
		if(audioInput == "undefined" || audioMode == "undefined" || audioFEC == "undefined"){
			alert("Undefined parameters are not allowed");
		}
		if(!$('#audioIP').val() == '') audioIP = $('#audioIP').val();
		if(!$('#audioRxPort').val() == '') audioRxPort = $('#audioRxPort').val();
		if(!$('#audioTxPort').val() == '') audioTxPort = $('#audioTxPort').val();
		
		audioCMD = "-s "+audioInput+" "+audioMode+" "+audioFEC;	
	}
	
	function process_config(){
		if($('#enable_video').is(':checked') && $('#enable_audio').is(':checked')){
			cmnd = "uv --control-port "+state.port+" "+videoCMD+" "+audioCMD+" "+videoIP+" -A "+audioIP+" -P"+videoRxPort+":"+videoTxPort+":"+audioRxPort+":"+audioTxPort;
			console.log("AV COMMAND: "+cmnd);
		} else if($('#enable_video').is(':checked') && !$('#enable_audio').is(':checked')){
			cmnd = "uv --control-port "+state.port+" "+videoCMD+" "+videoIP+" -P"+videoRxPort+":"+videoTxPort;
			console.log("V COMMAND: "+cmnd);
		} else if(!$('#enable_video').is(':checked') && $('#enable_audio').is(':checked')){
			cmnd = "uv --control-port "+state.port+" "+audioCMD+" "+audioIP+" -P"+videoRxPort+":"+videoTxPort+":"+audioRxPort+":"+audioTxPort;
			console.log("A COMMAND: "+cmnd);
		} else {
			alert("ERROR: unable to set configuration. Please, check parameters.");
		}

		$.ajax({
			type : 'POST',
			url : "/ultragrid/gui/check",
			data : "mode=local&cmd="+cmnd,
			async : false,
			success: function(msg){
				console.log(msg);
				state = msg;
				process_state();
			},
			error: function(xhr, msg) { 
				console.log('ERROR: '+msg + '\n' + xhr.responseText);
			}
		});
	}
	
	//VIDEO SETTINGS
	function set_video_mode(){
		if(videoInput === 'decklink'){
			switch($('#cd-dropdown-video-mode').find(":selected").text()){
				case "1080i 50":
					videoMode = ":0:8 -c libavcodec:codec=H.264";
					break;
				case "720p 50":
					videoMode = ":0:11 -c libavcodec:codec=H.264";
					break;
				case "1080p 25":
					videoMode = ":0:5 -c libavcodec:codec=H.264";
					break;
				default:
					alert("Error when setting video mode, please check configuration.");
					break;
			}
		} else if (videoInput === 'testcard'){
			switch($('#cd-dropdown-video-mode').find(":selected").text()){
				case "1080i 50":
					videoMode = ":1920:1080:25:UYVY -c libavcodec:codec=H.264";
					break;
				case "720p 50":
					videoMode = ":1280:720:25:UYVY -c libavcodec:codec=H.264";
					break;
				case "1080p 25":
					videoMode = ":1920:1080:25:UYVY -c libavcodec:codec=H.264";
					break;
				default:
					alert("Error when setting video mode, please check configuration.");
					break;
			}
		}  else if (videoInput === 'v4l2'){
			videoMode = " -c libavcodec:codec=H.264";
		} else {
			alert("Error when processing selected video input. Please, check configuration.");
		}
	}
	
	function set_video_fec(){
		switch($('#cd-dropdown-video-fec').find(":selected").text()){
			case "ON":
				videoFEC = "-f V:ldgm:1024:192:5"
				break;
			case "OFF":
				videoFEC = "-f none"
				break;
			default:
				alert("Error when setting video FEC. Please, check configuration.");
				break;
		}
	}
	//AUDIO SETTINGS
	function set_audio_mode(){
		switch($('#cd-dropdown-audio-mode').find(":selected").text()){
			case "48kHz 2ch. (PCM)":
				audioMode = "--audio-capture-channels 2";
				break;
			case "8kHz 1ch. (PCM)":
				audioMode = "--audio-codec PCM:8000 --audio-capture-channels 1";
				break;
			case "48kHz 2ch. (codec: OPUS)":
				audioMode = "--audio-codec OPUS:48000 --audio-capture-channels 2";
				break;
			case "8kHz 1ch. (codec: OPUS)":
				audioMode = "--audio-codec OPUS:8000 --audio-capture-channels 1";
				break;
			default:
				alert("Error when setting audio mode, please check configuration.");
				break;
		}
	}
	
	function set_audio_fec(){
		switch($('#cd-dropdown-audio-fec').find(":selected").text()){
			case "ON":
				audioFEC = "-f A:mult:3"
				break;
			case "OFF":
				audioFEC = "-f none"
				break;
			default:
				alert("Error when setting audio FEC. Please, check configuration.");
				break;
		}
	}
	//END LOCAL CHECK
	
	
	
	/**
	 * REMOTE CHECK
	 */
	$("#connectivityCheckButton").click(
		function() {
			$.ajax({
				type : 'POST',
				url : "/ultragrid/gui/check",
				data : "mode=remote&cmd="+cmnd,
				async : false,
				success: function(msg){
					console.log(msg);
					state = msg;
					process_state();
				},
				error: function(xhr, msg) { 
					console.log('ERROR: '+msg + '\n' + xhr.responseText);
				}
			});
	});
	//END REMOTE CHECK
	
	/**
	 * START/STOP, PLAY/PAUSE & RESET
	 */
	$("#play_button").click(
		function() {
			var uri = "";
			if(state.uv_play == true) uri = "/ultragrid/gui/pause";
			else  uri = "/ultragrid/gui/play";
			$.ajax({
				type : 'GET',
				url : uri,
				async : false,
				success: function(msg){
					console.log(msg);
					state = msg;
					process_state();
				},
				error: function(xhr, msg) { 
					console.log('ERROR: '+msg + '\n' + xhr.responseText);
				}
			});
	});
	$("#start_button").click(
		function() {
			var uri = "";
			if(state.uv_running == true) uri = "/ultragrid/gui/stop";
			else  uri = "/ultragrid/gui/start";
			$.ajax({
				type : 'GET',
				url : uri,
				async : false,
				success: function(msg){
					console.log(msg);
					state = msg;
					process_state();
				},
				error: function(xhr, msg) { 
					console.log('ERROR: '+msg + '\n' + xhr.responseText);
				}
			});
	});
	$("#reset_button").click(
		function() {
			$.ajax({
				type : 'GET',
				url : "/ultragrid/gui/reset",
				async : false,
				success: function(msg){
					console.log(msg);
					state = msg;
					process_state();
				},
				error: function(xhr, msg) { 
					console.log('ERROR: '+msg + '\n' + xhr.responseText);
				}
			});
			location.reload();
	});
	
	//SET WEBAPP STATE
	function process_state(){
		$('#play_button').hide();
		$('#start_button').hide();
		$('#connectivityCheckButton').addClass('is-disabled');
		$('#videoParams').addClass('is-disabled');
		$('#realtimeFeedback').addClass('is-disabled');
		
		if(state.uv_play == true){
			$('#play_button').removeClass('btn-success');
			$('#play_button').addClass('btn-warning');
			$('#play_button').html('<span class="glyphicon glyphicon-pause">  Pause');
		} else {
			$('#play_button').removeClass('btn-warning');
			$('#play_button').addClass('btn-success');
			$('#play_button').html('<span class="glyphicon glyphicon-play"> Play');
		}
		
		if(state.uv_running == true){
			$('#start_button').removeClass('btn-primary');
			$('#start_button').addClass('btn-danger');
			$('#start_button').html('<span class="glyphicon glyphicon-stop">  Stop');
		} else {
			$('#start_button').removeClass('btn-danger');
			$('#start_button').addClass('btn-primary');
			$('#start_button').html('<span class="glyphicon glyphicon-off"> Start');
		}
		
		if(state.checked_local == false && state.uv_params != ""){
			$('#localCheckButtonSuccess').removeClass('glyphicon-question-sign');
			$('#localCheckButtonSuccess').removeClass('glyphicon-ok-circle');
			$('#localCheckButtonSuccess').addClass('glyphicon-remove-circle');
			$('#connectivityCheckButton').removeClass('is-enabled');
			$('#connectivityCheckButton').addClass('is-disabled');
		}
		if(state.checked_local == true && state.uv_params != ""){
			$('#localCheckButtonSuccess').removeClass('glyphicon-question-sign');
			$('#localCheckButtonSuccess').removeClass('glyphicon-remove-circle');
			$('#localCheckButtonSuccess').addClass('glyphicon-ok-circle');
			$('#connectivityCheckButton').removeClass('is-disabled');
			$('#connectivityCheckButton').addClass('is-enabled');
			$('#localCheckButton').removeClass('is-enabled');
			$('#localCheckButton').addClass('is-disabled');
			$('#videoConfig').removeClass('is-enabled');
			$('#audioConfig').removeClass('is-enabled');
			$('#videoConfig').addClass('is-disabled');
			$('#audioConfig').addClass('is-disabled');
		}
		if(state.checked_local == true && state.checked_remote == false && state.uv_params != ""){
			$('#connectivityCheckButtonSuccess').removeClass('glyphicon-question-sign');
			$('#connectivityCheckButtonSuccess').removeClass('glyphicon-ok-circle');
			$('#connectivityCheckButtonSuccess').addClass('glyphicon-remove-circle');
		}
		if(state.checked_local == true && state.checked_remote == true && state.uv_params != ""){
			$('#connectivityCheckButtonSuccess').removeClass('glyphicon-question-sign');
			$('#connectivityCheckButtonSuccess').removeClass('glyphicon-remove-circle');
			$('#connectivityCheckButtonSuccess').addClass('glyphicon-ok-circle');
			$('#connectivityCheckButton').removeClass('is-enabled');
			$('#connectivityCheckButton').addClass('is-disabled');
			$('#start_button').show();
		}
		
		if(state.uv_running == false){
			$('#play_button').hide();
			$('#reset_button').show();
			$('#videoParams').removeClass('is-enabled');
			$('#realtimeFeedback').removeClass('is-enabled');
			$('#videoParams').addClass('is-disabled');
			$('#realtimeFeedback').addClass('is-disabled');
			clearInterval(statsInterval);
		}else{
			$('#play_button').show();
			$('#reset_button').hide();
			$('#videoParams').removeClass('is-disabled');
			$('#realtimeFeedback').removeClass('is-disabled');
			$('#videoParams').addClass('is-enabled');
			$('#realtimeFeedback').addClass('is-enabled');
			stateInterval = setInterval(function() {
				get_statistics();
			}, statsRefreshInterval);
		}
	}
	
	//STATS
		//REST
	function get_statistics(){
		$.ajax({
			type : 'GET',
			url : "/ultragrid/gui/statistics",
			async : true,
			success: function(msg){
				console.log(msg);
				state = msg;
				set_statistics();
			},
			error: function(xhr, msg) { 
				console.log('ERROR: '+msg + '\n' + xhr.responseText);
			}
		});
	}
	
	function set_statistics(){
		$('#ovres').html('<span id="ovres" class="label label-default col-lg-4"style="margin-left: 30px; font-size: 14px;">'+state.o_size+'</span>&nbsppixel');
		$('#ovfps').html('<span id="ovfps" class="label label-default col-lg-4" style="margin-left: 30px; font-size: 14px;">'+toFixedPrecision(state.o_fps,2)+'</span> &nbspfps');
		$('#ovbr').html('<span id="ovbr" class="label label-default col-lg-4" style="margin-left: 30px; font-size: 14px;">'+toFixedPrecision(state.o_br,3) * ((state.uv_params.indexOf("-f none") > -1) ? 1 : 1.3)+'</span> &nbspkbps');
	}
	
		//WEBSOCKET
	
	
	
	
	//UTILS
	function toFixedPrecision(value, precision) {
	    var power = Math.pow(10, precision || 0);
	    return (Math.round(value * power) / power).toFixed(precision);
	}
});


/*
 * localCheckButtonSuccess
 * connectivityCheckButtonSuccess
 * 
 * glyphicons:
 * 
 * glyphicon-question-sign - not set
 * glyphicon-remove-circle - error
 * glyphicon-ok-circle	   - ok	
 */
