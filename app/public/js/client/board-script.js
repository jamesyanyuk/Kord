var canvas = document.getElementById('canvas');
var paper = new Raphael(canvas);

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
var stroke_width = 5;
var stroke_color = Raphael.getColor();

var text = undefined;
var string = '';

var elements = {};
var resources = {};

var freeids = {};
var idcounter = 0; // how to retrieve id counter when reloading board

var elementidprefix = 'b' + boardid + 'u' + userid + 'e';
var resourceidprefix = 'b' + boardid + 'u' + userid + 'r';

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
$(document).mousemove(
    function(event) {
        if (!(buffercounter % 1)) {
            if (ctrldown || mousedown) {
                var x = (!event.offsetX) ? event.originalEvent.layerX : event.offsetX;
                var y = (!event.offsetY) ? event.originalEvent.layerY : event.offsetY;

                path_string += 'l' + (x - bufferx) + ' ' + (y - buffery);
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
$('#addvideo').click(
    function(event) {
        event.preventDefault();
        mode = 'res_video';
    }
)
$(canvas).mouseup(
    function(event) {
        var currentx = (!event.offsetX) ? event.originalEvent.layerX : event.offsetX;
        var currenty = (!event.offsetY) ? event.originalEvent.layerY : event.offsetY;

        if (mode === 'res_video') {
            var resourceid = generate_object_id(resourceidprefix);

            var width = 250;
            var height = 250;
            var resourceurl = 'https://yt3.ggpht.com/-ZH3a2SHTG-o/AAAAAAAAAAI/AAAAAAAAAAA/Xr0rSQIrJFU/s900-c-k-no/photo.jpg';

            var newResource = new Infobox(paper, {
                x: currentx,
                y: currenty,
                width: width,
                height: height
            });

            //$(resources[mode + '_0001'].div).css('position', 'fixed');
            newResource.div.css('overflow', 'hidden');
            newResource.div.html('<iframe scrolling=frameborder="0" width="' + width + 'px" height="' + height +
                'px" src="' + resourceurl + '"></iframe>');

            add_resource(resourceid, newResource);

            socket.emit('create_resource',
                { roomid: roomid,
                boardid: boardid,
                userid: userid,
                resourceid: resourceid,
                resourceurl: resourceurl,
                x: currentx,
                y: currenty,
                width: width,
                height: height }
            );

            // var width = 420;
            // var height = 315;
            //
            // resources[mode + '_0001'] = new Infobox(paper, {
            //     x: currentx - (width/2),
            //     y: currenty - (height/2),
            //     width: width,
            //     height: height
            // });
            //
            // //$(resources[mode + '_0001'].div).css('position', 'fixed');
            // $(resources[mode + '_0001'].div).css('overflow', 'hidden');
            // resources[mode + '_0001'].div.html('<iframe scrolling=frameborder="0" width="' + width + 'px" height="' +
            //     height + 'px" src="https://yt3.ggpht.com/-ZH3a2SHTG-o/AAAAAAAAAAI/AAAAAAAAAAA/Xr0rSQIrJFU/s900-c-k-no/photo.jpg"></iframe>');
        } else if (selection) {
            var transformstring = 't' + (currentx - selectionx) + ',' + (currenty - selectiony);

            selection.transform(transformstring);
            console.log('t' + (currentx - selectionx) + ',' + (currenty - selectiony));
            console.log('mouseup');

            if(selection.elementid) {
                socket.emit('drag_element',
                    { roomid: roomid,
                    boardid: boardid,
                    userid: userid,
                    elementid: selection['objectid'],
                    transformstring: transformstring,
                    pathstring: selection['attrs']['path'] }
                );
            } else {
                socket.emit('drag_resource',
                    { roomid: roomid,
                    boardid: boardid,
                    userid: userid,
                    resourceid: selection['objectid'],
                    transformstring: transformstring,
                    pathstring: selection['attrs']['path'] }
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
        resources[data['resourceid']].transform(data['transformstring']);
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
            idcounter = Math.max(idcounter, data[i]['elementid'].split('e')[1]);
		}
	}
);

socket.on('resources',
    function(data) {
        print_data('resources', data);

        for (var i in data) {
            print_data('data', data[i]);

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
            idcounter = Math.max(idcounter, data[i]['resourceid'].split('e')[1]);
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

socket.on('add_element',
    function(data) {
        // print_data('add', data['attrs']);

        var attrs = data['attrs'];
		if (attrs['type'] === 'path') {
			var foreignpath = paper.path(attrs['path']).attr(
                { 'stroke-width': attrs['stroke-width'],
                 'stroke': attrs['stroke'] }
            );
            add_element(data['elementid'], foreignpath);
            // need to reattach listeners when loading elements
		}


        // path = paper.path
        // add_element(data['elementid'], paper.path(data['attrs']['path']));
        // for (var i in elements) {
        //     console.log(i + ': ' + elements[i]);
        // }
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

        // path = paper.path
        // add_element(data['elementid'], paper.path(data['attrs']['path']));
        // for (var i in elements) {
        //     console.log(i + ': ' + elements[i]);
        // }
    }
);


socket.on('remove_element',
    function(data) {
        console.log(data['elementid']);
        elements[data['elementid']].remove();
    }
);

socket.on('remove_resource',
    function(data) {
        console.log(data['resourceid']);
        elements[data['resourceid']].remove();
    }
);

// socket.on('hover',
//     function(data) {
//
//     }
// );
//
// socket.on('double click',
//     function(data) {
//
//     }
// );
//
// socket.on('transform',
//     function(data) {
//
//     }
// );

function add_element(elementid, element) {
    elements[elementid] = element;
    interactable(elementid, element);
}
function add_resource(resourceid, resource) {
    resources[resourceid] = resource;
    interactable(resourceid, $(resource.div));
}
function interactable(objectid, object) {
    return selectable(objectid, destroyable(objectid, object));
}
function selectable(objectid, object) {
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
    idcounter++;
    return idprefix + idcounter;
}

function print_data(message, data) {
    console.log(message + '>');
    for (var prop in data) {
        console.log(prop + ': ' + data[prop]);
    }
}
