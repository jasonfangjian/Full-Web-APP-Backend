// this is model.js 
var mongoose = require('mongoose');
require('./db.js');

var commentSchema = new mongoose.Schema({
	commentId: String,
	author: String,
	date: Date,
	text: String
});

var articleSchema = new mongoose.Schema({
	author: String,
	img: String,
	date: Date,
	text: String,
	comments: [ commentSchema ]
});

var userSchema = new mongoose.Schema({
	username: String,
	salt: String,
	hash: String,
	auth: [],
	authId: String
});

var profileSchema = new mongoose.Schema({
	username: String,
	headline: String,
	following: [String],
	dob: Date,
	email: String,
	zipcode: String,
	avatar: String
});


exports.Article = mongoose.model('article', articleSchema);
exports.Comment = mongoose.model('comment', commentSchema);
exports.User = mongoose.model('User', userSchema);
exports.Profile = mongoose.model('Profile', profileSchema);

