// this is dbarticle.js 
var Article = require('./model.js').Article;
var Profile = require('./model.js').Profile;
var Comment = require('./model.js').Comment;
var User = require('./model.js').User;
var md5 = require('md5');

function find(req, res) {
     findByAuthor(req.params.user, function(items) {
          res.send({items})
     })
}



function findByAuthor(author, callback) {
	Article.find({ author: author }).exec(function(err, items) {
		console.log('There are ' + items.length + ' entries for ' + author)
		var totalLength = 0
		items.forEach(function(article) {
			totalLength += article.text.length
		})
		console.log('average length', totalLength / items.length)		
		callback(items)
	})
}

//////////////////////////////
// remove these examples 

// new Article({ id: 1, author: 'mrj1', img: null, date: new Date().getTime(), text: 'This is my first article'}).save()
// new Article({ id: 2, author: 'mrj1', img: null, date: new Date().getTime(), text: 'This is my second article'}).save()
// new Article({ id: 3, author: 'jmg3', img: null, date: new Date().getTime(), text: "This is Max's article"}).save(function() {
//      console.log('done with save')
//      Article.find().exec(function(err, items) {
//           console.log("There are " + items.length + " articles total in db")
//
//           findByAuthor('mrj1', function() {
//               findByAuthor('jmg3', function() {
//                   console.log('complete')
//                   process.exit()
//               })
//           })
//      })
// })

//////////////////////////////
// remove the above example code
//////////////////////////////

const init = function(req,res){
	User.find(function(err,users){
		if(users.length !== 0) return;
		else{
			var curTime = new Date().getTime();
			new User({
				username: 'jf58',
				salt:md5('jf58'+curTime),
				hash:md5('123'+ md5('jf58'+curTime))
			}).save();
		}
		Profile.find(function(err,profiles){
			if(profiles.length !== 0) return;
			else{
				new Profile({
					username: 'jf58',
					headline:'Jian Fang @ Rice University',
					following:['test1','test2','test3'],
					email:'jf58@rice.edu',
					zipcode: '77005',
					dob:new Date().getTime(),
					avatar:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840'
				}).save();
				new Profile({
					username:'test1',
					headline: 'this is test 1',
					following: [],
					email:'test1@rice.edu',
					zipcode:'77005',
					avatar: 'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840'
				}).save();
				new Profile({
					username:'test2',
					headline:'this is test 2',
					following: [],
					email: 'test2@rice.edu',
					zipcode: '77005',
					avatar: 'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840'
				}).save();
				new Profile({
					uesrname: 'test3',
					headline:'this is test 3',
					following: [],
					email:'test3@rice.edu',
					zipcode:'77005',
					avatar:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840'
				}).save();
			}

		})
	});

	Article.find(function(err,articles){
		if(articles.length !== 0 ) return;
		else{
			new Article({
				id:1,
				author:'jf58',
				text:'this is post 1',
				img: 'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840',
				comments:[new Comment({
					commentId:1,
					date: new Date().getTime(),
					text:'comment 1',
					author:'jf58',
				}).save(),
					new Comment({
						commentId: 2,
						date: new Date().getTime(),
						text:'comment 2',
						author:'jf58',
					}).save(),
					new Comment({
						commentId:3,
						date: new Date().getTime(),
						text:'comment 3',
						author:'jf58',
					}).save()]
			}).save();
			new Article({
					id:2,
					author:'jf58',
					text:'this is post2',
				    img:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840',
					comments:[new Comment({
						commentId:1,
						date:new Date().getTime(),
						text:'this is comment',
						author:'jf58',
					}).save()],
				}
			).save();
			new Article({
					id:3,
					author:'jf58',
					text:'this is post3',
				    img:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840',
					comments:[new Comment({
						commentId:1,
						date:new Date().getTime(),
						text:'this is comment',
						author:'jf58',
					}).save()],
				}
			).save();
			new Article({
					id:4,
					author:'jf58',
					text:'this is post4',
				    img:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840',
					comments:[new Comment({
						commentId:1,
						date:new Date().getTime(),
						text:'this is comment',
						author:'jf58',
					}).save()],
				}
			).save();
			new Article({
					id:5,
					author:'jf58',
					text:'this is post5',
				    img:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840',
					comments:[new Comment({
						commentId:1,
						date:new Date().getTime(),
						text:'this is comment',
						author:'jf58',
					}).save()],
				}
			).save();
		}
	});
	res.send('database initialized');
};

// new Article({
// 		id:6,
// 		author:'test1',
// 		text:'this is test1 post1',
// 		img:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840',
// 		comments:[new Comment({
// 			commentId:1,
// 			date:new Date().getTime(),
// 			text:'this is comment',
// 			author:'test1',
// 		}).save()],
// 	}
// ).save();
//
// new Article({
// 		id:7,
// 		author:'test2',
// 		text:'this is test2 post1',
// 		img:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840',
// 		comments:[new Comment({
// 			commentId:1,
// 			date:new Date().getTime(),
// 			text:'this is comment',
// 			author:'test2',
// 		}).save()],
// 	}
// ).save();
//
// new Article({
// 		id:8,
// 		author:'test3',
// 		text:'this is test3 post1',
// 		img:'https://specials-images.forbesimg.com/imageserve/5cfea19734a5c4000847fb8a/416x416.jpg?background=000000&cropX1=749&cropX2=4156&cropY1=436&cropY2=3840',
// 		comments:[new Comment({
// 			commentId:1,
// 			date:new Date().getTime(),
// 			text:'this is comment',
// 			author:'test3',
// 		}).save()],
// 	}
// ).save();

module.exports=(app)=> {
	app.get('/',init);
	app.get('/find/:user', find);
};
