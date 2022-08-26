function CheckInfo(req)
{
    const data = req.body;
    const Game_name = data["Game_name"];
    if (Game_name.match("^\\w+$") === null){
        return false;
    }
    for (let raw in data)
    {
        if (data[raw].match(";"))
        {
            return false;
        }
    }
    return true;
}

module.exports.CheckInfo = CheckInfo