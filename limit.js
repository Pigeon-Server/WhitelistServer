let storeData = []
function CheckLimit(ip)
{
    for(let i in storeData)
    {
        if(storeData[i]["count"] >= 10)
        {
            return true;
        }
        if(storeData[i]["ip"] === ip)
        {
            storeData[i]["count"]++;
            return false;
        }
    }
    const data = {"ip":ip,"count":1}
    storeData.push(data);
    return false;
}

function Reset()
{
    storeData = [];
}

module.exports.CheckLimit = CheckLimit;
module.exports.Reset = Reset;