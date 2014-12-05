// Copyright 2012: Kelley Reynolds, RubyScale
// http://rubyscale.com/blog/2010/11/22/embedding-arbitrary-html-into-raphaeljs/

// Takes a raphaeljs object, some options, and some container attributes
function Infobox(r, options, attrs) {
    options = options || {};
    attrs = attrs || {};
    this.paper = r;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || this.paper.width;
    this.height = options.height || this.paper.height;
    this.rounding = options.rounding || 0;
    this.show_border = options.with_border || false;
    this.container = this.paper.rect(this.x, this.y, this.width, this.height, this.rounding).attr(attrs);
    var container_id = this.container.node.parentNode.parentNode.id;
    container_id = container_id || this.container.node.parentNode.parentNode.parentNode.id;
    this.raph_container = jQuery('#' + container_id);

    if (!this.show_border) { this.container.hide(); }
        this.div = jQuery('<div style="position: fixed; overflow: auto; width: 0; height: 0;"></div>').insertAfter(this.raph_container);
        this.update();
        jQuery(window).bind('resize', this, function(event) { event.data.update(); });
    }

    Infobox.prototype.update = function() {
        var offset = this.raph_container.offset();
        this.div.css({
            'top': (this.y + (this.rounding) + (offset.top)) + 'px',
            'left': (this.x + (this.rounding) + (offset.left)) + 'px',
            'height': (this.height - (this.rounding*2) + 'px'),
            'width': (this.width - (this.rounding*2) + 'px'),
            'background-color': '#555',
            'z-index': '2',
            'border-width': '20px 4px 4px 4px',
            'border-style': 'solid',
            'border-color': 'rgba(0, 73, 111, 0.43)'
        });
        $(this.div).draggable();
    }

    Infobox.prototype.destroy = function() {
        $(this.div).remove();
    }

    // Note that the fadein/outs for the content div are at double speed. With frequent animations, it gives the best behavior
    Infobox.prototype.show = function() {
        this.container.animate({opacity: 1}, 400, ">");
        this.div.fadeIn(200);
    }

    Infobox.prototype.hide = function() {
        this.container.animate({opacity: 0}, 400, ">");
        this.div.fadeOut(200);
    }
