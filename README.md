# WhitelistServer
为了更加方便的白名单申请，应运而生

## 关于SSL/TLS
证书文件请放置在www/certificate下，并重命名为www.key和www.crt  
经[myssl](https://myssl.com/)验证，本网页可以达到A+的SSL/TLS安全标准
这是已经部署的检测结果
 ![QQ截图20220802160336](https://user-images.githubusercontent.com/50048293/182324639-ba589f81-2706-4a6c-a976-0358f0a1b844.png)  
更加具体的结果请看[这里](https://files-1304987401.cos.ap-shanghai.myqcloud.com/myssl.png)

## 配置文件详解

| 参数名           | 类型 | 作用          |
| ----------------- | -------- | ----------------- |
| port | int     | 网页监听的端口            |
| maxage   | int     | cookie过期时间（ms）            |
| cookiekey     | string      | 用来加密cookie的随机字符串            |
| database       | dictionary      | 存储数据库连接设置 |
| database.host  | string      | 数据库地址            |
| database.username       | string      | 用户名            |
| database.password        | string      | 密码            |
| database.name        | string      | 数据库名称            |
| database.port        | int      | 数据库端口            |
| LogSize       | string      | 单个日志文件大小            |
| BackUpNumber        | int      | 保存的日志文件数目            |
| EnableCompress        | boolean      | 是否启用压缩            |
| passScore       | int      | 通过的分数            |

## log文件分类

| 日志文件名称           | 记录内容          |
| ----------------- | ----------------- |
| access.log | 记录所有访问     |
| api.log   | 记录所有api调用     |
| error.log     | 记录错误信息      | 
| function.log       | 记录所有函数调用      |
| submit.log  | 记录表单提交      | 

## API列表

| API地址           | 获取方式 | 接口参数          |
| ----------------- | -------- | ----------------- |
| /api/registration | POST     | 无参数            |
| /api/validation   | POST     | 无参数            |
| /api/question     | GET      | game,server       |
| /api/judge        | GET      | account，username |
| /api/measurement  | GET      | 无参数            |
| /api/result       | GET      | 无参数            |
| /api/again        | GET      | 无参数            |

## API明细

#### **/api/registration**
  * 地址 ： /api/registration
  * 获取方式 ： POST
  * 接口参数 ： 无参数
  * 说明 ：信息收集表单提交地址
  * 返回值 ： 网址重定向至答题页面
#### **/api/validation**
  * 地址 ： /api/validation
  * 获取方式 ： POST
  * 接口参数 ： 无参数
  * 说明 ：答题表单提交地址
  * 返回值 ： 网址重定向至确认页面
#### **/api/question**
  * 地址 ： /api/question
  * 获取方式 ： GET
  * 接口参数 ： 
     * 可选参数 ：game（指定获取的有关游戏的题目数量，默认是10）
     * 可选参数 ：server(指定获取的有关服务器规则的题目数量，默认是5)
  * 说明 ：获取题目
  * 返回值格式 : 
  `[{"question": "题目",
    "choice": {
    "A": "选项A",
    "B": "选项B",
    "C": "选项C",
    "D": "选项D"},
    "id": 1(唯一数字id)}]`
#### **/api/judge**
  * 地址 ： /api/judge
  * 获取方式 ： GET
  * 接口参数 ： 
     * 参数 ：account（玩家QQ/KOOK）
     * 参数 ：username (玩家游戏名)
     * 补充说明 ：至少传入一个参数，可以两个都传入
  * 调用限制 ： 10次/分
  * 说明 ：判断玩家是否已存在
  * 返回值格式 : 
     * 只传入account : `{"User": True或者False}`
     * 只传入username : `{"PlayerName": True或者False}`
     * 两个参数均传入 ：`{"User": True或者False,"PlayerName": True或者False}`
#### **/api/measurement**
  * 地址 ： /api/measurement
  * 获取方式 ： GET
  * 接口参数 ： 无参数
  * 说明 ：返回答题界面
  * 返回值 ： 发送答题界面
#### **/api/result**
  * 地址 ： /api/result
  * 获取方式 ： GET
  * 接口参数 ： 无参数
  * 说明 ：返回提交答案后的分数，判断结果和部分信息以及token
  * 返回值格式 ： 
    * 通过 ： 
    `{
        "score": 分数,  
        "status": "SUCCESS",
        "userinfo": {
            Game_name: 游戏名,
            User: 账号,
            User_Mode: QQ/KOOK,
            Game_version: Java/BE,
            token: 随机生成的16位大写字符串
        }
    }`
    * 不通过 ：
    `{
        "score": 分数,
        "status": “FAILURE"
    }`
#### **/api/again**
  * 地址 ： /api/again
  * 获取方式 ： GET
  * 接口参数 ： 无参数
  * 补充说明 ： 只能返回一次，第二次会返回错误
  * 说明 ：返回答题界面，并重新生成题库
  * 返回值 ： 
    * 第一次重试： 返回答题界面 
    * 第二次重试： `{"status":"REFUSE","score":0,"info":"重试超过两次，请半小时后重试"}`
