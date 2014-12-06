var canvas = document.getElementById('canvas');
var paper = new Raphael(canvas);

var width_select = 0;
var width_list = [5,10,15,20,25];
var stroke_color = 0
var stroke_list = ['blue','red','black','green','pink'];

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

var mode;

var path;
var path_string;

var text = undefined;
var string = '';

var elements = {};
var resources = {};

var freeids = {};
var eidcounter = 0; // how to retrieve id counter when reloading board
var ridcounter = 0;

var elementidprefix = 'b' + boardid + 'u' + userid + 'e';
var resourceidprefix = 'b' + boardid + 'u' + userid + 'r';

var resourceurl;

var infobox;

////
// drawing
////

$(canvas).mousedown(
    function(event) {
        // selection = paper.getElementByPoint();
        // console.log(selection);
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
                {   'stroke-width' : width_list[width_select],
                    'stroke'   : stroke_list[stroke_color] }
            );

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
$(document).mousemove(
    function(event) {
        // if (!(buffercounter % 1)) {
        if (ctrldown || mousedown) {
            var x = (!event.offsetX) ? event.originalEvent.layerX : event.offsetX;
            var y = (!event.offsetY) ? event.originalEvent.layerY : event.offsetY;

            path.attr('path', path.attr('path') + 'l' + (x - bufferx) + ' ' + (y - buffery));

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
        // }
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
				'path' : path.attr('path'),
                'stroke-width' : width_list[width_select],
                'stroke'   : stroke_list[stroke_color]  };
                
            var elementid = generate_object_id(elementidprefix);

            add_element(elementid, path);

			socket.emit('create_element',
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

$(document).keydown(
    function(event){
        console.log('keydown');
        if(event.keyCode === 38){
            if(stroke_color === (stroke_list.length - 1)){ // up arrow =38  
                stroke_color = 0;
            }
            else if(event.keyCode === 38){
                stroke_color +=1;
            }
        }
    }
);
/*
$(document).keyup(function(e) {

  if (e.keyCode == 27) { <DO YOUR WORK HERE> }   // esc
});
*/

//toggle path width
$(document).keydown(
    function(event){
        console.log('keydown');
        if(event.keyCode == 40){
            if(width_select === (width_list.length - 1)){ // down arrow = 40  
                width_select = 0;
            }
            else if(event.keyCode === 40){
                width_select +=1;
            }
        }
    }
);

$('#addvideo').click(
    function(event) {
        event.preventDefault();
        mode = 'res_video';
    }
)

function setMode(newMode) {
    console.log('set it fine!');
    mode = newMode;
}

function setResource(newUrl) {
    resourceurl = newUrl;
}

$(canvas).mouseup(
    function(event) {
        var currentx = (!event.offsetX) ? event.originalEvent.layerX : event.offsetX;
        var currenty = (!event.offsetY) ? event.originalEvent.layerY : event.offsetY;

        if (mode.substr(0, 4) === 'res_') {
            var resourceid = generate_object_id(resourceidprefix);

            var width = 250;
            var height = 250;
            var location = '';

            if(mode === 'res_video') {
                width = 430;
                height = 315;
                location = '//www.youtube.com/embed/' + resourceurl;
            } else if(mode === 'res_photo') {
                width = 275;
                height = 275;
                location = 'https://yt3.ggpht.com/-ZH3a2SHTG-o/AAAAAAAAAAI/AAAAAAAAAAA/Xr0rSQIrJFU/s900-c-k-no/photo.jpg';
            } else if(mode === 'res_code') {
                width = 500;
                height = 500;
                location = 'google.com';
            }

            var newResource = new Infobox(paper, {
                x: currentx,
                y: currenty,
                width: width,
                height: height
            });

            //$(resources[mode + '_0001'].div).css('position', 'fixed');
            newResource.div.css('overflow', 'hidden');
            newResource.div.html('<iframe scrolling="no" frameborder="0" width="' + width + 'px" height="' + height +
                'px" src="' + location + '"></iframe>');

            add_resource(resourceid, newResource);

            socket.emit('create_resource',
                { roomid: roomid,
                boardid: boardid,
                userid: userid,
                resourceid: resourceid,
                resourceurl: location,
                x: currentx,
                y: currenty,
                width: width,
                height: height }
            );

            resourceurl = '';
        } else if (selection) {

            var transformstring = 't' + (currentx - selectionx) + ',' + (currenty - selectiony);
            var transformedpath = selection.attr('path', Raphael.transformPath(selection['attrs']['path'], transformstring));
            // selection.transform(transformstring);
            // console.log('t' + (currentx - selectionx) + ',' + (currenty - selectiony));
            // console.log('mouseup');

            if(selection['objectid'].indexOf('e') > -1) {
                socket.emit('drag_element',
                    { roomid: roomid,
                    boardid: boardid,
                    userid: userid,
                    elementid: selection['objectid'],
                    transformstring: transformstring,
                    pathstring: transformedpath.attr('path'),
                    'stroke-width': selection['attrs']['stroke-width'],
                    'stroke': selection['attrs']['stroke'] }
                );
            } else {
                socket.emit('drag_resource',
                    { roomid: roomid,
                    boardid: boardid,
                    userid: userid,
                    resourceid: selection['objectid']/*,
                    transformstring: transformstring,
                    pathstring: selection['attrs']['path'] */ }
                );
            }
            selection = undefined;
            // socket.emit('drag', transformstring
        }
        mode = undefined;
    }
);

socket.on('transform_element',
    function(data) {
        elements[data['elementid']].transform(data['transformstring']);
    }
);

socket.on('transform_resource',
    function(data) {
        // resources[data['resourceid']].transform(data['transformstring']);
    }
);

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
			var attrs = data[i]['attrs'];
			if (attrs['type'] === 'path') {
				path = paper.path(attrs['path']).attr(
                    { 'stroke-width': attrs['stroke-width'],
                     'stroke': attrs['stroke'] }
                );
                add_element(data[i]['elementid'], path);
                // need to reattach listeners when loading elements
			}
            eidcounter = Math.max(eidcounter, data[i]['elementid'].split('e')[1]);
		}
	}
);

socket.on('resources',
    function(data) {
        print_data('resources', data);

        for (var i in data) {
            // print_data('data', data[i]);

            var newResource = new Infobox(paper, {
                x: data[i].x,
                y: data[i].y,
                width: data[i].width,
                height: data[i].height
            });

            //$(resources[mode + '_0001'].div).css('position', 'fixed');
            newResource.div.css('overflow', 'hidden');
            newResource.div.html('<iframe scrolling=frameborder="0" width="' + data[i].width + 'px" height="' + data[i].height +
                'px" src="' + data[i].resourceurl + '"></iframe>');

            add_resource(data[i]['resourceid'], newResource);
            // need to reattach listeners when loading elements
            ridcounter = Math.max(ridcounter, data[i]['resourceid'].split('r')[1]);
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
            var circle = paper.circle(data.cx, data.cy, 7).attr(
                { 'fill' : f,
                'stroke' : s,
                'stroke-width' : stroke_width }
            );

            cursors[data.userid] = circle;
        }
    }
);

socket.on('add_element',
    function(data) {
        print_data('add', data);

        var attrs = data['attrs'];
        print_data('stuff here', attrs);
		if (attrs['type'] === 'path') {
			var foreignpath = paper.path(attrs['path']).attr(
                { 'stroke-width': attrs['stroke-width'],
                 'stroke': attrs['stroke'] }
            );
            console.log('HERE :D');
            add_element(data['elementid'], foreignpath);
		}
    }
);

socket.on('add_resource',
    function(data) {
        // print_data('add', data['attrs']);

        var newResource = new Infobox(paper, {
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height
        });

        //$(resources[mode + '_0001'].div).css('position', 'fixed');
        newResource.div.css('overflow', 'hidden');
        newResource.div.html('<iframe scrolling=frameborder="0" width="' + data.width + 'px" height="' +
            data.height + 'px" src="' + data.resourceurl + '"></iframe>');

        add_resource(data['resourceid'], newResource);
    }
);


socket.on('remove_element',
    function(data) {
        console.log('Removing ' + data['objectid']);
        elements[data['objectid']].remove();
        delete elements[data['objectid']];
    }
);

socket.on('remove_resource',
    function(data) {
        console.log(data['objectid']);
        $(resources[data['objectid']].div).remove();
        resources[data['objectid']].remove();
        delete resources[data['objectid']];
    }
);

function add_element(elementid, element) {
    elements[elementid] = element;
    interactable(elementid, element, 'element');
}
function add_resource(resourceid, resource) {
    resources[resourceid] = resource;
    interactable(resourceid, $(resource.div), 'resource');
}
function interactable(objectid, object, type) {
    return selectable(objectid, destroyable(objectid, object, type), type);
}
function selectable(objectid, object, type) {
    object.mousedown(
        function (event) {
            selection = object;
            selectionx = previousx;
            selectiony = previousy;
            selection['objectid'] = objectid;
            console.log('select ' + objectid);
        }
    );
    return object;
}

function destroyable(objectid, object, type) {
    object.dblclick(
        function(event) {
            object.remove();
            if(type === 'element') {
                delete elements[objectid];
                socket.emit('destroy_element',
                    { roomid: roomid,
                    boardid: boardid,
                    userid: userid,
                    objectid: objectid }
                );
            } else {
                delete resources[objectid];
                socket.emit('destroy_resource',
                    { roomid: roomid,
                    boardid: boardid,
                    userid: userid,
                    objectid: objectid }
                );
            }
            console.log(objectid);
        }
    );
    return object;
}

function generate_object_id(idprefix) {
    if (idprefix.indexOf('e') > -1)
        return idprefix + ++eidcounter;
    else
        return idprefix + ++ridcounter;
}

function print_data(message, data) {
    console.log(message + '>');
    for (var prop in data) {
        console.log(prop + ': ' + data[prop]);
    }
}
