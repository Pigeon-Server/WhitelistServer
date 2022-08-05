const express = require("express");
const path = require("path");
const route = express.Router();

const {logger,submit,GetApi,PostApi,Error,Function} = require(path.join(__dirname,'../nodejs/logger.js')); //日志模块

const index_func = require("../router_handler/index");

// 处理访问根目录，即直接访问域名时
route.get("/", index_func.Root);
// 处理无法访问的资源并返回指定页面
route.get("*",index_func.error)

// 导出子路由变量
module.exports = route;