var mongoose = require('mongoose')

// replace this "localhost" value with the one from heroku/mlab
// var url ="mongodb://heroku_zd19j8q1:g8t2tl4d94ba1kf75eosudvc7t@ds053429.mlab.com:53429/heroku_zd19j8q1";
//mongodb+srv://heroku_zd19j8q1:<jasonfang9761@Fj>@cluster-zd19j8q1.qfnnk.mongodb.net/heroku_zd19j8q1?retryWrites=true&w=majority
var url = "mongodb+srv://heroku_zd19j8q1:jasonfang9761@Fj@cluster-zd19j8q1.qfnnk.mongodb.net/heroku_zd19j8q1?retryWrites=true&w=majority"

if (process.env.MONGODB_URI) {
	url = process.env.MONGODB_URI;
}

mongoose.connect(url, { useNewUrlParser: true ,useFindAndModify:false})

///////////////////////////////////////////////////
mongoose.connection.on('connected', function() {
	console.log('Mongoose connected to ' + url)
})
mongoose.connection.on('error', function(err) {
	console.error('Mongoose connection error: ' + err)
})
mongoose.connection.on('disconnected', function() {
	console.log('Mongoose disconnected')
})

process.once('SIGUSR2', function() {
	shutdown('nodemon restart', function() {
		process.kill(process.pid, 'SIGUSR2')
	})
})
process.on('SIGINT', function() {
	shutdown('app termination', function() {
		process.exit(0)
	})
})
process.on('SIGTERM', function() {
	shutdown('Heroku app shutdown', function() {
		process.exit(0)
	})
})
function shutdown(msg, callback) {
	mongoose.connection.close(function() {
		console.log('Mongoose disconnected through ' + msg)
		callback()
	})
}
///////////////////////////////////////////////////

