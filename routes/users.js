var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('Moja tajna: ' + process.env.MY_PASSWORD);
  res.send('respond with a resource');
});

module.exports = router;
