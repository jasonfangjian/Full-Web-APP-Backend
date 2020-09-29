const Profile = require('./model.js').Profile;

const getList = (req,res) => {
    let accountName;
    if(req.params.user){
        accountName = req.params.user;
    } else {
        accountName = req.username;
    }
    Profile.find({username: accountName}).exec(function (err, profile) {
        if (!profile || profile.length === 0) {
            res.status(400).send("No user");
            return;
        }
        const profileObj = profile[0];
        res.status(200).send({username: accountName, following: profileObj.following})
    });
};

const addFollowing = (req,res) => {
    const adduser = req.params.user;
    const accountName = req.username;
    if(!adduser){
        res.status(400).send('Does not provide the user to follow');
    }
    Profile.find({username:adduser}).exec(function(err,profile){
        if(!profile || profile.length === 0) {
            res.status(400).send('the user you wanted to add is not exist');
        } else {
            Profile.findOneAndUpdate({username: accountName},{ $addToSet: { following: adduser }}, {upsert: true, new: true}, function(err, profile){});
            Profile.find({username: accountName}).exec(function(err, profile){
                const profileObj = profile[0];
                res.status(200).send({username: accountName, following: profileObj.following})
            })
        }
    })
};

const unFollowing = (req,res) => {
    const unuser = req.params.user;
    const accountName= req.username;
    if(!unuser) {
        res.status(400).send('Dose not provide user to unfollow');
    }
    Profile.findOneAndUpdate({username: accountName}, { $pull: { following: unuser }}, {new: true }, function(err, profile){});
    Profile.find({username: accountName}).exec(function(err, profile){
        const profileObj = profile[0];
        res.status(200).send({username: accountName, following: profileObj.following})
    })
};

module.exports = app => {
    app.get('/following/:user?',getList);
    app.put('/following/:user',addFollowing);
    app.delete('/following/:user',unFollowing);
};
