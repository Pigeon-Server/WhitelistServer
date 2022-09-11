# WhitelistServer
为了更加方便的白名单申请，应运而生

## 关于SSL/TLS
证书文件请放置在certificate文件夹下，并重命名为certificate.key和certificate.crt  
经[myssl](https://myssl.com/)验证，本网页可以达到A+的SSL/TLS安全标准
这是已经部署的检测结果
 [!QQ截图20220802160336](/wiki/182324639-ba589f81-2706-4a6c-a976-0358f0a1b844.png)  
更加具体的结果请看[这里](/wiki/myssl.png)

## 配置文件详解（请勿直接复制，不支持注释）

```json
{
  "port": 80, //服务端口
  "maxage": 1200000, //cookie过期时间（ms）
  "cookiekey": "ABCDEFG", //用来加密cookie的随机字符串
  "database": { //数据库连接设置
    "host": "127.0.0.1", //数据库地址
    "username": "root", //数据库账户
    "password": "root", //数据库密码
    "name": "whitelist", //数据库
    "port": 3306 //数据库端口
  },
  "reCAPTCHA": { //谷歌验证码设置（reCAPTCHA）
    "Web_token": "", //网站密钥
    "Server_token": "" //服务端密钥
  },
  "Email_config": { //邮件发送设置
    "enable": true, //是否启用
    "Admin_Email": ["root@163.com","root@gmail.com"], //将发送给谁
    "MAIL_MAILER": "smtp", //邮件协议（当前仅支持smtp）
    "MAIL_HOST": "smtp.email.cn", //邮件服务器地址
    "MAIL_PORT": 404, //邮件服务器端口
    "MAIL_USERNAME": "root@email.cn", //邮件账户
    "MAIL_PASSWORD": "root", //邮件密码
    "MAIL_SSL": true, //是否开启SSL
    "MAIL_FROM_ADDRESS": "root@email.cn", //发送者
    "MAIL_FROM_NAME": "Pigeon-Server · 白名单系统" //邮件主题
  },
  "LogSize": "10M", //日志单文件最大大小
  "BackUpNumber": 10, //保存的日志文件数目
  "EnableCompress": true, //是否启用压缩
  "passScore": 70, //问卷通过分数
  "EnableHTTPS": false, //是否启用HTTPS
  "EnableHSTS": false //是否启用HSTS
}

```

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
| /api/reCAPTCHA    | GET      | 无参数       |
| /api/question     | GET      | game,server       |
| /api/judge        | GET      | Username,Game_name |
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
#### **/api/reCAPTCHA**
  * 地址 ： /api/reCAPTCHA
  * 获取方式 ： GET
  * 接口参数 ： 无参数
  * 说明 ：返回reCAPTCHA网站key
  * 返回值 ： `{"reCAPTCHA_v2_key":"xxxxxxxxxxx"}`
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
     * 参数 ：Username（玩家QQ/KOOK）
     * 参数 ：Game_name (玩家游戏名)
     * 补充说明 ：只能传入一个参数
  * 调用限制 ： 10次/分
  * 说明 ：判断玩家是否已存在
  * 返回值格式 : `{"return": True或者False，false代表该玩家不在数据库中}`
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
