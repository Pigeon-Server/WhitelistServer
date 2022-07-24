function randomNum(max)
{
    const min = 1;
    const range = max - min;
    const random = Math.random();
    return min + Math.round(random * range);
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
                continue
            }else
            {
                output.push(num);
            }
            length--;
        }
        return output;
    }
}
module.exports = randomArr;