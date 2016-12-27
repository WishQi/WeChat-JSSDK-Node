# WeChat-JSSDK-Node
- 此教程内容：以node作为服务器接入微信公众号
- 选用的node框架为koa

## 1. 服务器配置

- 登入微信公众平台之后
- 基本配置 > 服务器配置
- “启用”按钮会向你的服务器发送一个get请求，只有当你返回了正确的数据，此服务器才会被启用

（具体操作算法步骤参照https://mp.weixin.qq.com/wiki）

此路由写在`/routes/wechat.js`中，实现方法如下：

`````javascript
router.get('/verify', function *(next) {
    var url = this.request.url;
    var params = querystring.parse(url.split('?')[1]);

    var arr = [params.timestamp, params.nonce, verifyInfo.token].sort();
    console.log(arr);
    var str = '';
    for (index in arr) {
        str += arr[index];
    }

    var sha1 = crypto.createHash('sha1');
    var sha1result = sha1.update(str).digest('hex');

    if (sha1result == params.signature) {
        console.log('true');
        this.response.body = params.echostr;
    } else {
        console.log('false');
        return false;
    }
});
`````



## 2. JS接口安全域名

- 需要一个经过ICP备案的域名，此域名应该解析到你接入的服务器上
- 官网会让你下载一个txt文本文件，此文件需上传至你的web服务器上的相应目录下，并确保可以访问（可以直接简单地放在`public`文件夹下）



## 3. 初步使用微信js-sdk

- 在需要调用JS接口的页面引入如下JS文件，并注入配置信息（使用了ejs）

  ```html
  <body>
    <input id="content" type="button" class="content" value="record"/>
      <script type="text/javascript" src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
      <script type="text/javascript">
        wx.config({
        debug: true,
        appId: '<%=appId%>',
        timestamp: '<%=timestamp%>',
        nonceStr: '<%=nonceStr%>',
        signature: '<%=signature%>',
        jsApiList: [
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'onVoicePlayEnd',
                    'pauseVoice',
                    'stopVoice',
                    'uploadVoice',
                    'downloadVoice'
                  ]
              });
         </script>
      </body>
  ```

- 页面中的配置信息从何而来？经过微信官网介绍的“JS-SDK使用权限签名算法”运算得到（具体算法介绍参考https://mp.weixin.qq.com/wiki），此实现方法在官网给出的例子上稍作改动

  ```javascript
  var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
  };

  var createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
  };

  var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
      newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
  };

  /**
  * @synopsis 签名算法
  *
  * @param jsapi_ticket 用于签名的 jsapi_ticket
  * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
  *
  * @returns
  */
  var sign = function (jsapi_ticket, url) {
    var ret = {
      jsapi_ticket: jsapi_ticket,
      nonceStr: createNonceStr(),
      timestamp: createTimestamp(),
      url: url
    };
    var string = raw(ret);
        jsSHA = require('jssha');
        shaObj = new jsSHA(string, 'TEXT');
    ret.signature = shaObj.getHash('SHA-1', 'HEX');

    return ret;
  };

  module.exports = sign;
  ```

- 以下这个路由将计算得到的配置信息渲染到页面上去，让一开始的那个页面得到配置信息，从而成功接入微信的js-sdk

  ```javascript
  var appId = "Your appId";
  var appSecret = "Your appSecret";
  var token = "Your token";

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

      yield this.render('wechat', {
          appId: appId,
          timestamp: signature.timestamp,
          nonceStr: signature.nonceStr,
          signature: signature.signature
      });
  });
  ```

## 