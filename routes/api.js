const express = require("express");
const path = require("path");
const route = express.Router();

const api_func = require("../router_handler/api");

//api定义

// 表单数据存储API
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