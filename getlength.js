function GetLength(arr)
{
    let length = 0;
    for(let key in arr)
    {
        length++;
    }
    return length;
}
module.exports = GetLength;