/**
 * render gui by state and statistics
 */
function process_state() {
	$('#play_button').hide();
	$('#start_button').hide();
	$('#connectivityCheckButton').addClass('is-disabled');
	$('#videoParams').addClass('is-disabled');
	$('#realtimeFeedback').addClass('is-disabled');

	if (state.uv_play == true) {
		$('#play_button').removeClass('btn-success');
		$('#play_button').addClass('btn-warning');
		$('#play_button').html(
				'<span class="glyphicon glyphicon-pause">  Pause');
	} else {
		$('#play_button').removeClass('btn-warning');
		$('#play_button').addClass('btn-success');
		$('#play_button').html('<span class="glyphicon glyphicon-play"> Play');
	}

	if (state.uv_running == true) {
		$('#start_button').removeClass('btn-primary');
		$('#start_button').addClass('btn-danger');
		$('#start_button')
				.html('<span class="glyphicon glyphicon-stop">  Stop');
	} else {
		$('#start_button').removeClass('btn-danger');
		$('#start_button').addClass('btn-primary');
		$('#start_button').html('<span class="glyphicon glyphicon-off"> Start');
	}

	if (state.checked_local == false && state.uv_params != "") {
		$('#localCheckButtonSuccess').removeClass('glyphicon-question-sign');
		$('#localCheckButtonSuccess').removeClass('glyphicon-ok-circle');
		$('#localCheckButtonSuccess').addClass('glyphicon-remove-circle');
		$('#localCheckButtonSuccess').css('color', 'red');
		$('#connectivityCheckButton').removeClass('is-enabled');
		$('#connectivityCheckButton').addClass('is-disabled');
	}
	if (state.checked_local == true && state.uv_params != "") {
		$('#localCheckButtonSuccess').removeClass('glyphicon-question-sign');
		$('#localCheckButtonSuccess').removeClass('glyphicon-remove-circle');
		$('#localCheckButtonSuccess').addClass('glyphicon-ok-circle');
		$('#localCheckButtonSuccess').css('color', 'green');
		$('#connectivityCheckButton').removeClass('is-disabled');
		$('#connectivityCheckButton').addClass('is-enabled');
		$('#localCheckButton').removeClass('is-enabled');
		$('#localCheckButton').addClass('is-disabled');
		$('#videoConfig').removeClass('is-enabled');
		$('#audioConfig').removeClass('is-enabled');
		$('#videoConfig').addClass('is-disabled');
		$('#audioConfig').addClass('is-disabled');
	}
	if (state.checked_local == true && state.checked_remote == false
			&& state.uv_params != "") {
		if (state.try_check_remote == true) {
			$('#connectivityCheckButtonSuccess').removeClass(
					'glyphicon-question-sign');
			$('#connectivityCheckButtonSuccess').removeClass(
					'glyphicon-ok-circle');
			$('#connectivityCheckButtonSuccess').addClass(
					'glyphicon-remove-circle');
			$('#connectivityCheckButtonSuccess').css('color', 'red');
		} else {
			$('#connectivityCheckButtonSuccess').removeClass(
					'glyphicon-remove-sign');
			$('#connectivityCheckButtonSuccess').removeClass(
					'glyphicon-ok-circle');
			$('#connectivityCheckButtonSuccess').addClass(
					'glyphicon-question-circle');
			$('#connectivityCheckButtonSuccess').css('color', 'green');
		}
	}
	if (state.checked_local == true && state.checked_remote == true
			&& state.uv_params != "") {
		$('#connectivityCheckButtonSuccess').removeClass(
				'glyphicon-question-sign');
		$('#connectivityCheckButtonSuccess').removeClass(
				'glyphicon-remove-circle');
		$('#connectivityCheckButtonSuccess').addClass('glyphicon-ok-circle');
		$('#connectivityCheckButtonSuccess').css('color', 'green');
		$('#connectivityCheckButton').removeClass('is-enabled');
		$('#connectivityCheckButton').addClass('is-disabled');
		$('#start_button').show();
	}

	if (state.uv_running == false) {
		$('#play_button').hide();
		$('#reset_button').show();
		$('#videoParams').removeClass('is-enabled');
		$('#realtimeFeedback').removeClass('is-enabled');
		$('#videoParams').addClass('is-disabled');
		$('#realtimeFeedback').addClass('is-disabled');
		clearInterval(statsInterval);
	} else {
		$('#play_button').show();
		$('#reset_button').hide();
		$('#videoParams').removeClass('is-disabled');
		$('#realtimeFeedback').removeClass('is-disabled');
		$('#videoParams').addClass('is-enabled');
		$('#realtimeFeedback').addClass('is-enabled');
		statsInterval = setInterval(function() {
			get_statistics();
		}, statsRefreshInterval);
	}
	if (!(state.uv_params.indexOf("-t") > -1)) {
		$('#videoParams_setMode').removeClass('is-enabled');
		$('#videoParams_setParams').removeClass('is-enabled');
		$('#videoParams_setMode').addClass('is-disabled');
		$('#videoParams_setParams').addClass('is-disabled');
	} else {
		$('#videoParams_setMode').removeClass('is-disabled');
		$('#videoParams_setParams').removeClass('is-disabled');
		$('#videoParams_setMode').addClass('is-enabled');
		$('#videoParams_setParams').addClass('is-enabled');
	}
	if (state.uv_vbcc == false) {
		$('#bitrateManual').removeClass('is-disabled');
		$('#framerateManual').removeClass('is-disabled');
		$('#bitrateManual').addClass('is-enabled');
		$('#framerateManual').addClass('is-enabled');
	} else {
		$('#bitrateManual').removeClass('is-enabled');
		$('#framerateManual').removeClass('is-enabled');
		$('#bitrateManual').addClass('is-disabled');
		$('#framerateManual').addClass('is-disabled');
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
	$('#ovres').html('<span id="ovres" class="label label-default col-lg-4"style="margin-left: 30px; font-size: 14px;">'+state.o_size+'</span>&nbsppixels');
	$('#ovfps').html('<span id="ovfps" class="label label-default col-lg-4" style="margin-left: 30px; font-size: 14px;">'+toFixedPrecision(state.o_fps,2)+'</span> &nbspfps');
	$('#ovbr').html('<span id="ovbr" class="label label-default col-lg-4" style="margin-left: 30px; font-size: 14px;">'+toFixedPrecision(state.o_br,3) * ((state.uv_params.indexOf("-f none") > -1) ? 1 : 1.3)+'</span> &nbspkbps');
	$('#clos_t').html('<span id="clos_t" style="margin-left:35px;text-align: center; width: 160px">'+toFixedPrecision(state.losses,2)+' %</span>');
	if(state.losses > 2){
		$('#clos_g').html('<span class="glyphicon glyphicon-thumbs-down" style="margin-left:30px;font-size: 20px; top: 0px; left: 15px; color: red;"></span>');
	} else {
		$('#clos_g').html('<span class="glyphicon glyphicon-thumbs-up" style="margin-left:30px;font-size: 20px; top: 0px; left: 15px; color: green;"></span>');
	}
	if ((state.uv_params.indexOf("-t") > -1)) {
		$('#cvres').html( state.c_size+' pixels');
		$('#cvfps').html( toFixedPrecision(state.c_fps,2)+' fps');
		$('#cvbr').html( toFixedPrecision(state.c_br * ((state.uv_params.indexOf("-f none") > -1) ? 1 : 1.3),2)+' kbps');
	} else {
		$('#cvres').html('0x0 pixels');
		$('#cvfps').html('0.00 fps');
		$('#cvbr').html('0.00 kbps');	
	}
	if ((state.uv_params.indexOf("-s") > -1)) {
		$('#casr').html('0 kHz');
		$('#cvfps').html(' none');
		$('#cvbr').html( ' kbps');
	} else {
		$('#casr').html('0 kHz');
		$('#cach').html('none');
		$('#cabr').html('0.00 kbps');	
	}


}

function toFixedPrecision(value, precision) {
    var power = Math.pow(10, precision || 0);
    return (Math.round(value * power) / power).toFixed(precision);
}
