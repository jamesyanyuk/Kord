var canvas = document.getElementById('canvas');
var paper = new Raphael(canvas, 800, 800);

var cursors = {};

// store elements created in an array, indexed by elementid
// send that id and actual object to all classes
// store array
// when updating, send id, so receiving client can pull the actual object from map, and update

var mousedown = false;
var ctrldown = false;

var previousx;
var previousy;

var buffercounter;
var bufferx;
var buffery;

var selection;
var selectionx;
var selectiony;

var path;
var path_string;
var stroke_width = 5;
var stroke_color = Raphael.getColor();

var text = undefined;
var string = '';

var elements = {};
var freeids = {};
var idcounter = 0; // how to retrieve id counter when reloading board

var elementidprefix = 'b' + boardid + 'u' + userid + 'e';

////
// drawing
////

$(document).ready(
    function() {
        console.log('Loading video on ready');
        var infobox = new Infobox(paper, {x:10,y:10, width:250, height:250});
        infobox.div.html('<p>This is some crazy content that goes inside of that box that will wrap around.</p>');
    }
);

$(canvas).mousedown(
    function(event) {
        // selection = paper.getElementByPoint();
        selectionx = previousx;
        selectiony = previousy;
        text = undefined;
        string = '';
    }
);
$(document).keydown(
    function(event) {
        console.log('keydown');
        if (!ctrldown && event.ctrlKey) {
            ctrldown = true;
            buffercounter = 0;
            path_string = ['M' + previousx + ' ' + previousy + 'l0 0'];
            path = paper.path(path_string).attr(
                { 'stroke-width' : stroke_width,
                'stroke' : stroke_color }
            );

            path.dblclick(function(){
                this.remove();
            });
            bufferx = previousx;
            buffery = previousy;
        }
        else if (!event.ctrlKey) {
            string += String.fromCharCode(event.keyCode);
            if (!text) text = paper.text(selectionx, selectiony, string);
            else text.attr({ text: string });
        }
    }
);
$(canvas).mousemove(
    function(event) {
        if (!(buffercounter % 10)) {
            if (ctrldown || mousedown) {
                var x = (!event.offsetX) ? event.originalEvent.layerX : event.offsetX;
                var y = (!event.offsetY) ? event.originalEvent.layerY : event.offsetY;
                path_string.push('l' + (x - bufferx) + ' ' + (y - buffery));
                path.attr('path', path_string);

                bufferx = (!event.offsetX) ? event.originalEvent.layerX : event.offsetX;
                buffery = (!event.offsetY) ? event.originalEvent.layerY : event.offsetY;
            }
            socket.emit('mousemove',
                { userid : userid,
                roomid : roomid,
                boardid : boardid,
                cx : (!event.offsetX) ? event.originalEvent.layerX : event.offsetX,
                cy : (!event.offsetY) ? event.originalEvent.layerY : event.offsetY }
            );
        }
        previousx = (!event.offsetX) ? event.originalEvent.layerX : event.offsetX;
        previousy = (!event.offsetY) ? event.originalEvent.layerY : event.offsetY;
        buffercounter++;
    }
);
$(document).keyup(
    function(event) {
        if (ctrldown) {
            var attrs =
				{ 'type': 'path',
				'path' : path_string,
                'stroke-width': stroke_width,
                'stroke': stroke_color };
            var elementid = generate_element_id();

            add_element(elementid, path);

			socket.emit('create',
				{ roomid: roomid,
				boardid: boardid,
				userid: userid,
                elementid: elementid,
				attrs: attrs }
			);
        }
        ctrldown = false;
    }
);
$('#addvideo').click(
    function(event) {
        event.preventDefault();
        console.log('Adding video...');
    }
)

// key up - add element
// server receives create message - creates in database
// emits to other clients add message
// clients receive add message

////
// socket
////

socket.on('connect',
    function(data) {
        print_data('connect', data);
        socket.emit('join_board', {
            boardid: boardid,
            userid: userid
        });
    }
);

socket.on('elements',
	function(data) {
        print_data('elements', data);

		for (var i in data) {
            print_data('e', data[i]);
			var attrs = data[i]['attrs'];
			if (attrs['type'] === 'path') {
				path = paper.path(attrs['path']).attr(
                    { 'stroke-width': attrs['stroke-width'],
                     'stroke': attrs['stroke'] }
                );
                add_element(data[i]['elementid'], path);
                // need to reattach listeners when loading elements
			}
            idcounter = Math.max(idcounter, data[i]['elementid'].split('e')[1]);
		}
	}
);

socket.on('cursorupdate',
    function(data) {
        // print_data('cursorupdate', data);
        if(cursors[data.userid]) {
            cursors[data.userid].attr(
                { 'cx' : data.cx,
                'cy' : data.cy }
            );
        }
        else {
            var f = Raphael.getColor();
            var s = Raphael.getColor();
            var circle = paper.circle(data.cx, data.cy, 10).attr(
                { 'fill' : f,
                'stroke' : s,
                'stroke-width' : 5 }
            );
            cursors[data.userid] = circle;
        }
    }
);

socket.on('add',
    function(data) {
        print_data('add', data['attrs']);

        var attrs = data['attrs'];
		if (attrs['type'] === 'path') {
			path = paper.path(attrs['path']).attr(
                { 'stroke-width': attrs['stroke-width'],
                 'stroke': attrs['stroke'] }
            );
            add_element(data['elementid'], path);
            // need to reattach listeners when loading elements
		}


        // path = paper.path
        // add_element(data['elementid'], paper.path(data['attrs']['path']));
        // for (var i in elements) {
        //     console.log(i + ': ' + elements[i]);
        // }
    }
);

socket.on('move',
    function(data) {

    }
);

socket.on('remove',
    function(data) {
        console.log(data['elementid']);
        elements[data['elementid']].remove();
    }
);

socket.on('hover',
    function(data) {

    }
);

socket.on('double click',
    function(data) {

    }
);

socket.on('transform',
    function(data) {

    }
);

function add_element(elementid, element) {
    elements[elementid] = element;
    interactable(elementid, element);

    // if (attrs['type'] === 'path') {
	// 	path = paper.path(attrs['path']).attr(
    //         { 'stroke-width': attrs['stroke-width'],
    //          'stroke': attrs['stroke'] }
    //     );
    //     interactable(data[i]['elementid'], path);
    //     // need to reattach listeners when loading elements
	// }
}

function interactable(elementid, element) {
    return selectable(elementid, destroyable(elementid, element));
}

function selectable(elementid, element) {
    element.mousedown(
        function (event) {
            selection = element;
            console.log('select');
        }
    );
    return element;
}

function destroyable(elementid, element) {
    element.dblclick(
        function(event) {
            element.remove();
            delete elements[elementid];
            socket.emit('destroy',
                { roomid: roomid,
                boardid: boardid,
                userid: userid,
                elementid: elementid }
            );
            console.log(elementid);
        }
    );
    return element;
}

function generate_element_id() {
    idcounter++;
    return elementidprefix + idcounter;
}

function print_data(message, data) {
    console.log(message + '>');
    for (var prop in data) {
        console.log(prop + ': ' + data[prop]);
    }
}
