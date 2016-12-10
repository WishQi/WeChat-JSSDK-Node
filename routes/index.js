var router = require('koa-router')();

router.get('/', function *(next) {
  yield this.render('test');
});

router.post('/transferVolume', function *(next) {
    
});

module.exports = router;
