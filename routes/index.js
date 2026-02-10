var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    try {
        const testData = req.db.getAll('test');
        res.render('index', { data: testData });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
