const path = require("path");
const stringRandom = require('string-random'); //随机字符
const axios = require("axios");
const qs = require("qs");
// 自定义库
const config = require(path.join(__dirname, '../config.json'));  //配置读取
const {GetQuestion,JudgeAnswer} = require('../nodejs/question.js'); //获取问题以及判断正误
const GetLength = require('../nodejs/getlength.js'); //获取长度
const {CheckName,addUser} = require('../nodejs/mysql.js'); //数据库相关
const {CheckLimit,Reset} = require('../nodejs/limit.js'); //api访问限制
const {logger,submit,GetApi,PostApi,Error,Function} = require('../nodejs/logger.js'); //日志模块
const {StrToBool,EnableHSTS} = require('../nodejs/transform.js'); //转换验证
const {CheckInfo} = require('../nodejs/Check.js');
const email = require('../nodejs/email');
//定时任务
let interval = setInterval(Reset, 60000); //每一分钟清空访问计数器

// reCAPTCHA Web_key传输
exports.reCAPTCHA = (req, res) => {
    EnableHSTS(res);
    if (config.reCAPTCHA.enable) {
        res.send({
            "enable": true,
            "reCAPTCHA_v2_key": config.reCAPTCHA.Web_token
        })
    } else {
        res.send({
            "enable": false
        })
    }
}

// 判断游戏名/社交账号是否被绑定API(GET)
exports.judge = async (req, res) => {
    EnableHSTS(res);
    GetApi.info(`[${req.protocol}] Get request from ${req.ip} ,target /api/judge`);
    //判断api调用是否超过限制次数
    if(CheckLimit(req.ip) !== true)
    {
        let {Username,Game_name} = req.query;
        let exist;
        if(Username && !Game_name)
        {
            await CheckName["User"](Username).then(result => {
                Function.info("Call function CheckUser.");
                exist = {
                    "return": GetLength(result) === 1
                }
            })
        }else if (!Username && Game_name){
            await CheckName["PlayerName"](Game_name).then(result => {
                Function.info("Call function CheckUserName.");
                exist = {
                    "return": GetLength(result) === 1
                }
            })
        }
        res.send(exist);
    }else{
        Error.error(`[${req.protocol}] Too much request from ${req.ip}`);
        res.statusCode = 429;
        res.send("Error!To many requests!Try again later.");
    }
}

// 信息表接收API(POST)
exports.registration = (req, res) =>
{
    PostApi.info(`[${req.protocol}] POST request from ${req.ip} ,target /api/registration`);
    EnableHSTS(res);
    submit.info(`[${req.protocol}] User register from ${req.ip}`);
    Function.info("Call function CheckInfo.");
    // 判断是否开启谷歌验证码
    if (config.reCAPTCHA.enable) {
        //启用谷歌验证码
        Google_reCAPTCHA(res,req);
    } else {
        write_session(res,req);
    }
}


//问卷页面
exports.measurement = (req,res)=>
{
    EnableHSTS(res);
    if(req.session.user)
    {
        req.session.user.ip = req.ip;
        res.sendFile(path.join(__dirname,"../www/test.html"))
        logger.debug(`[${req.protocol}] Client request for /resource/test.html from ${req.ip}`);
    }else{
        Error.error(`[${req.protocol}] Forbidden access from ${req.ip}`);
        res.render("Error",{
            ErrorCode: "403 Forbidden",
            Msg: "验证失败"
        })
    }
}

// 题目生成/获取API(GET)
exports.question = (req, res)=>
{
    GetApi.info(`[${req.protocol}] Get request from ${req.ip} ,target /api/question`);
    EnableHSTS(res);
    //判断答题次数
    switch (req.session.count)
    {
        case 2:
        {
            //如果是第二次则拒绝生成题目并且清空题目
            Error.error(`[${req.protocol}] Forbidden access from ${req.ip}`);
            res.statusCode = 403;
            req.session.question = {};
            break;
        }
        case 1:
        {
            //如果是第一次则重新生成题库
            let {game,server} = req.query;
            req.session.question = GetQuestion(req,game,server);
            break;
        }
    }
    if(req.session.user)
    {
        let {game,server} = req.query;
        if(!req.session.question)//防止刷新重置题库
        {
            //生成题库
            req.session.question = GetQuestion(req,game,server);
        }
    }else{
        Error.error(`[${req.protocol}] Forbidden access from ${req.ip}`);
        res.statusCode = 403;
    }
    let question = {};
    question["Quiz_Time"] = config.maxage;
    question["Question_data"] = req.session.question;
    res.send(question);
}

// 答题提交API(POST)
exports.validation = (req, res)=>
{
    PostApi.info(`[${req.protocol}] POST request from ${req.ip} ,target /api/validation`);
    EnableHSTS(res);
    submit.info(`[${req.protocol}] Receive answer from ${req.ip}`);
    //判断是否已经判过分
    if(!req.session.count)
    {
        req.session.count = 1;
    }else if (req.session.count === 1){
        req.session.count = 2;
    }
    Function.info("Call function JudgeAnswer.");
    //调用判分函数
    let score = JudgeAnswer(req.body,req.session.length);
    req.session.score = score;//分数写入session
    if (score >= config.passScore) //判断是否通过
    {
        submit.info(`[${req.protocol}] User pass from ${req.ip}`);
        //如果session内没有token字段则生成一个token并且写入
        if (!req.session.user.token) {
            Function.info("Call function stringRandom.");
            req.session.user.token = stringRandom(16, {
                letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                numbers: false
            })
        }
        //向session.user字段内添加分数和重试次数
        req.session.user.score = req.session.score;
        req.session.user.number = req.session.count;
        Function.info("Call function adduser.");
        //数据库执行添加命令并且捕获错误
        addUser(req.session.user).then(result => {
            Function.info("Add player successfully");
            // 发送邮件
            if (config.Email_config.enable) {
                Function.info("Call function buildEmail_template.");
                Function.info("Call function sendEmail.");
                email.sendEmail(email.buildEmail_template(req))
            }
        }).catch(err => Error.error(err));
        //设置状态
        req.session.status = "SUCCESS";
    } else {
        submit.info(`[${req.protocol}] ` + "User no pass from " + req.ip);
        req.session.status = "FAILURE";
    }
    //跳转至确认界面
    res.sendFile(path.join(__dirname,"../www/confirm.html"));
}

// 输出答题结果API(GET)
exports.result = (req, res) => {
    GetApi.info(`[${req.protocol}] Get request from ${req.ip} target /api/result`);
    EnableHSTS(res);
    //如果第二次答题且不通过
    if(req.session.count === 2 && req.session.status !== "SUCCESS")
    {
        res.send({"status":"REFUSE",
            "score": 0,
            "info":"重试超过两次，请半小时后重试"});//不删除session使session自己过期
    }else if(req.session.status === "SUCCESS"){
        res.send({
            "score": req.session.score,
            "status": req.session.status,
            "userinfo": {
                Game_name: req.session.user.PlayerName,
                User: req.session.user.UserName,
                User_Mode: req.session.user.UserMode,
                Game_version: req.session.user.GameVersion,
                token: req.session.user.token
            }
        });
        //删除session
        req.session.destroy();
    }else{
        res.send({
            "score": req.session.score,
            "status": req.session.status
        });
    }
}

// 重新答题API(GET)
exports.again = (req, res) =>
{
    GetApi.info(`[${req.protocol}] Get request from ${req.ip},target /api/again`);
    EnableHSTS(res);
    //重定向至答题界面
    res.redirect("measurement");
}

// 写入session
function write_session(res,req) {
    const {Game_name,Username,Username_mode,Age,Playtime,Online_mode,Game_version,User_introduce,Rules} = req.body; //解构赋值
    if (CheckInfo(req))
    {
        //写入session
        req.session.user = {
            PlayerName: Game_name,
            UserName: Username,
            UserMode: Username_mode,
            Age: Age,
            playtime: Playtime,
            online: StrToBool(Online_mode),
            GameVersion: Game_version,
            Introduce: User_introduce,
            rule: Rules
        }
        res.send({"return":true});
    }else{
        Error.error(`Receive illegal character from ${req.ip}`);
        req.session.count = 2
        // res.sendFile(path.join(__dirname,"../www/confirm.html"));
        res.send({"return":false});
    }
}

// Google reCAPTCHA
function Google_reCAPTCHA (res,req) {
    if (!req.body["g-recaptcha-response"]) {
        Error.error("缺少Google reCAPTCHA token");
        res.render("Error",{
            ErrorCode: "403 Forbidden",
            Msg: "缺少Google reCAPTCHA token"
        });
    } else {
        // 验证码解析
        axios
            .post("https://recaptcha.net/recaptcha/api/siteverify", qs.stringify({
                secret: config.reCAPTCHA.Server_token,
                response: req.body["g-recaptcha-response"],
            }))
            .then(
                data => {
                    if (data.data.success) {
                        write_session(res,req)
                    } else {
                        Error.error("Google reCAPTCHA验证失败");
                        res.render("Error",{
                            ErrorCode: "403 Forbidden",
                            Msg: "Google reCAPTCHA验证失败"
                        })
                    }
                }
            )
            .catch(error => {
                Error.error(error);
                res.render("Error",{
                    ErrorCode: "403 Forbidden",
                    Msg: "尝试进行Google reCAPTCHA验证时发生错误"
                })
            })
    }
}
