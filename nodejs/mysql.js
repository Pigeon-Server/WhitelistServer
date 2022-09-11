const mysql = require('mysql2');
const path = require("path");
const config = require(path.join(__dirname,'../config.json'));
let database;
database = mysql.createPool((
    {
        host: config.database.host,
        user: config.database.username,
        password: config.database.password,
        database: config.database.name,
        port: config.database.port
    }
))

function addUser(userinfo)
{
    return new Promise((res,rej)=>{
        database.query('insert into wait (account, PlayerName, UserSource, Age, playtime, onlinemode, GameVersion, Introduce, rules, ip, token, score, number) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',[userinfo.UserName,userinfo.PlayerName,userinfo.UserMode,userinfo.Age,userinfo.playtime,userinfo.online,userinfo.GameVersion,userinfo.Introduce,userinfo.rule,userinfo.ip,userinfo.token,userinfo.score,userinfo.number],(err,result)=>{
            if(!err){
                res(result);
            }else{
                rej(err);
            }
        })
    })
}

module.exports.CheckName =
    {
        "User":(account)  => {
            return new Promise((res,rej)=>
            {
                database.query('select * from wait where account = ?', [account], (err, result) => {
                    if(!err){
                        res(result);
                    }else{
                        rej(err);
                    }
                })
            })
        },
        "PlayerName":(playerName) => {
            return new Promise((res,rej)=>
            {
                database.query('select * from wait where PlayerName = ?', [playerName], (err, result) => {
                    if(!err){
                        res(result);
                    }else{
                        rej(err);
                    }
                })
            })
        }
    }

function RunCommand(sql,data = []){
    return new Promise((res,rej)=>{
        database.query(sql,data,(err,result)=>{
            if(!err){
                res(result);
            }else{
                rej(err);
            }
        })
    })
}

module.exports.addUser = addUser;
module.exports.RunCommand = RunCommand;