const express = require('express');
const router = express.Router();

router.get('/count', function (req, res, next) {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.render('session/count', { msg: req.session.count });
});

router.get('/tmp', function (req, res, next) {
    res.json("result : " + req.session.count);
})


router.get('/auth/login', function (req, res, next) {
    res.render("session/login");
});



module.exports = router;