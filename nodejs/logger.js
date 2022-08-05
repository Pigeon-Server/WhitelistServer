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
const logger = log.getLogger('Access');
const submit = log.getLogger('Submit');
const GetApi = log.getLogger('GetAPI');
const PostApi = log.getLogger('PostAPI');
const Function = log.getLogger('Function');
const Error = log.getLogger('Error');

module.exports.logger = logger;
module.exports.submit = submit;
module.exports.GetApi = GetApi;
module.exports.PostApi = PostApi;
module.exports.Function = Function;
module.exports.Error = Error;

