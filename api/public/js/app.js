$( function() {	

	// globals
	var videoInput;
	var videoMode;
	var videoFEC;
	var videoIP = "127.0.0.1";
	var videoPort = "5004";
	var videoCMD = "";
	var audioInput;
	var audioMode;
	var audioFEC;
	var audioIP = "127.0.0.1";
	var audioPort = "5006";
	var audioCMD = "";
	var cmnd = "";
	
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
		if(videoInput == "undefined" || videoMode == "undefined" || videoFEC == "undefined"){
			alert("Undefined parameters are not allowed");
		}
		if(!$('#videoIP').val() == '') videoIP = $('#videoIP').val();
		if(!$('#videoPort').val() == '') videoPort = $('#videoPort').val();
		
		videoCMD = "-t "+videoInput+":"+videoMode+" "+videoFEC;	
		console.log(videoCMD);

	}
	function create_audio_cmd(){
		if(audioInput == "undefined" || audioMode == "undefined" || audioFEC == "undefined"){
			alert("Undefined parameters are not allowed");
		}
		if(!$('#audioIP').val() == '') audioIP = $('#audioIP').val();
		if(!$('#audioPort').val() == '') audioPort = $('#audioPort').val();
		
		audioCMD = "-s "+audioInput+" "+audioMode+" "+audioFEC;	
		console.log(audioCMD);
	}
	
	function process_config(){
		if($('#enable_video').is(':checked') && $('#enable_audio').is(':checked')){
			cmnd = "uv "+videoCMD+" "+audioCMD+" "+videoIP+" -A "+audioIP+" -P"+videoPort+":"+videoPort+":"+audioPort+":"+audioPort;
			console.log("AV COMMAND: "+cmnd);
		} else if($('#enable_video').is(':checked') && !$('#enable_audio').is(':checked')){
			cmnd = "uv "+videoCMD+" "+videoIP+" -P"+videoPort;
			console.log("V COMMAND: "+cmnd);
		} else if(!$('#enable_video').is(':checked') && $('#enable_audio').is(':checked')){
			cmnd = "uv "+audioCMD+" "+audioIP+" -P"+videoPort+":"+videoPort+":"+audioPort+":"+audioPort;
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
//				if(!msg){
//					$("#loading").hide();
//					$("#msg").show();
//				}
//				else if(msg.msg == "1"){
//					location.href = "/AppServer/#/adminOverview";
//					loginUser = msg.userId;
//					loginOrg = msg.orgId;
//					loginOrgName = msg.orgName;
//					loginUserName = msg.userName;
//				} 
//				else if(msg.msg == "2") {
//					location.href = "/AppServer/#/clientOverview/"+msg.orgId;
//					loginUser = msg.userId;
//					loginOrg = msg.orgId;
//					loginOrgName = msg.orgName;
//					loginUserName = msg.userName;
//				} 
			},
			error: function(xhr, msg) { 
				console.log(msg + '\n' + xhr.responseText);
//				if(!xhr.responseText){
//					$("#loading").hide();
//					$("#msg").show();
//				}
//				else if(xhr.responseText.msg == "1"){
//					location.href = "/AppServer/#/adminOverview";
//					loginUser = xhr.responseText.userId;
//					loginOrg = xhr.responseText.orgId;
//					loginOrgName = xhr.responseText.orgName;
//					loginUserName = xhr.responseText.userName;
//				} 
//				else if(xhr.responseText.msg == "2"){
//					location.href = "/AppServer/#/clientOverview/"+xhr.responseText.orgId;
//					loginUser = xhr.responseText.userId;
//					loginOrg = xhr.responseText.orgId;
//					loginOrgName = xhr.responseText.orgName;
//					loginUserName = xhr.responseText.userName;
//				} 
			}
		});
	}
	
	//VIDEO SETTINGS
	function set_video_mode(){
		if(videoInput === 'decklink'){
			switch($('#cd-dropdown-video-mode').find(":selected").text()){
				case "1080i 50":
					videoMode = "0:8 -c libavcodec:codec=H.264";
					break;
				case "720p 50":
					videoMode = "0:11 -c libavcodec:codec=H.264";
					break;
				case "1080p 25":
					videoMode = "0:5 -c libavcodec:codec=H.264";
					break;
				default:
					alert("Error when setting video mode, please check configuration.");
					break;
			}
		} else if (videoInput === 'testcard'){
			switch($('#cd-dropdown-video-mode').find(":selected").text()){
				case "1080i 50":
					videoMode = "1920:1080:50:UYVY -c libavcodec:codec=H.264";
					break;
				case "720p 50":
					videoMode = "1280:720:50:UYVY -c libavcodec:codec=H.264";
					break;
				case "1080p 25":
					videoMode = "1920:1080:25:UYVY -c libavcodec:codec=H.264";
					break;
				default:
					alert("Error when setting video mode, please check configuration.");
					break;
			}
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
//						if(!msg){
//							$("#loading").hide();
//							$("#msg").show();
//						}
//						else if(msg.msg == "1"){
//							location.href = "/AppServer/#/adminOverview";
//							loginUser = msg.userId;
//							loginOrg = msg.orgId;
//							loginOrgName = msg.orgName;
//							loginUserName = msg.userName;
//						} 
//						else if(msg.msg == "2") {
//							location.href = "/AppServer/#/clientOverview/"+msg.orgId;
//							loginUser = msg.userId;
//							loginOrg = msg.orgId;
//							loginOrgName = msg.orgName;
//							loginUserName = msg.userName;
//						} 
				},
				error: function(xhr, msg) { 
					console.log(msg + '\n' + xhr.responseText);
//						if(!xhr.responseText){
//							$("#loading").hide();
//							$("#msg").show();
//						}
//						else if(xhr.responseText.msg == "1"){
//							location.href = "/AppServer/#/adminOverview";
//							loginUser = xhr.responseText.userId;
//							loginOrg = xhr.responseText.orgId;
//							loginOrgName = xhr.responseText.orgName;
//							loginUserName = xhr.responseText.userName;
//						} 
//						else if(xhr.responseText.msg == "2"){
//							location.href = "/AppServer/#/clientOverview/"+xhr.responseText.orgId;
//							loginUser = xhr.responseText.userId;
//							loginOrg = xhr.responseText.orgId;
//							loginOrgName = xhr.responseText.orgName;
//							loginUserName = xhr.responseText.userName;
//						} 
				}
			});
	});
	//END REMOTE CHECK

});
