const email = require('../nodejs/email');
function CheckInfo(req)
{
    const data = req.body;
    const Game_name = data["Game_name"];
    if (Game_name.length() > 16) {
        return false
    }
    if (Game_name.match("^\\w+$") === null){
        return false;
    }
    for (let raw in data)
    {
        if (data[raw].toString().match("and|drop|;|sleep|\'|delete|or|true|false|version|insert|into|select|join|like|union|update|where|\""))
        {
            email.sendWarningEmail(email.build_warning_email(req, data[raw].toString()))
            return false;
        }
    }
    return true;
}

module.exports.CheckInfo = CheckInfo