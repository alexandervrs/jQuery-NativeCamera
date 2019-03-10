
/**
 * Enables the usage of native camera through getUserMedia
 *
 * @author  Alexander Vourtsis
 * @version	0.5.1
 * @updated	26 November 2012, 20:59 UTC+02:00
 * @license	The Unlicense
 */
 
(function($)
{
	var pluginName = 'nativeCamera';
	
	var methods = {

        create: function(options) {
		
			var defaults = {
				width: 320, //width of the video object and captured image
				height: 240, //height of the video object and captured image
				background: 'none', //background color of the video object
				sendData: false, //send the image data to server (for upload), true or false
				sendURL: 'capture.php', //the URL that the upload handler script is at
				sendFilename: 'capture', //a proposed filename to store the image data as on the server
				imageQuality: 100, //the captured image quality
				create: function(){}, //on create callback
				start: function(){}, //on start callback
				stop: function(){}, //on stop callback
				capture: function(imgdata){}, //on capture callback
				beforeSend: function(){}, //callback before sending the captured image
				afterSend: function(){}, //callback after sending the captured image
				unsupportedAPIError: function(){}, //error callback, browser has no getUserMedia(), you can fallback to something else here like a Flash based camera
				deviceError: function(){}, //error callback, device problem
				userPermissionError: function(){}, //error callback, user denied access to their camera
				captureError: function(){}, //error callback, capturing image failed
				sendError: function(){} //error callback, sending captured image failed
			};

			var options = $.extend(defaults, options);
			
			return $(this).each(function(i, elements) {
			
				$(elements).data('plugin-options', options);
				
				if (!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)) {
					options.unsupportedAPIError();
					$(elements).data('plugin-options', null);
					return false;
				}
				
				options.create();
				
			});
		
		},
		
		start: function() {
			
			return $(this).each(function(i, elements) {
			
				var options = $(elements).data('plugin-options');
				
				if (!options) {
					return false;
				}
				
				$(this).html('<video autoplay id="nativecamera-'+$(this).attr('id')+'" oncontextmenu="return false"></video>');
				var nativeCamera = $('#nativecamera-'+$(this).attr('id'))[0];
				
				$(nativeCamera).css({
					'display': 'block',
					'width': options.width,
					'height': options.height,
					'background': options.background
				});
				
				$(nativeCamera).attr({
					'width': options.width,
					'height': options.height,
					'autoplay': 'autoplay'
				});
				$(nativeCamera).removeAttr("controls");

				window.URL = window.URL || window.webkitURL;
				navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
				
				if (navigator.getUserMedia) {
					navigator.getUserMedia({video: true}, function(stream) {
						if (navigator.getUserMedia == navigator.mozGetUserMedia) {
							$(nativeCamera)[0].mozSrcObject = stream;
						} else {
							$(nativeCamera)[0].src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(stream) : stream;
						}
						$(nativeCamera)[0].play();
						options.start();
				  }, function(){ options.userPermissionError(); });
				} else {
					options.deviceError();
				}
				
			});

		},
		
		capture: function(imgdata) {
			
			return $(this).each(function(i, elements) {
		
				var options = $(elements).data('plugin-options');
				
				if (!options) {
					return false;
				}
				
				var video = $('#nativecamera-'+$(this).attr('id'))[0];
				
				if (!($('#nativecamera-canvas-'+$(this).attr('id'))[0])) {
					$(video).after('<canvas id="nativecamera-canvas-'+$(this).attr('id')+'" style="display: none; background: #fff;"></canvas>');
				}
				
				var canvas = $('#nativecamera-canvas-'+$(this).attr('id'))[0];
				
				if (canvas && video) {
					var canvasContext = $(canvas)[0].getContext('2d');
				} else {
					options.captureError();
					return false;
				}
				
				$(canvas).css('display', 'none');
				$(canvas).attr('width', options.width);
				$(canvas).attr('height', options.height);
				
				canvasContext.drawImage(video, 0, 0, options.width, options.height);

				if (options.sendData == true) {

					$.ajax({
						url: options.sendURL,
						type: 'POST',
						cache: false,
						data: {
							'imagedata': canvas.toDataURL('image/jpeg', options.imageQuality),
							'filename': options.sendFilename
						},
						beforeSend: function(){
							options.beforeSend();
						},
						success: function(data){
							options.afterSend();
						},
						error: function(){
							options.sendError();
						}
					});
					
				}
				
				options.capture(canvas.toDataURL('image/jpeg', options.imageQuality));
			
			});
		},
		
        stop: function() {
		
			return $(this).each(function(i, elements) {
		
				var options = $(elements).data('plugin-options');
				
				if (!options) {
					return false;
				}
				
				var nativeCamera = '#nativecamera-'+$(this).attr('id');
				$(nativeCamera).attr('src', '');
				$(nativeCamera)[0].mozSrcObject = null;
				$(nativeCamera).removeAttr('autoplay');
				$(nativeCamera).stop();
				
				options.stop();
				
			});
		},
		
		destroy: function() {
		
			return $(this).each(function(i, elements) {
		
				var options = $(elements).data('plugin-options');

				if (!options) {
					return false;
				}
				
				$('#nativecamera-'+$(this).attr('id')).remove();
				$('#nativecamera-canvas-'+$(this).attr('id')).remove();
				
				options.destroy();
				
				$(elements).data('plugin-options', null);
				
			});
		},
		
       setOption: function(option, value) {
			
			return $(this).each(function(i, elements) {
			
				var options = $(elements).data('plugin-options');
				
				if (!options) {
					return false;
				}
				
				$(elements).data('plugin-options')[option] = value;
				
			});
		
		}
		
    };

    $.fn.nativeCamera = function(option) {
		
		if (methods[option]) {
            return methods[option].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof option === 'object' || ! option) {
			return methods.create.apply(this, arguments);
        } else {
            $.error('Method ' +  option + ' does not exist in '+pluginName);
        }    
    };
	
})(jQuery);