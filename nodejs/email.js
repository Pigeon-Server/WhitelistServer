const path = require("path");
const fs = require("fs")
const config = require(path.join(__dirname, '../config.json'));  //配置读取
const {logger,submit,GetApi,PostApi,Error,Function} = require('../nodejs/logger.js'); //日志模块
// 邮箱验证
const nodemailer = require('nodemailer'); //发送邮件的node插件

exports.buildEmail_template = function buildEmail_template (req) {
    return {
        content: fs.readFileSync(path.join(__dirname, '../www/email_template.html')).toString()
    }
}

exports.sendEmail = function sendEmail (email_template){

    let email_data = email_template;

    email_data["email"] = config.Email_config.Admin_Email

    let SSL = false

    if (config.Email_config.MAIL_SSL) {
        SSL = true
    }

    let transporter = nodemailer.createTransport({
        host: config.Email_config.MAIL_HOST,
        port: config.Email_config.MAIL_PORT, // SMTP 端口
        secure: SSL, // 是否使用SSL
        auth: {   //发送者的账户和授权码
            user: config.Email_config.MAIL_USERNAME, //账户
            pass: config.Email_config.MAIL_PASSWORD, //smtp授权码，到邮箱设置下获取
        }
    });
    let mailOptions = {
        from: config.Email_config.MAIL_FROM_NAME + config.Email_config.MAIL_FROM_ADDRESS, // 发送者昵称和地址
        to: email_data.email, // 接收者的邮箱地址
        subject: '新的白名单申请', // 邮件主题
        html: email_data.content
    };
    //发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('邮件发送成功 ID：', info.messageId);
    });
}
