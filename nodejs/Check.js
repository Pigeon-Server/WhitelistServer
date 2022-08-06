function CheckInfo(req)
{
    const data = req.body;
    const username = data["username"];
    if (username.match("^\\w+$") === null){
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