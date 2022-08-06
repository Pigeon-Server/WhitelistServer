const path = require("path");
const config = require(path.join(__dirname, '../config.json'));

function EnableHSTS(res)
{
    if (config.EnableHTTPS && config.EnableHSTS)
    {
        res.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains");
    }
}

function StrToBool(input)
{
    if (input === "True" || input === "true")
    {
        return true
    }else if (input === "False" || input === "false"){
        return false
    }
}

module.exports.EnableHSTS = EnableHSTS;
module.exports.StrToBool = StrToBool;