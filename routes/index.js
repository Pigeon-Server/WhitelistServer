const express = require("express");
const route = express.Router();
const index_func = require("../router_handler/index");

// 为子路由添加ws方法
const expressWS = require('express-ws');
expressWS(route);

// 处理访问根目录，即直接访问域名时
route.get("/", index_func.Root);
// dev-test
route.get("/test",(req, res)=>{
    res.redirect("https://skin.pigeon-server.cn/oauth/authorize?client_id=1&response_type=code&scope=")
})

route.ws('/ws', (ws, req) => {
    ws.send('你连接成功了')
    ws.on('message', (msg) => {
        ws.send(msg);
    })
})

// 处理无法访问的资源并返回指定页面
route.get("*",index_func.error)

// 导出子路由变量
module.exports = route;