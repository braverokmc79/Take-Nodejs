var express = require('express');
var router = express.Router();

let count = 0;
router.get('/', function (req, res, next) {
    if (req.cookies.count) {
        count = Number(req.cookies.count);
    }
    count += 1;
    res.cookie("count", count);
    res.render('cookies/index', { count: count });
});

module.exports = router;

