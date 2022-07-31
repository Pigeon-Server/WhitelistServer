const fs = require('fs');

let config;
fs.readFile( "config.json",(err, data) =>
{
    config = JSON.parse(data.toString());
});

module.exports = config
