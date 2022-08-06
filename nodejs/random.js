function randomNum(max)
{
    const random = Math.random();
    return 1 + Math.round(random * (max - 1));
}
function randomArr(max,length = 1)
{
    if(length === 1)
    {
        return randomNum(max);
    }else{
        if(length > max)
        {
            length = max;
        }
        let output = [];
        while(length > 0)
        {
            let num = randomNum(max);
            if (output.includes(num))
            {
                continue;
            }else{
                output.push(num);
            }
            length--;
        }
        return output;
    }
}
module.exports = randomArr;