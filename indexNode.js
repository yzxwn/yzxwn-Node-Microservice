const http = require('http');
const request = require('request');
const url = require('url');
const fs=require('fs');
const  WebSocketServer = require('ws').Server;
const process = require('child_process');

//TODO 监听6006端口
http.createServer(function (req, res) {
    const path = url.parse(req.url).path;
    console.log(path);
    const head = {
        'Content-Type': 'text/plain;charset=utf8',
        // 'Access-Control-Allow-Origin':'*',
    };
    switch (path){
        case '/':
            res.writeHead(200, {...head,'Content-Type': 'text/html;charset=utf8'});
            sendHtml(req,res,'./index.html');
            break;
        case '/favicon.ico':
            res.writeHead(200, {...head,'Content-Type': 'image/jpg'});
            sendFavicon(req,res,'./favicon.jpg');
            break;
        case '/index.js':
            res.writeHead(200, {...head,'Content-Type': 'text/plan;charset=utf8'});
            sendHtml(req,res,'./index.js');
            break;
        case '/html':
            res.writeHead(200, {...head,'Content-Type': 'text/plan;charset=utf8'});
            sendHtml(req,res,'./index.html');
            break;
        case '/down/hello.jpg':
            res.writeHead(200, {...head,'Content-Type': 'image/jpg;charset=utf8','Content-Disposition': 'attachment; filename=hello.jpg'});
            sendFavicon(req,res,'./favicon.jpg');
            break;
        case '/post/hello':
            res.writeHead(200, head);
            getAndSend(req,res);
            break;
        case '/get/hello*':
            res.writeHead(200, head);
            res.end("123");
            break;
        default:
            res.writeHead(404, head);
            res.end('404');
            break;
    }
}).listen(6006);

//TODO 初始化
process.exec('start http://localhost:6006/');
createSocket();
let clients = [];// 连接池
watchFile('./index.html');
watchFile('./index.js');

//TODO 返回html页面
function sendHtml(req,res,path) {
    fs.readFile(path,'utf-8',function(err,data){
        if(err) {
            console.log('html loading is failed :'+err);
        }
        else{
            res.end(data);
        }
    });
}

//TODO 返回图片
function sendFavicon(req,res,path) {
    const stream = fs.createReadStream( path );
    const responseData = [];
    if (stream) {
        stream.on( 'data', function( chunk ) {
            responseData.push( chunk );
        });
        stream.on( 'end', function() {
            const finalData = Buffer.concat( responseData );
            res.write( finalData );
            res.end();
        });
    }
}

//TODO 获取post请求发送的json数据
function getJSON(req,res){
    return new Promise((resolve,reject)=>{
        let str = '';
        req.on('data',function(data){
            str += data;
        });
        req.on('end',function(){
            resolve(JSON.parse(str))
        })
    });
}

//TODO 发送json数据到指定服务端接口
function sendPost(url, data) {
    return new Promise((resolve,reject)=>{
        request({
            url: url,
            method: 'POST',
            json: true,
            headers: {
                'content-type': 'application/json'
            },
            body: data
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body)
            }
        });
    });
}

//TODO 转发json数据到指定服务端接口
async function getAndSend(req,res){
    const getData = await getJSON(req,res);
    console.log('请求：',getData);
    const getSend = await sendPost(getData.url, getData.data);
    res.end(JSON.stringify(getSend));
}

//TODO 文件监听
function watchFile(path) {
    fs.watch(path, function (event, filename) {
        event==="change"&&clients.forEach(function(ws1){
            ws1.send(JSON.stringify({fileChange: true,filename}));
        });
    });
}

//TODO 建立websocket服务
function createSocket() {
    const wss = new WebSocketServer({port: 6007});
    wss.on('connection', function(ws) {
        // 将该连接加入连接池
        clients.push(ws);
        ws.on('message', function(message) {
            console.log("socket接收：",message);
        });
        ws.on('close', function(message) {
            // 连接关闭时，将其移出连接池
            clients = clients.filter(function(ws1){
                return ws1 !== ws
            })
        });
    });
}

