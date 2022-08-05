const path = require("path");
const {logger,submit,GetApi,PostApi,Error,Function} = require(path.join(__dirname,'../nodejs/logger.js')); //日志模块

// 处理根域名访问
exports.Root = (req, res)=>
{
    logger.debug(`[${req.protocol}] ` + "Client request for /resource/index.html from " + req.ip);
    res.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains");
    res.sendFile(path.join(__dirname,"../www/index.html"));
}

// 处理无法访问的资源并返回指定页面
exports.error = (req,res)=>
{
    res.statusCode = 404
    // console.log(res)
    res.render("Error",{
        ErrorCode: "404 not found",
        "Msg": "资源不存在"
    })
}