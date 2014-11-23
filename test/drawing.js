var width = 1000;
var height = 800;
var sectors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

var sectorWidth = width / sectors.length;
// make bars at top of stage:
for (var s = 0, l = sectors.length; s < l; ++s) {
	new Rect(s * sectorWidth, 0, sectorWidth, 20).attr('fillColor', sectors[s]).addTo(stage);
}

for (var prop in stage) {
	console.log(prop);
}


var stagedown;
var containerdown;
var selection;

drawablestage();
var container = draggablecontainer();

function draggablecontainer() {
	var container = new Group().addTo(stage);
	selection = container;
	container.on('doubleclick',
		function (e) {
			this.remove();
		}
	).on('pointerdown',
		function (e) {
			if (!stagedown) {
				console.log('container down');
				selection = container;
				console.log(this);
				containerdown = true;
				x = this.attr('x'); // why not e.x
				y = this.attr('y');
			}
		}
	).on('drag',
		function (e) {
			console.log('container drag');
			if (containerdown) {
				this.attr(
					{ x: x + e.diffX,
					y: y + e.diffY }
				);
			}
		}
	).on('pointerup',
		function (e) {
			if (containerdown) {
				containerdown = false;
				console.log('container up');
				this.attr(
					{ x: x + e.diffX,
					y: y + e.diffY }
				);
			}
		}
	);
	return container;
}

function makeBlob(x, y) {
	var t = new Rect(0, 0, 12, 12, 3).attr('fillColor',
		color(sectors[0|x/(width/sectors.length)]));
	t.addTo(container);
	t.attr(
		{ x: x,
		y: y,
		scale: 2 }
	);
	return { kill:
		function () {
			t.animate(Math.random() * 20,
				{ opacity: 0, scale: 0 },
				{ onEnd:
					function () {
						t.remove();
					}
				}
			);
		}
	};
}

var DEL = 46;

function drawablestage() {
	stage.on('keydown',
		function (e) {
			if (!containerdown && e.ctrlKey) {
				stagedown = true;
				console.log('stage down');
				makeBlob(e.x, e.y);
			}
			if (e.keyCode == DEL) {
				console.log('stage delete');
				console.log(selection);
				selection.remove();
			}
		}
	).on('drag',
		function (e) {
			if (stagedown) {
				console.log('stage drag');
				makeBlob(e.stageX, e.stageY);
			}
		}
	).on('keyup',
		function (e) {
			if (stagedown) {
				stagedown = false;
				console.log('stage up');
				container = draggablecontainer();
				// selection = container;
				console.log(selection);
			}
		}
	);
}