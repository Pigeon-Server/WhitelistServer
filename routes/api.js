const express = require("express");
const route = express.Router();

const api_func = require("../router_handler/api");

// 为子路由添加ws方法
const expressWS = require('express-ws');
expressWS(route);

//api定义

// 验证码
route.get("/reCAPTCHA", api_func.reCAPTCHA);

// BS登陆 - 配置发送
route.get("/BS_login/config",api_func.BS_OAuth2_Config);

// BS登陆 - Code接收
route.get("/BS_login/callback",api_func.BS_OAuth2_Code);

// 表单数据接受
route.post("/registration", api_func.registration);

// 问卷页面
route.get("/measurement", api_func.measurement)

//答题验证api
route.post("/validation", api_func.validation);

//重试api
route.get("/again", api_func.again);

//获取结果
route.get("/result", api_func.result);

//获取题目
route.get("/question", api_func.question);

//判断用户名
route.get("/judge", api_func.judge);

// 导出子路由变量
module.exports = route;