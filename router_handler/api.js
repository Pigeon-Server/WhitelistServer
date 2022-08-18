const path = require("path");
const stringRandom = require('string-random'); //随机字符
const axios = require("axios");
const qs = require("qs");
// 自定义库
const config = require(path.join(__dirname, '../config.json'));  //配置读取
const {GetQuestion,JudgeAnswer} = require('../nodejs/question.js'); //获取问题以及判断正误
const GetLength = require('../nodejs/getlength.js'); //获取长度
const {CheckName,addUser,checkToken} = require('../nodejs/mysql.js'); //数据库相关
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
    res.send({
        "reCAPTCHA_v2_key": config.reCAPTCHA.Web_token
    })
}

// 判断游戏名/社交账号是否被绑定API(GET)
exports.judge = async (req, res) => {
    EnableHSTS(res);
    GetApi.info(`[${req.protocol}] Get request from ${req.ip} ,target /api/judge`);
    //判断api调用是否超过限制次数
    if(CheckLimit(req.ip) !== true)
    {
        let {account, username} = req.query;
        let exist;
        if(account && !username)
        {
            await CheckName["User"](account).then(result => {
                Function.info("Call function CheckUser.");
                exist = {
                    "User": GetLength(result) === 1
                }
            })
        }else if(!account && username){
            await CheckName["PlayerName"](username).then(result => {
                Function.info("Call function CheckUserName.");
                exist = {
                    "PlayerName": GetLength(result) === 1
                }
            })
        }else{
            await CheckName["All"](account, username).then(result => {
                Function.info("Call function CheckALL.");
                exist = {
                    "User": GetLength(result) === 1,
                    "PlayerName": GetLength(result) === 1
                }
            });
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
    const {username,account,User_Mode,Age,playtime,online_mode,Game_version,user_introduce,Rules} = req.body; //解构赋值
    submit.info(`[${req.protocol}] User register from ${req.ip}`);
    Function.info("Call function CheckInfo.");
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
                        if (CheckInfo(req))
                        {
                            //写入session
                            req.session.user = {
                                PlayerName: username,
                                UserName: account,
                                UserMode: User_Mode,
                                Age: Age,
                                playtime: playtime,
                                online: StrToBool(online_mode),
                                GameVersion: Game_version,
                                Introduce: user_introduce,
                                rule: Rules
                            }
                            res.redirect("measurement"); //重定向至答题页面
                        }else{
                            Error.error(`Receive illegal character from ${req.ip}`);
                            req.session.count = 2
                            res.sendFile(path.join(__dirname,"../www/confirm.html"));
                        }
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
    res.send(req.session.question);
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
    let token;
    if (score >= config.passScore) //判断是否通过
    {
        submit.info(`[${req.protocol}] User pass from ${req.ip}`);
        //如果session内没有token字段则生成一个token并且写入
        if (!req.session.user.token) {
            while (true)
            {
                Function.info("Call function stringRandom.");
                token = stringRandom(16, {
                    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    numbers: false
                })
                Function.info("Call function checkToken.");
                checkToken(token).then(result => {
                    if (result.length < 1){
                        req.session.user.token = token
                        break
                    }
                }).catch(err => Error.error(err))
            }
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

