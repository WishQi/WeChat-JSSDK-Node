var router = require('koa-router')();
const querystring = require('querystring');

var verifyInfo = {  //验证信息
    token: 'WeChatMaoge',  // your wechat token
    encodingAESKey: 'VsIy0UESAMpD6FS5DpDW4ccKIe9dXTtffysKLlmG0oO'
};

router.get('/verify', function *(next) {
    var url = this.request.url;
    var params = querystring.parse(url.split('?')[1]);
    params.token = verifyInfo.token;
    // console.log(params);

    var signature = params.signature;
    var echostr = params.echostr;

    return echostr;

});

module.exports = router;
