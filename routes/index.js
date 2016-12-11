var router = require('koa-router')();

router.get('/', function *(next) {
  yield this.render('wechat');
});

module.exports = router;
