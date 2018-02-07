var app = require('http').createServer(handler);
var io = require('socket.io')(app);

//端口需要重新设置
app.listen(54321);
var controls = [];
function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var url = req.url;
    if (url.indexOf('/control?') == 0) {
        res.writeHead(200);
        var str = url.substring('/control?'.length);
        var param = {};
        var paramArray = str.split("&").length ? str.split("&") : [str];
        paramArray.forEach(function (item) {
            param[decodeURIComponent(item.split("=")[0])] = decodeURIComponent(item.split("=")[1]);
        });
        if (param.control) {
            controls.forEach(function (item) {
                if (item.connected) {
                    item.emit("control", {
                        'script': param.script
                    });
                }
            });
            res.end(JSON.stringify({msg: "666"}));
        }
    }
	else {
		res.end("It Works!");
	}
}
io.on('connection', function (socket) {
    socket.emit('ready', {Server: 'ready'});
    socket.on('login', function (data) {		
        controls.push(socket);
    });
});