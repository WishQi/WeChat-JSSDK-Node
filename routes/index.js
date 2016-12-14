var router = require('koa-router')();
var request = require('request');
var sign = require('../config/generateSign.js');
var https = require('https');

var appId = "wxf540ae16cc7b380d";
var appSecret = "3adf5088350e3f063f81ff838e872d1b";
var token = "WeChatMaoge";

router.get('/', function *(next) {

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
    console.log("voiceData:", data);
    // this.redirect('/');
});

module.exports = router;
