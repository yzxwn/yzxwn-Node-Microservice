window.onload = function () {
    //热更新时不会重新执行此方法
    createSocket();
};

//TODO 更新页面html
function getHtml(filename) {
    const xhr = XMLHttpRequest?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("GET","http://localhost:6006/html");
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send();
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4 && xhr.status === 200){
            const text = xhr.responseText,
                postUrl = document.querySelector("#postUrl").value,
                postData = document.querySelector("#postDate").value,
                postResult = document.querySelector("#postResult ").value;
            document.querySelector("head").innerHTML = text.slice(text.indexOf("<head>")+6,text.indexOf("</head>"));
            document.querySelector("body").innerHTML = text.slice(text.indexOf("<body>")+6,text.indexOf("</body>"));
            document.querySelector("#postUrl").value = postUrl;
            document.querySelector("#postDate").value = postData;
            document.querySelector("#postResult").value = postResult ;
            if(filename === "index.js"){
                const myJs = document.querySelector("#myJs");
                document.body.removeChild(myJs);
                const newJs = document.createElement("script");
                newJs.src = "index.js";
                newJs.id   = "#myJs";
                document.body.appendChild(newJs);
            }
        }
    }
}

//TODO 下载文件
function downHello() {
    const myIframe = document.createElement("iframe");
    myIframe.src = "http://localhost:6006/down/hello.jpg";
    myIframe.style.display = "none";
    document.body.appendChild(myIframe);
}

//TODO 原生js发送post请求
function postHello() {
    const postUrl = document.querySelector("#postUrl").value;
    const postData = document.querySelector("#postDate").value;
    const xhr = XMLHttpRequest?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST","http://localhost:6006/post/hello");
    xhr.setRequestHeader("Content-type","application/json");
    xhr.send(JSON.stringify({
        url: postUrl,
        data: JSON.parse(postData)
    }));
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4 && xhr.status === 200){
            document.querySelector("#postResult").innerHTML = JSON.stringify(JSON.parse(xhr.responseText), null, 2);
        }
    }
}

//TODO axios发送post请求
function axiosPostHello() {
    const postUrl = document.querySelector("#postUrl").value;
    const postData = document.querySelector("#postDate").value;
    axios.post(
        "http://localhost:6006/post/hello",
        {
            url: postUrl,
            data: JSON.parse(postData)
        },
    ).then((response)=>{
        document.querySelector("#postResult").innerHTML = JSON.stringify(response.data, null, 2);
    }).catch((error)=>{
        document.querySelector("#postResult").innerHTML = JSON.stringify(error, null, 2);
    })
}

//TODO 建立websocket连接--------热更新
function createSocket() {
    const ws = new WebSocket("ws://localhost:6007");
    ws.onopen = function() {
        ws.send("发送数据");
    };
    ws.onmessage = function (evt) {
        const data = JSON.parse(evt.data);
        console.log("socket数据接收: ",data);
        //更新页面
        data.fileChange&&getHtml(data.filename);
    };
    ws.onclose = function() {
        console.log("连接已关闭...");
    };
}