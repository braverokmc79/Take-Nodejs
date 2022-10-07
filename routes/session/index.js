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


router.post('/auth/login', function (req, res, next) {
    let user = {
        username: 'egoing',
        password: '1111',
        displayName: 'Egoing'
    }
    const uname = req.body.username;
    const pwd = req.body.password;

    if (uname === user.username && pwd === user.password) {
        //세션 저장
        req.session.displayName = user.displayName;
        req.session.save(function () {
            res.redirect("/session/welcome");
        })
    } else {
        res.render("session/login", { error: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }
})

router.get("/auth/logout", function (req, res, next) {
    delete req.session.displayName;
    req.session.save(function () {
        res.redirect("/session/welcome");
    })

});

router.get('/welcome', function (req, res, next) {
    res.render("session/welcome", { session: req.session });
});



module.exports = router;