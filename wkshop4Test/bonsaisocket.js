// main.js

var movie = document.getElementById('movie')                                    // get the DOM object
var runnerContext = function (runnerUrl) {                                      // have socket connect to the runnerurl field in bonsai.setup
    this.socket = io.connect(runnerUrl);
};

// some boilerplate to connext via socket.io
var proto = runnerContext.prototype = bonsai.tools.mixin({
    init: function () {
        var self = this;
        this.socket.on('message',
            function(msg) {
                self.emit('message', msg[0]);
            }
        );
    },
    notify: function (message) {
        this.socket.emit('message', message);
    },
    notifyRunner: function (message) {
        this.socket.emit('message', message);
    },
    run: function (code) {
        this.notifyRunner({
            command: 'runScript',
            code: code
        });
    }
}, bonsai.EventEmitter);

proto.notifyRunnerAsync = proto.notifyRunner;

bonsai.setup({
    runnerContext: runnerContext,
    runnerUrl: 'http://localhost:3000'
}).run(movie,
    { width: 600,
    height: 600 }
);


// movie.js
// this is read by and run on the server
// demo from http://demos.bonsaijs.org/demos/circles/index.html
var centerX = 250,
centerY = 250,
circles = 180,
distance = 180,
frames = 14,
radiusMin = 10,
radiusVar = 10;

var circle, random = Math.random;

for (var i = 0; i < circles; ++i) {
    var f = i / circles,
    x = centerX + distance * Math.sin(f*2*Math.PI),
    y = centerY + distance * -Math.cos(f*2*Math.PI),
    radius = random() * radiusVar + radiusMin;

    circle = new Circle(x, y, radius).
    attr({fillColor: 'random', fillGradient: bonsai.gradient.radial(['#FFFFFF88', '#FFFFFF00'])});

    circle.x = x;
    circle.y = y;

    stage.addChild(circle);
}

var c = stage.children();
stage.length(frames);
var spread = 80;
stage.on(0,
    function() {
        for (var i = 0, circle; (circle = c[i++]); ) {
            circle.animate(frames,
                { x: circle.x + spread * random() - spread / 2,
                y: circle.y + spread * random() - spread / 2 },
                {easing: 'sineInOut'}
            );
        }
    }
);


// server.js
var bonsai = require('bonsai');
var fs = require('fs');

var bonsaiCode = fs.readFileSync('./movie.js');
var socketRenderer = function (socket) {
    this.socket = socket;
};

var socket = require('socket.io').listen(4000);

socket.sockets.on('connection',
    function (socket) {
        var movie = bonsai.run(null, {
        code: bonsaiCode,
        plugins: []
    }
);

movie.runnerContext.on('message',
    function () {
            socket.emit('message', arguments);
    }
);

movie.on('message',
    function (msg) {
        movie.runnerContext.notifyRunner(msg);
    }
);

socket.on('disconnect',
    function () {
        movie.destroy();
    }
);

});


// package.json
{
    name: "roger-rabbit",
    version: "0.0.0",
    main: "server.js",
    dependencies: {
        "bonsai": "git+ssh://git@github.com:uxebu/bonsai.git",
        "socket.io": "~0.9.10"
    }
}