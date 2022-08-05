// 导入路由节点
const api = require("./api");
const index = require("./index");

module.exports = (app) => {
  app.use("/api", api)
  app.use("/", index)
};