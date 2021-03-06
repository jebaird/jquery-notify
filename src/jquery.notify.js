/*
 * jQuery Notify UI Widget 1.2.1
 * Copyright (c) 2010 Eric Hynds
 *
 * http://www.erichynds.com/jquery/a-jquery-ui-growl-ubuntu-notification-widget/
 *
 * Depends:
 *   - jQuery 1.4
 *   - jQuery UI 1.8 (core, widget factory)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 *  5/20/2010 - Jesse Baird <jebaird@gmail.com> 
                http://jebaird.com/dev/jquery-notify/
                - added 
                    - templates can now be passed throught the options, default templates are; default, hightlight and error
                    - defaultTemplate option
                    - theme roller support 
 *
 *
*/
(function($){
$.widget("ui.notify", {
	options: {
		speed: 500,
		expires: 5000,
		stack: 'below',
        defaultTemplate:'default',//if no template is specified then this one will be used
        templates:{
            highlight:'<div><div class="ui-state-highlight ui-corner-all"><a href="#" role="button" class="ui-notify-close ui-corner-all ui-state-default" title="close"><span class="ui-icon ui-icon-closethick">close</span></a><div class="ui-widget-header ui-corner-top">#{title}</div><span class="ui-icon ui-icon-info"></span><div class="ui-notify-highlight-content">#{text}</div></div></div>',
            error:'<div class="ui-state-error"><div class="ui-state-error ui-corner-all"> <a href="#" role="button" class="ui-notify-close ui-corner-all ui-state-default" title="close"><span class="ui-icon ui-icon-closethick">close</span></a><div class="ui-widget-header ui-corner-top">#{title}</div><span class="ui-icon ui-icon-alert"></span><div class="ui-notify-error-content">#{text}</div></div></div>',
            'default':'<div><a href="#" role="button" class="ui-notify-close ui-corner-all ui-state-default" title="close"><span class="ui-icon ui-icon-closethick">close</span></a><div class="ui-widget-header ui-corner-top">#{title}</div><div class="ui-widget-content ui-corner-bottom">#{text}</div></div>'
        }
	},
	_create: function(){
		var self = this;
		this.templates = {};
		this.keys = [];
        
        
        //append the templates provided throught the options and default to our target, this way we keep backwards compatiblity with older versions
        $.each(self.options.templates,function(id,template){
           self.element.prepend($(template).attr('id',id)); 
        });
		// build and save templates
		this.element.addClass("ui-notify ui-widget").children().addClass("ui-notify-message ui-widget ui-corner-all").each(function(i){
			var key = this.id || i;
			self.keys.push(key);
			self.templates[key] = $(this).removeAttr("id").wrap("<div></div>").parent().html(); // because $(this).andSelf().html() no workie
		}).end().empty();
        
        //bind the close button hover 
        $('.ui-notify-close').live('mouseover mouseout', function(event) {
            if (event.type == 'mouseover') {
                $(this).addClass('ui-state-hover');
            } else {
                $(this).removeClass('ui-state-hover');
            }
        });
		
	},
	create: function(msg, opts,template){
		if(typeof template === "object"){
			opts = msg;
			msg = template;
			template = null;
		}
		// return a new notification instance
		return new $.ui.notify.instance(this)._create(msg, $.extend({}, this.options, opts), (typeof this.templates[template] =='undefined')?this.templates[this.options.defaultTemplate] : this.templates[ template] );
	}
});

// instance constructor
$.extend($.ui.notify, {
	instance: function(widget){
		this.parent = widget;
		this.isOpen = false;
	}
});

// instance methods
$.extend($.ui.notify.instance.prototype, {
	_create: function(params, options, template){
		this.options = options;
		
		var self = this,
			
			// build html template
			html = template.replace(/#\{(.*?)\}/g, function($1, $2){
				return ($2 in params) ? params[$2] : '';
			}),
			
			// the actual message
			m = (this.element = $(html)),
			
			// close link
			closelink = m.find("a.ui-notify-close");
            
            //check does the header have text in it
            header = m.find('.ui-widget-header');
            
            if(header.text() == ''){
                header.remove();
                //add corner all to the content so we dont end up with square corners on top
                m.find('.ui-widget-content').addClass('ui-corner-all');
            }
		
		// fire beforeopen event
		if(this._trigger("beforeopen") === false){
			return;
		}

		// clickable?
		if(typeof this.options.click === "function"){
			m.addClass("ui-notify-click").bind("click", function(e){
				self._trigger("click", e, self);
			});
		}
		
		// show close link?
		if(closelink.length && !!options.expires){
			closelink.remove();
		} else if(closelink.length){
			closelink.bind("click", function(){
				self.close();
				return false;
			});
		}
		
		this.open();
		
		// auto expire?
		if(options.expires){
			window.setTimeout(function(){
				self.close();
			}, options.expires);
		}
		
		return this;
	},
	close: function(){
		var self = this, speed = this.options.speed;
		this.isOpen = false;
		
		this.element.fadeTo(speed, 0).slideUp(speed, function(){
            self._trigger("close");            
		});
		
		return this;
	},
	open: function(){
		if(this.isOpen){
			return this;
		}
		
		var self = this;
		this.isOpen = true;
		
		this.element[this.options.stack === 'above' ? 'prependTo' : 'appendTo'](this.parent.element).css({ display:"none", opacity:"" }).fadeIn(this.options.speed, function(){
			self._trigger("open");
		});
		
		return this;
	},
	widget: function(){
		return this.element;
	},
	_trigger: function(type, e, instance){
		return this.parent._trigger.call( this, type, e, instance );
	}
});

})(jQuery);
