const Article = require('./model.js').Article;
const Comment = require('./model.js').Comment;
const Profile = require('./model.js').Profile;
const User = require('./model.js').User;
const ObjectId = require('mongoose').Types.ObjectId;
const md5 = require('md5');
const mongoose = require('mongoose');
const uploadImage = require('./uploadCloudinary.js');
const cookieParser = require('cookie-parser');
const cookieKey = 'sid';

function getArticle(req, res){
    const id = req.params.id;
    if(id){
        Profile.findOne({username: id}).exec(function(err,profile) {
            if(!profile){
                getById(req, res, id);
            }else{
                getByAuthor(req, res, id);
            }

        });
    }else{
        // console.log(req.username);
        Profile.findOne({username: req.username}).exec(function(err,profile){
            if(profile){
                let users = profile.following;
                users.push(req.username);
                getByAuthors(req, res, users);
            }else{
                res.status(404).send({result: "No such user!"});
            }
        })
    }
}
function getById(req, res, id){
    if(mongoose.Types.ObjectId.isValid(id)){
        Article.findById(id).exec(function(err,article){
            if(article){
                res.status(200).send({articles: [article]});
            }else{
                res.json({articles: []});
            }
        })
    }

}

function getByAuthor(req, res, username){
    Article.find({author: username}).sort({date: -1}).limit(10).exec(function(err,articles){
        if(articles){
            res.statusCode = 200;
            res.json({articles: articles});
        }else{
            res.json({articles: []});
        }
    });
}

function getByAuthors(req, res, users){
    Article.find({author: {$in : users}}).sort({date: -1}).limit(10).exec(function(err,articles){
        if(articles){
            res.statusCode = 200;
            res.json({articles: articles});
        }else{
            res.json({articles: []});
        }
    });
}

const updateArticle = (req,res) => {
    if(!req.params.id){
        res.status(400).send('Did not Provide ID');
    } else {
        // Article.find(ObjectId(req.params.id)).exec(function(err,articles){
           Article.findById(req.params.id).exec(function(err,articles){
               console.log(articles);
            if(!articles || articles.length === 0){
                res.status(401).send("Wrong ID");
                return;
            } else if(req.body.commentId === "-1"){
                const commentId = md5(req.username + new Date().getTime());
                const commentObj = new Comment({commentId: commentId,author: req.username, date: new Date(), text: req.body.text});
                new Comment(commentObj).save(function (err, comments){
                    if(err) return console.log(err);
                });
                Article.findByIdAndUpdate(req.params.id, {$addToSet: {comments: commentObj}},{upsert: true, new: true}, function(err,articles){});
                Article.findById(req.params.id).exec(function (err, articles) {
                    // console.log('test');
                    res.status(200).send({articles: articles})
                })
            } else if(req.body.commentId){
                Comment.find({commentId: req.body.commentId}).exec(function (err,comments) {
                    if(!comments || comments.length === 0) {
                        res.status(401).send("Wrong comment ID");
                        return;
                    } else if(comments[0].author !== req.username){
                        res.status(401).send("Don't own this comment");
                    } else {
                        Comment.findOneAndUpdate({commentId:req.body.commentId},{$set: {text: req.body.text}},{new: true}, function(err,comments){});
                        Article.findOneAndUpdate({_id: req.params.id, 'comments.commentId': req.body.commentId}, { $set: { 'comments.$.text': req.body.text }}, { new: true }, function(err, articles){});//???
                        Article.findById(req.params.id).exec(function(err, articles){
                            res.status(200).send({articles: articles})
                        })
                    }
                })
            } else {
                if(articles.author !== req.username){
                    res.status(401).send("Don't own this article");
                    return;
                }
                Article.findByIdAndUpdate(req.params.id, { $set: { text: req.body.text }}, { new: true }, function(err, articles){
                    res.status(200).send({articles: articles});
                })
            }
        })
    }
};

const postArticle = (req,res) => {
    if(!req.body.text){
        res.status(400).send("No text");
        return;
    }
    let img = null;
    if(req.fileurl){
        img = req.fileurl;
    }
    const articleObj = new Article({text: req.body.text, author: req.username, img:img, date:new Date().getTime(), comments:[]});
    new Article(articleObj).save(function (err, articles){
        if(err) return console.log(err);
        res.status(200).send({articles: [articles]})
    })
};

module.exports = (app) => {
    app.get('/articles/:id?', getArticle);
    app.put('/articles/:id', updateArticle);
    app.post('/article',uploadImage('img'), postArticle);
};