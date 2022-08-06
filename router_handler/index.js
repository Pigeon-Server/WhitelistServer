const path = require("path");
const {logger,Error} = require('../nodejs/logger.js'); //日志模块
const {EnableHSTS} = require('../nodejs/transform.js');//转换验证

// 处理根域名访问
exports.Root = (req, res)=>
{
    logger.debug(`[${req.protocol}] Client request for /www/index.html from ${req.ip}`);
    EnableHSTS(res);
    res.sendFile(path.join(__dirname,"../www/index.html"));
}

// 处理无法访问的资源并返回指定页面
exports.error = (req,res)=>
{
    res.statusCode = 404;
    Error.error(`[${req.protocol}] Resource ${req.path} which client ${req.ip} requires does not exist`);
    EnableHSTS(res);
    res.render("Error",{
        ErrorCode: "404 not found",
        "Msg": "资源不存在"
    });
}