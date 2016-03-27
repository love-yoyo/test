var crypto = require('crypto');
var secretDef = "bestpay";

var security = {};
security.encrypt = function(str, secret) {
    secret = secret || secretDef;
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

security.decrypt = function(str, secret) {
    secret = secret || secretDef;
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

security.md5 = function(str){
    var md5 = crypto.createHash('md5');
    md5.update(str);
    str = md5.digest('hex');
    return str;
};

security.sha1 = function(str){
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    str = shasum.digest('hex');
    return str;
};

module.exports = security;