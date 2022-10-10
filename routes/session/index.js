const express = require('express');
const router = express.Router();
const md5 = require('md5');
const sha256 = require('sha256');


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
    let user = [
        {
            username: 'egoing',
            password: 'a6c44b2d30bf9a5893c099bacb94606ca119b38e1454614dc1c069e8ffa958e1',
            displayName: 'Egoing',
            salt: "@#@#$SDA%#a213"
        },
        {
            username: 'test1',
            password: '079ec662a574122c1b10d91ab3be9ae4d9cc56e8bae1deadd3c7ee105195f027',
            displayName: '홍길동',
            salt: "#@fsa3%#@f5232"
        },
    ]

    const uname = req.body.username;
    const pwd = req.body.password;
    //password :1111
    console.log("req.body : ", sha256(pwd + user[1].salt));


    if (uname === user[0].username && sha256(pwd + user[0].salt) === user[0].password) {
        //세션 저장
        req.session.displayName = user[0].displayName;
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