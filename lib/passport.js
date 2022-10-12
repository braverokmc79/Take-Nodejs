const passport = require("passport");
const crypto = require('crypto');
const db = require("../lib/db");
const LocalStrategy = require('passport-local');

module.exports = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, cb) {
        console.log("로그인 처리시 최초 한번  passport.serializeUser 호출 user 값  :", user);
        process.nextTick(function () {
            //다음 내용을 세션에 저장
            cb(null, { id: user.id, eamil: user.email, username: user.username });
        });
    });

    // 로그인 성공되면 passport.deserializeUser  매번 실행 처리된다
    passport.deserializeUser(function (user, cb) {
        console.log("deserializeUser  :", user);
        process.nextTick(function () {
            return cb(null, user);
        });
    });


    // 로그인 처리 - 2) passport 로그인
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function verify(email, password, cb) {

        db.query('SELECT * FROM users WHERE email = ?', [email], function (err, row) {
            if (err) { return cb(err); }
            if (!row[0]) { return cb(null, false, { message: '등록된 이메일이 없습니다.' }); }

            crypto.pbkdf2(password, row[0].salt, 310000, 32, 'sha256', function (err, hashedPassword) {
                console.log("로그인 데이터 : ", password, row[0].salt, hashedPassword.toString('hex'));
                console.log("로그인 DB암호: ", row[0].hashed_password);

                if (err) { return cb(err); }
                if (row[0].hashed_password !== hashedPassword.toString('hex')) {
                    console.log("비밀번호 오류");
                    //flash 에 저장 처리됨  - "flash":{"error":["비밀번호가 일치하지 않습니다."]}}
                    return cb(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }


                console.log("로그인 성공");
                return cb(null, row[0], { message: '로그인 성공' });
            });
        });

    }));


    return passport;
}