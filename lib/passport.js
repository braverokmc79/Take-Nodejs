const passport = require("passport");
const crypto = require('crypto');
const db = require("../lib/db");
const LocalStrategy = require('passport-local');
const FacebookStrategy = require('passport-facebook');

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

            if (!row[0].salt) return cb(null, false, { message: '소셜 로그인으로 등록된 유저입니다.' })

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



    //페이스북 로그인
    passport.use(new FacebookStrategy({
        clientID: process.env['FACEBOOK_CLIENT_ID'],
        clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
        callbackURL: '/passport/oauth2/redirect/facebook',
        state: true,
        profileFields: ['id', 'emails', 'name', 'displayName'],
    }, function verify(accessToken, refreshToken, profile, cb) {

        console.log(" 페이스북 로그인 ", profile);

        db.query('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
            'Facebook',
            profile.id
        ], function (err, row) {
            if (err) { return cb(err); }

            console.log(" row.length ", row.length, profile.emails[0].value);

            //1.federated_credentials 테이블에 등록되어 있지 않으면 신규등록처리
            if (row.length === 0) {



                db.query('SELECT * FROM users WHERE email = ?', [profile.emails[0].value], function (err, results) {
                    console.log("등록된 이메일이 존재 results : ", results);

                    if (results.length > 0) {

                        //1) User 테이블에  등록되어 있다면 federated_credentials 테이블에만 등록후 로그인 처리
                        db.query('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
                            results[0].id, 'Facebook', profile.id], function (err) {
                                //구글 페이스북 등 여러 소셜에 대한
                                //user_id 중복 오류가 나올수 있다. 따라서,  에러 상관 없이 로그인 처리
                                return cb(null, results[0]);
                            });



                    } else {
                        //1) User 테이블 및   federated_credentials 테이블 모두 등록 되어 있지 않다면 모두 등록후 로그인 처리

                        db.query('INSERT INTO users (username, email) VALUES (?, ?)', [
                            profile.displayName, profile.emails[0].value
                        ], function (err, results, fields) {
                            if (err) return cb(err);

                            const id = results.insertId;
                            db.query('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
                                id, 'Facebook', profile.id
                            ], function (err) {
                                if (err) { return cb(err); }
                                const user = {
                                    id: id,
                                    username: profile.displayName
                                };
                                return cb(null, user);
                            });
                        });
                    }

                });


            } else {

                //2.federated_credentials 테이블 등록되어 있다면 바로 로그인처리
                db.query('SELECT * FROM users WHERE id = ?', [row[0].user_id], function (err, row) {
                    if (err) { return cb(err); }
                    if (!row[0]) { return cb(null, false); }
                    return cb(null, row[0]);
                });
            }
        });
    }));




    return passport;
}