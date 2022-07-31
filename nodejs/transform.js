function StrToBool(input)
{
    if (input === "True" || input === "true")
    {
        return true
    }else if (input === "False" || input === "false"){
        return false
    }
}

module.exports.StrToBool = StrToBool;