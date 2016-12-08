var router = require('koa-router')();

router.get('/', function *(next) {
  yield this.render('test');
});

module.exports = router;
