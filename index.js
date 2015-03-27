var fs = require('fs');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;                 
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var randomstring = require('randomstring');
var flash = require('connect-flash');
var jsx = require('node-jsx').install({extension: '.jsx'});
var ui = require('./ui');

passport.use(new LocalStrategy(
  function(username, password, callback) {
    getHash(username, function(hash) {
      bcrypt.compare(password, hash, function(err, res) {
        if(err) {
          callback(err);
        } else if(res) {
          callback(null, {user:username});
        } else {
          callback(null, false, { message: 'Wrong password' });
        }
      });
    });
  }
));

passport.serializeUser(function(user, callback) {
  var configPath = module.exports.configPath;
  console.log('serializeUser user  is ' + JSON.stringify(user));
  fs.writeFileSync(configPath+"_"+user.id, JSON.stringify(user));
  callback(null, 'config');
});

passport.deserializeUser(function(id, callback) {
  var configPath = module.exports.configPath;
  console.log('deserializeUser id is ' + id);
  var user = fs.readFileSync(configPath+"_"+id, 'utf8');
  callback(null, JSON.parse(user));
});

var setPassword = function(user, password) {
  var configPath = module.exports.configPath;
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  fs.writeFileSync(configPath+"_"+user, hash);
}

getHash = function(user, cb) {
  var config = module.exports.config;
  var configPath = module.exports.configPath;
  cb(fs.readFileSync(configPath+"_"+user, 'utf8'));  
}

module.exports.configureAppServer = function(app, config, routes, callback) {
  app.use(cookieParser(randomstring.generate()));
  app.use(cookieSession({
    secret: randomstring.generate(),
    maxage: 1000 * 60 * 60 * 24 * 7,
    signed: true
  }));
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());
  app.use(function (req, res, next) {
    if (req.url === '/login' || req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/login");
    }
  });

  var title = "Login";
  var css = "/css/login.css";
  app.get('/login', function (req, res, next) {
    res.send(ui.loginPage(req));
  });

  app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    })
  );

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  callback();
};

module.exports.getTemplate = function() {
  return ' \
<p> \
<a href="/logout"/>Logout</a> \
</p> \
  ';
};

module.exports.configure = function(options, config, program) {
  module.exports.config = config;
  module.exports.configPath = options.config_path;
  module.exports.hash = config.password;

  program
    .command('set-password <user> <password>')
    .description('Set password for user')
    .action(setPassword);
};
