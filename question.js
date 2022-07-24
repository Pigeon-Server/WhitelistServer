const fs = require("fs");
const path = require('path');
const randomArr = require(path.join(__dirname,'random.js'));
const GetLength = require(path.join(__dirname,'getlength.js'));

function GetQuestion(req, game = 10,server = 5)
{
    req.session.length = game + server;
    let output = [];
    let jsonArrGame = JSON.parse(fs.readFileSync(path.join(__dirname,"www/game.json"),{encoding:"utf-8"}));
    let jsonArrServer = JSON.parse(fs.readFileSync(path.join(__dirname,"www/server.json"),{encoding:"utf-8"}));
    let lengthGame = GetLength(jsonArrGame);
    let lengthServer = GetLength(jsonArrServer)
    if(game > lengthGame && server <= lengthServer )
    {
        return {"status":"Error","Info":`请求的题数${game}大于游戏题库内的题数${lengthGame}`}
    }else if (game <= lengthGame && server > lengthServer){
        return {"status":"Error","Info":`请求的题数${game}大于服务器规则题库内的题数${lengthGame}`}
    }else if (game > lengthGame && server > lengthServer){
        return {"status":"Error","Info":`请求的题数均大于服务器题库内的题数`}
    }
    let randomGame = randomArr(lengthGame,game);
    let randomServer = randomArr(lengthServer,server);
    for (let i in randomGame)
    {
        let question = jsonArrGame[randomGame[i]]["question"];
        let choice = jsonArrGame[randomGame[i]]["choice"];
        let arr = {question,choice};
        arr["id"] = randomGame[i];
        output.push(arr);
    }
    for (let i in randomServer)
    {
        let question = jsonArrServer[randomServer[i]+500]["question"];
        let choice = jsonArrServer[randomServer[i]+500]["choice"];
        let arr = {question,choice};
        arr["id"] = randomServer[i]+500;
        output.push(arr);
    }
    return output;
}

function JudgeAnswer(input,number)
{
    let right = 0;
    let jsonArrGame = JSON.parse(fs.readFileSync(path.join(__dirname,"www/game.json"),{encoding:"utf-8"}));
    let jsonArrServer = JSON.parse(fs.readFileSync(path.join(__dirname,"www/server.json"),{encoding:"utf-8"}));
    for (let i in input)
    {
        switch (i <= 500)
        {
            case true:
            {
                if (jsonArrGame[i]["answer"] === input[i])
                {
                    right++
                }
                break;
            }
            case false:
            {
                if (jsonArrServer[i]["answer"] === input[i])
                {
                    right++
                }
                break;
            }
        }

    }
    return (right/number * 100).toFixed(2);
}

module.exports.GetQuestion = GetQuestion;
module.exports.JudgeAnswer = JudgeAnswer;