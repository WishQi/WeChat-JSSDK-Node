var router = require('koa-router')();
var request = require('request');
var sign = require('../config/generateSign.js');
var https = require('https');

var appId = "wxf540ae16cc7b380d";
var appSecret = "3adf5088350e3f063f81ff838e872d1b";
var token = "WeChatMaoge";

var users = 0;
var returnInfo = "000000";

router.get('/', function *(next) {
    ++users;

    let access_token_promise = new Promise((resolve, reject) => {
        request.get('https://sh.api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret, (err, res, body) => {
            resolve(body);
        });
    });

    var access_token = yield access_token_promise.then((body) => {
        var parseData = JSON.parse(body);
        return parseData.access_token;
    });

    let jsapi_ticket_promise = new Promise((resolve, reject) => {
        request.get('https://sh.api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi', (err, res, body) => {
            resolve(body);
        });
    });

    var jsapi_ticket = yield jsapi_ticket_promise.then((body) => {
        var parseData = JSON.parse(body);
        return parseData.ticket;
    });

    var signature = sign(jsapi_ticket, 'http://www.use-mine.com/');
    console.log(signature);

    yield this.render('wechat', {
        appId: appId,
        timestamp: signature.timestamp,
        nonceStr: signature.nonceStr,
        signature: signature.signature
    });
});


router.post('/handleRecord', function *(next) {
    var data = this.request.body;
    seconds = data.seconds;
    var deviceNo = users % 6;
    if (seconds <= 3) {
        returnInfo[deviceNo] = '1';
    } else if (seconds > 3 && seconds <= 6) {
        returnInfo[deviceNo] = '2';
    } else if ( seconds > 6 && seconds <= 9) {
        returnInfo[deviceNo] = '3';
    } else {
        returnInfo[deviceNo] = '4';
    }
    console.log('returnInfo: ', returnInfo);
});

router.get('/returnInfo', function *(next) {

    this.response.body = returnInfo;
})

module.exports = router;
