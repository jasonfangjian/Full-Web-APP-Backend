const User = require('./model.js').User;
const Profile = require('./model.js').Profile;
const Article = require('./model.js').Article;
const Comment = require('./model.js').Comment;
/////////

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const md5 = require('md5');
const session = require('express-session');
const request = require('request');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
// const redis = require('redis').createClient('redis://h:p266456af498b2bbe25ff4045609f4d8fd445b6fe6a2b8564843530cf8fda731d@ec2-3-214-235-220.compute-1.amazonaws.com:11689')
//const redis = require('redis').createClient('redis://h:p266456af498b2bbe25ff4045609f4d8fd445b6fe6a2b8564843530cf8fda731d@ec2-54-163-175-29.compute-1.amazonaws.com:24209')

const redis = require('redis').createClient('redis://h:p266456af498b2bbe25ff4045609f4d8fd445b6fe6a2b8564843530cf8fda731d@ec2-52-23-58-196.compute-1.amazonaws.com:16009')
let originHostUrl = '';
////////

const cookieKey = 'sid';
const secret = 'My secret is I am an idiot';
var sessionUser = {};
let navi;
const configFacebookAuth = {
    clientID:'1011330395879772',
    clientSecret:'26cc658bba2556edddba559ce7205076',
    callbackURL:  'https://jf58ricebook.herokuapp.com/auth/facebook/callback',
    passReqToCallback: true
};

const register = (req,res) => {
    const accountName = req.body.username;
    const emailAddress = req.body.email;
    const birthday = req.body.dob;
    const zipCode = req.body.zipcode;
    const password = req.body.password;
    if(!accountName || !emailAddress || !birthday || !zipCode|| !password){
        res.status(400).send({result: "Did not provide enough information"});
        return;
    }
    User.find({username: accountName},(error,users) => {
        if (users.length !== 0) {
            res.status(401).send(`${accountName} has already been registered.`);
            return;
        } else {
            const salt = md5(accountName + new Date().getTime());
            const hash = md5(password + salt);
            const userObj = new User({username: accountName, salt: salt, hash: hash,auth:[]});
            new User(userObj).save(function (err, user) {
                if (err) return console.log(err);
            });
            const profileObj = new Profile({
                username: accountName,
                headline: "this is Default headline",
                following: [],
                email: emailAddress,
                zipcode: zipCode,
                dob: birthday,
                avatar: null
            });
            new Profile(profileObj).save(function (err, user) {
                if (err) return console.log(err);
            });
            res.send({
                username: accountName,
                result: 'success'
            })
        }
    })
};

const login = (req, res) => {
    const accountName = req.body.username;
    const password = req.body.password;
    if(! accountName || ! password) {
        res.status(400).send("dose no provide username or password");
        return;
    }

    User.find({username: accountName},(error,users)=>{
        if(!users || users.length === 0){
            res.status(401).send("Wrong username");
            return;
        }
        const userObj = users[0];
        if(!userObj){
            res.status(401).send("Wrong username");
        }
        const salt = userObj.salt;
        const hash = userObj.hash;
        if(md5(password+salt)===hash){
            const sessionKey = md5(secret + new Date().getTime() + userObj.username);
            // sessionUser[sessionKey] = userObj.username;
            redis.hmset(sessionKey, userObj);
            res.cookie(cookieKey, sessionKey, {maxAge: 3600*1000, httpOnly: true,sameSite: 'none', secure: true});
            res.send({ username: accountName, result: 'success'})
        } else {
            res.status(401).send("PassWord dose no match");
        }
    })
};

const merge = (req, res) => {
    const username = req.body.Username;
    const password = req.body.Password;
    if (!username || !password) {
        res.status(400).send("username or password is missing");
        return
    }
    User.find({username: username}).exec(function(err, users){
        if (!users || users.length === 0){
            res.status(400).send("Wrong Username");
            return
        }
        const userObj = users[0];
        if(!userObj){
            res.status(400).send("Wrong UserName")
        }
        const salt = userObj.salt;
        const hash = userObj.hash;

        if(md5(password + salt) === hash){
            //third party username
            Article.updateMany({author:req.username}, { $set: { 'author': username}}, { new: true, multi: true}, function(){});
            Article.updateMany({'comments.author' : req.username}, { $set: {'comments.$.author': username}}, { new: true, multi: true }, function(){});
            Comment.updateMany({author:req.username}, { $set: { 'author': username}}, { new: true, multi: true }, function(){});
            Profile.findOne({username: req.username}).exec(function(err, profile){
                if(profile){
                    const oldFollowingArr = profile.following;
                    Profile.findOne({username: username}).exec(function(err, newProfile) {
                        if(newProfile){
                            //concat
                            const newFollowingArr = newProfile.following.concat(oldFollowingArr);
                            Profile.updateMany({username: username}, {$set: {'following': newFollowingArr}}, function(){})
                        }
                    });
                    //delete the profile record
                    Profile.updateMany({username: req.username}, {$set: {'following':[]}}, function(){})
                }
            });
            User.findOne({username: username}).exec(function(err, user){
                if(user){
                    const usrArr = req.username.split('@');
                    const authObj = {};
                    authObj[`${usrArr[1]}`] = usrArr[0];
                    User.updateMany({username: username}, {$addToSet: {'auth': authObj}}, {new: true}, function(){})
                }
            });
            res.status(200).send({ username: username, result: 'success'})
        } else{
            res.status(401).send("Wrong password!")
        }
    })
};


const unlink = (req, res) => {
    const username = req.username;
    const company = req.body.company;
    User.findOne({username: username}).exec(function(err, user){
        if(user.auth.length !== 0){
            User.findOne({username: username}).exec(function(err,user){
                let authArr = user.auth;
                authArr = authArr.filter(function (obj) {
                    return Object.keys(obj)[0] !== company;
                });
                User.updateMany({username: username}, {$set: {'auth': authArr}}, {new: true}, function(){});
                res.status(200).send({result: 'successfully unlink ' + company})
            })
        } else {
            res.status(400).send("no link account to FaceBook")
        }
    })
};

passport.use(new FacebookStrategy(configFacebookAuth,
    function(req, token, refreshToken, profile, done){
    // console.log(profile.provider);

        const username = profile.displayName + "@" + profile.provider;
        //check if there is a login user
        const sid = req.cookies[cookieKey];
        if(!sid){
            User.findOne({username: username}).exec(function(err, user) {
                if(!user || user.length === 0){
                    const userObj = new User({username: username, authId: profile.id});
                    new User(userObj).save(function (err, usr){
                        if(err) return console.log(err)
                    });
                    navi = username;
                    const profileObj = new Profile({
                        username: username,
                        headline: "login by facebook",
                        following:[],
                        email: null,
                        zipcode: null,
                        avatar: null,
                        dob: new Date()
                        });
                    new Profile(profileObj).save(function (err, usr){
                        if(err) return console.log(err)
                    })
                }
                return done(null, profile)
            })
        } else {
            //if there is a local login, link them
            redis.hgetall(sid, function(err, userObj) {
                const localUser = userObj.username;
                navi = localUser;
                //console.log(navi);
                Article.updateMany({author:username}, { $set: { 'author': localUser}}, { new: true, multi: true }, function(){});
                Article.updateMany({'comments.author' : username}, { $set: {'comments.$.author': localUser}}, { new: true, multi: true }, function(){});
                Comment.updateMany({author:username}, { $set: { 'author': localUser}}, { new: true, multi: true }, function(){});
                Profile.findOne({username: username}).exec(function(err, profileData){
                    if(profileData){
                        const oldFollowingArr = profileData.following;
                        Profile.findOne({username: localUser}).exec(function(err, newProfile) {
                            if(newProfile){
                                //concat
                                const newFollowingArr = newProfile.following.concat(oldFollowingArr);
                                Profile.updateMany({username: localUser}, {$set: {'following': newFollowingArr}}, function(){})
                            }
                        });
                        //delete the profile record
                        Profile.updateMany({username: username}, {$set: {'following':[]}}, function(){})
                    }
                });
                User.findOne({username: localUser}).exec(function(err, user){
                    if(user){
                        let authObj = {};
                        authObj[`${profile.provider}`] = profile.displayName;
                        User.updateMany({username: localUser}, {$addToSet: {'auth': authObj}}, {new: true}, function(){})
                    }
                })
            });
            return done(null, profile)
        }
    }
));



const logout = (req,res) => {
    // const sessionKey = req.cookies[cookieKey];
    // delete sessionUser[sessionKey];
    // res.clearCookie(cookieKey);
    // // res.send({
    // //     result:"success"
    // // });
    // res.status(200).send("OK");
    if (req.isAuthenticated()) {
        req.session.destroy();
        req.logout();
        //corner case for link acount
        if(req.cookies[cookieKey] !== undefined){
            const sid = req.cookies[cookieKey];
            redis.del(sid);
            res.clearCookie(cookieKey);
            console.log('test');
        }
        res.status(200).send("OK")
    } else if(req.cookies[cookieKey] !== null){
        const sid = req.cookies[cookieKey];
        redis.del(sid);
        res.clearCookie(cookieKey);
        console.log('test');
        res.status(200).send("OK")
    }
};

const password = (req,res) => {
    const newPwd = req.body.password;
    const accountName = req.username;
    if(!newPwd) {
        res.status(400).send("dose not provide new password");
    }
    User.find({username: accountName},(error,users)=>{
        const user = users[0];
        const preSalt = user.salt;
        const preHash = user.hash;
        if(md5(newPwd + preSalt) === preHash){
            res.status(400).send("New password must be different");
        } else {
            const curSalt = md5(accountName+ new Date().getTime());
            const curHash = md5(newPwd + curSalt);

            User.updateMany({username: accountName}, {salt:curSalt , hash: curHash}, (error, doc) => {
                if (error) {
                    return console.error(error);
                }
                return res.status(200).send({username: accountName,salt: curSalt, hash: curHash})
            })
        }
    })
};

passport.serializeUser(function(user, done){
    done(null, user.id)
});

passport.deserializeUser(function(id,done){
    User.findOne({authId: id}).exec(function(err, user) {
        done(null, user)
    })
});


function isLoggedIn(req,res,next){
    if (req.isAuthenticated()) {
        const usrArr = req.user.username.split('@');
        const authObj = {};
        authObj[`${usrArr[1]}`] = usrArr[0];
        User.findOne({auth: authObj}).exec(function(err,user) {
            if(!user){
                req.username = req.user.username
            } else {
                req.username = user.username
            }
            next()
        })
    } else{
        const sid = req.cookies[cookieKey];
        if (!sid){
            return res.sendStatus(401)
        }
        redis.hgetall(sid, function(err, userObj) {
            if(err) throw err;
            if(userObj){
                console.log(sid + ' mapped to ' + userObj.username);
                req.username = userObj.username;
                next()
            }
            else{
                res.sendStatus(401)
            }
        })
    }

}

const successFun = (req,res) => {
    console.log('/////////////////');
    console.log(navi);
    res.redirect('https://numerous-rice.surge.sh/#/main/facebook');
};

const errorFun = (err,req,res,next) => {
    if(err) {
        res.status(400);
        res.send({err: err.message});
    }
};

const locationFun = (req, res, next) => {
    if(originHostUrl === ''){
        originHostUrl = req.headers.referer;
        console.log(originHostUrl);
    }
    next()
};

module.exports = app =>{
    app.use(cookieParser());
    app.use(locationFun);
    app.use(session({secret:'myscretisIamanidiot', resave: false, saveUninitialized: false}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/login/facebook', passport.authenticate('facebook', {scope:'email'}));
    app.use('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect:'/login/facebook'}), successFun, errorFun);
    app.post('/login', login);
    app.post('/register', register);
    app.use(isLoggedIn);
    app.use('/link/facebook', passport.authorize('facebook', {scope:'email'}));
    app.post('/unlink', unlink);
    app.post('/merge', merge);
    app.put('/password',password);
    app.put('/logout',logout);
};

