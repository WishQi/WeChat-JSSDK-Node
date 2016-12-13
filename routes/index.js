var router = require('koa-router')();
var sign = require('../config/generateSign.js');
var https = require('https');

var appId = "wxf540ae16cc7b380d";
var appSecret = "3adf5088350e3f063f81ff838e872d1b";
var token = "WeChatMaoge";

router.get('/', function *(next) {

    let access_token_promise = new Promise((resolve, reject) => {
        https.get('https://sh.api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret, (res) => {
            resolve(res);
        });
    });

    var access_token = yield access_token_promise.then((res) => {
        console.log(res.body);
        return res.body['access_token'];
    });

    let jsapi_ticket_promise = new Promise((resolve, reject) => {
        https.get('https://sh.api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi', (res) => {
            resolve(res);
        });
    });

    var jsapi_ticket = yield jsapi_ticket_promise.then((res) => {
        console.log(res.body);
        return res.body['ticket'];
    });

    console.log('access_token:' + access_token);
    console.log('jsapi_ticket:' + jsapi_ticket);

    // var signature = sign(jsapi_ticket, 'http://www.use-mine.com/');
    // console.log(signature);

});

module.exports = router;
