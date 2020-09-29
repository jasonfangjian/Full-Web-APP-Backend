const User = require('./model.js').User;
const Article = require('./model.js').Article;
const Profile = require('./model.js').Profile;

const cookieParser = require('cookie-parser');
const uploadImage = require('./uploadCloudinary.js');

const getHeadline = (req,res) => {
    let accountName;
    if(req.params.users){
        accountName = req.params.users.split(',');
    } else {
        accountName = [req.username];
    }

    Profile.find({username: {$in: accountName}}).exec(function(err,profile){
        let headlines = [];
        if(!profile || profile.length === 0){
            res.status(400).send('user dose not exist');
            return;
        }
        profile.forEach(item => {headlines.push({username: item.username, headline: item.headline})});
        res.status(200).send({headlines:headlines});
    })
};

const updateHeadline = (req, res) => {
    const accountName = req.username;
    // console.log(accountName);
    const headline = req.body.headline;
    // console.log(headline);
    if(!headline) {
        res.status(400).send('Dose not provide headline');
    }
    Profile.findOneAndUpdate({username: accountName},{$set: {headline: headline}},{ new: true }, function(err, profile){
        res.status(200).send({username: accountName, headline: headline});
    })
};

const getEmail = (req,res) => {
    let accountName;
    if(req.params.user){
        accountName = req.params.user;
    } else {
        accountName = req.username;
    }
    Profile.find({username: accountName}).exec(function(err,profile){
        if(!profile || profile.length === 0) {
            res.status(400).send("User dose not exist");
            return;
        }
        res.status(200).send({username: accountName, email: profile[0].email})
    })
};

const updateEmail = (req,res) =>{
    const accountName = req.username;
    const email = req.body.email;
    if(!email) {
        res.status(400).send('Did not provide email');
    }
    Profile.findOneAndUpdate({username: accountName},{$set: {email:email}}, { new: true }, function(err, profile){
        res.status(200).send({username: accountName, email: email});
    })
};

const getZipCode = (req,res) => {
    let accountName;
    if(req.params.user){
        accountName = req.params.user;
    } else {
        accountName = req.username;
    }
    Profile.find({username:accountName}).exec(function(err,profile){
        if(!profile || profile.length === 0 ){
            res.status(400).send('User does not exist');
            return;
        }
        res.status(200).send({username: accountName, zipcode:profile[0].zipcode})
    })
};

const updateZipCode = (req,res) => {
    const accountName = req.username;
    const zipcode = req.body.zipcode;
    if(!zipcode){
        res.status(400).send('Did not provide ZipCode');
    }
    Profile.findOneAndUpdate({username: accountName},{$set:{zipcode:zipcode}}, { new: true }, function(err, profile){
        res.status(200).send({username: accountName,zipcode: zipcode});
    })
};

const getAvatars = (req,res) => {
    let accountNames;
    if(req.params.users){
        accountNames = req.params.users.split(',');
    } else {
        accountNames = [req.username];
    }
    Profile.find({username: {$in: accountNames}}).exec(function(err,profile){
        let avatars = [];
        if(!profile || profile.length === 0){
            res.status(400).send('Users do not exist');
            return
        }
        profile.forEach(item => {avatars.push({username: item.username, avatar: item.avatar})})
        res.status(200).send({avatars:avatars});
    })
};

const updateAvatar = (req,res) => {
    const accountName = req.username;
    const avatar = req.fileurl;
    if(!avatar) {
        res.status(400).send('Did not provide avatar');
    }
    Profile.findOneAndUpdate({username:accountName},{$set:{avatar: avatar}},{ new: true }, function(err, profile) {
        res.status(200).send({username: accountName, avatar: avatar});
    })
};

const getDob = (req,res) => {
    const accountName = req.username;
    Profile.find({username: accountName}).exec(function(err, profile){
        res.status(200).send({username: accountName, dob: profile[0].dob})
    })
};



module.exports = app => {
    app.get('/headline/:users?',getHeadline);
    app.put('/headline',updateHeadline);

    app.get('/email/:user?',getEmail);
    app.put('/email',updateEmail);

    app.get('/zipcode/:user?',getZipCode);
    app.put('/zipcode',updateZipCode);

    app.get('/avatar/:users?',getAvatars);
    app.put('/avatar',uploadImage('avatar'),updateAvatar);


    app.get('/dob',getDob);
};
