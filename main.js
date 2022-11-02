//导入依赖
const path = require('path'); //路径转换
const fs = require('fs'); //文件
const cookieParser = require('cookie-parser'); //cookie
const session = require('express-session'); //session
const express = require('express'); //express
const expressWs = require('express-ws') // 引入 WebSocket 包
//自写模块
const config = require('./config.json'); //配置读取
const {EnableHSTS} = require('./nodejs/transform.js'); //转换验证
const {logger,Error} = require('./nodejs/logger.js'); //日志模块

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

// 注册路由
const api = require("./routes/api");
const index = require("./routes/index");
app.use('/api', api);
app.use('/', index);

//注册post参数解析
app.use(express.urlencoded({extended:false})); //form表单编码
app.use(express.json())

// 全局中间件-访问记录
app.use((req, res, next)=>{
    EnableHSTS(res); // 判断是否启用HSTS
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
    }
}));

// 全局中间件-错误
app.use((err, req, res, next)=>{
    Error.error("[ServerError]" + err.message);
    res.send("ServerError!");
})

// 注册ws连接
// app.ws("/ws/BS-Login_status")

// 配置文件解析
const port = config.port;

//配置服务器并启动
console.log(
    "  _____  _                               _____                               \n" +
    " |  __ \\(_)                             / ____|                              \n" +
    " | |__) |_   __ _   ___   ___   _ __   | (___    ___  _ __ __   __ ___  _ __ \n" +
    " |  ___/| | / _` | / _ \\ / _ \\ | '_ \\   \\___ \\  / _ \\| '__|\\ \\ / // _ \\| '__|\n" +
    " | |    | || (_| ||  __/| (_) || | | |  ____) ||  __/| |    \\ V /|  __/| |   \n" +
    " |_|    |_| \\__, | \\___| \\___/ |_| |_| |_____/  \\___||_|     \\_/  \\___||_|   \n" +
    "             __/ |                                                           \n" +
    "            |___/                                                            " +
    "\n\n[Github源码库地址，欢迎贡献&完善&Debug]\n后端：https://github.com/Pigeon-Server/WhitelistServer\n前端（UI）：https://github.com/Pigeon-Server/WhitelistServer-UI"
)
if (config.EnableHTTPS) {
    if (fs.existsSync(path.join(__dirname,"/certificate/certificate.key")) && fs.existsSync(path.join(__dirname,"/certificate/certificate.crt")))
    {
        const https = require('https')
            .createServer({
                key: fs.readFileSync(path.join(__dirname,"/certificate/certificate.key")),
                cert: fs.readFileSync(path.join(__dirname,"/certificate/certificate.crt"))
            },app);
        expressWs(app, https); // 为app添加ws服务，并且使用https
        https.listen(port);
        if (port !== 443) {
            logger.info(`Server running at https://0.0.0.0:${port}/`);
        } else {
            logger.info(`Server running at https://0.0.0.0/`);
        }
    }else{
        Error.error("证书文件不存在！");
        process.exit();
    }
} else {
    const http = require('http').createServer(app);
    expressWs(app, http); // 为app添加ws服务，并且使用http
    http.listen(port);
    if (port === 443) {
        Error.error(`Can't use port 443 in http!`);
        process.exit();
    } else if (config.EnableHSTS){
        Error.error(`If you want to enable HSTS, please enable HTTPS first`);
        process.exit()
    } else if (port !== 80){
        logger.info(`Server running at http://0.0.0.0:${port}/`);
    } else {
        logger.info(`Server running at http://0.0.0.0/`);
    }
}