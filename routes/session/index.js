const express = require('express');
const router = express.Router();
const md5 = require('md5');
const sha256 = require('sha256');
const crypto = require('crypto');

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
            password: '50c1cc27d83110d7bf94dbd9b6f8d5a3b7a4e209fb0d98bc27efadc12ec7eed6f9af421a49dd25bc7700f8552dcdb35fdff57077d5074f74a60fcf60c258fdaa',
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


    crypto.pbkdf2(pwd, user[1].salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) throw err;
        // Printing the derived key
        console.log(" derivedKey : ", derivedKey);
        //출력결과  <Buffer 50 c1 cc 27 d8 31 10 d7 bf 94 db d9 b6 f8 d5 a3 b7 a4 e2 09 fb 0d 98 bc 27 ef ad c1 2e c7 ee d6 f9 af 42 1a 49 dd 25 bc 77 00 f8 55 2d cd b3 5f df f5
        console.log("Key Derived: ", derivedKey.toString('hex'));
        //해싱함수를 hex 변환 출력 결과 => 50c1cc27d83110d7bf94dbd9b6f8d5a3b7a4e209fb0d98bc27efadc12ec7eed6f9af421a49dd25bc7700f8552dcdb35fdff57077d5074f74a60fcf60c258fdaa


        if (uname === user[0].username && derivedKey.toString('hex') === user[0].password) {
            //세션 저장
            req.session.displayName = user[0].displayName;
            req.session.save(function () {
                res.redirect("/session/welcome");
            })
        } else {
            res.render("session/login", { error: "아이디 또는 비밀번호가 일치하지 않습니다." });
        }

    });




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