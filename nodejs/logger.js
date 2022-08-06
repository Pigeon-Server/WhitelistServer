const log = require("log4js");
const path = require("path");
const config = require(path.join(__dirname,'../config.json'));
log.configure(
    {
        appenders: {
            console: {type: 'console'},
            fileAccess: {
                type: 'file',
                filename: 'log/access.log',
                maxLogSize: config.LogSize,
                backups: config.BackUpNumber,
                compress: config.EnableCompress,
                keepFileExt: true
            },
            fileSubmit: {
                type: 'file',
                filename: 'log/submit.log',
                maxLogSize: config.LogSize,
                backups: config.BackUpNumber,
                compress: config.EnableCompress,
                keepFileExt: true
            },
            fileApi: {
                type: 'file',
                filename: 'log/api.log',
                maxLogSize: config.LogSize,
                backups: config.BackUpNumber,
                compress: config.EnableCompress,
                keepFileExt: true
            },
            fileFunction: {
                type: 'file',
                filename: 'log/function.log',
                maxLogSize: config.LogSize,
                backups: config.BackUpNumber,
                compress: config.EnableCompress,
                keepFileExt: true
            },
            fileError: {
                type: 'file',
                filename: 'log/error.log',
                maxLogSize: config.LogSize,
                backups: config.BackUpNumber,
                compress: true,
                keepFileExt: true
            }
        },
        categories: {
            default: {
                appenders: [
                    'console'
                ],
                level:'debug'},
            Access: {
                appenders: [
                    'console',
                    'fileAccess'
                ],
                level: 'debug'
            },
            Submit: {
                appenders: ['fileSubmit'],
                level:'debug'
            },
            GetAPI: {
                appenders: [
                    'console',
                    'fileApi'
                ],
                level:'debug'
            },
            PostAPI: {
                appenders: [
                    'console',
                    'fileApi'
                ],
                level:'debug'
            },
            Function: {
                appenders: [
                    'console',
                    'fileFunction'
                ],
                level:'debug'
            },
            Error: {
                appenders: [
                    'console',
                    'fileError'
                ],
                level:'error'
            }
        }
    }
)

module.exports.logger = log.getLogger('Access');
module.exports.submit = log.getLogger('Submit');
module.exports.GetApi = log.getLogger('GetAPI');
module.exports.PostApi = log.getLogger('PostAPI');
module.exports.Function = log.getLogger('Function');
module.exports.Error = log.getLogger('Error');

