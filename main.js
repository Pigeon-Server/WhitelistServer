//导入依赖
const path = require('path'); //路径转换
const fs = require('fs'); //文件
const cookieParser = require('cookie-parser'); //cookie
const session = require('express-session'); //session
const express = require('express'); //express
//自写模块
const config = require(path.join(__dirname, 'config.json')); //配置读取
const {EnableHSTS} = require(path.join(__dirname,'nodejs/transform.js')); //转换验证
const {logger,Error} = require(path.join(__dirname,'nodejs/logger.js')); //日志模块

// 初始化express
const app = express();

// 初始化模板系统
// 1. 告诉express框架使用什么模板引擎渲染什么后缀的模板文件
app.engine('art',require('express-art-template'));
// 2. 告诉express框架模板存放的位置是什么
// 第一个views是固定的,是express的配置项名字，告诉express框架模板存放的位置
// 第二个views是文件夹的名字
app.set('views',path.join(__dirname,'views'));
// 3. 告诉express框架模板的默认后缀是什么 ( 方便在渲染模板的时候，省去后缀 )
app.set('view engine','art');

// 配置cookie加密和session
app.use(cookieParser(config.cookiekey));
app.use(session({
    secret: config.cookiekey,
    resave: false,
    saveUninitialized:true,
    name:"UUID",
    cookie: {
        maxAge: config.maxage
    },
    rolling: true,
}));

//注册post参数解析
app.use(express.urlencoded({extended:false})); //form表单编码

// 全局中间件-访问记录
app.use((req, res, next)=>{
    logger.debug(`[${req.protocol}] Client request for ${req.path} from ${req.ip}`);
    next();
})

//静态资源绑定
app.use(["/resource","/api/resource"] ,express.static(path.join(__dirname,"/resource"),{
    dotfiles: 'ignore',
    etag: true,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: true,
    setHeaders (res, path, stat) {
        res.set('x-timestamp', Date.now().toString())
        EnableHSTS(res);
    }
}));

// 全局中间件-错误
app.use((err, req, res, next)=>{
    Error.error("[ServerError]" + err.message);
    res.send("ServerError!");
})

// 路由拆分测试
const routes = require("./routes/routes");
routes(app)

// 配置文件解析
const port = config.port;

//配置服务器并启动
if (config.EnableHTTPS && port !== 80) {
    if (fs.existsSync(path.join(__dirname,"/certificate/certificate.key")) && fs.existsSync(path.join(__dirname,"/certificate/certificate.crt")))
    {
        const https = require('https')
            .createServer({
                key: fs.readFileSync(path.join(__dirname,"/certificate/certificate.key")),
                cert: fs.readFileSync(path.join(__dirname,"/certificate/certificate.crt"))
            },app);
        https.listen(port);
        if (port !== 443) {
            logger.info(`Server running at https://0.0.0.0:${port}/`);
        } else {
            logger.info(`Server running at https://0.0.0.0/`);
        }
    }else{
        Error.error("证书文件不存在！");
    }
} else {
    const http = require('http').createServer(app);
    http.listen(port);
    if (port !== 80) {
        logger.info(`Server running at http://0.0.0.0:${port}/`);
    } else {
        logger.info(`Server running at http://0.0.0.0/`);
    }
}