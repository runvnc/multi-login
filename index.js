var fs = require('fs');
var read = require('read');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var randomstring = require('randomstring');
var flash = require('connect-flash');

passport.use(new LocalStrategy(
  function(username, password, callback) {
    console.log(password);
    console.log(module.exports.hash);
    getHash(user, function(hash) {
      bcrypt.compare(password, hash, function(err, res) {
        if(err) {
          callback(err);
        } else if(res) {
          callback(null, module.exports.config);
        } else {
          callback(null, false, { message: 'Wrong password' });
        }
      });
    });
  }
));

passport.serializeUser(function(user, callback) {
  callback(null, 'config');
});

passport.deserializeUser(function(id, callback) {
  callback(null, module.exports.config);
});

var setPassword = function() {
  var config = module.exports.config;
  var configPath = module.exports.configPath;
  var promptMsg = 'Set your new Password: ';
  read({ prompt: promptMsg, silent: true }, function(err, password) {
    var salt = bcrypt.genSaltSync(10);
    module.exports.hash = bcrypt.hashSync(password, salt);
    config.password = module.exports.hash;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Password properly stored');
  });
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

  app.get('/login', function (req, res, next) {
    res.send(' \
<html> \
<head> \
  <title>Cozy Light Log In</title> \
  <style type="text/css" media="screen"> \
    @font-face { \
      font-family: mavenpro; \
      src: url(../signika-light.ttf); \
    } \
    body, p { \
      font-family: mavenpro; \
    } \
  </style> \
 \
</head> \
<body> \
  <p>Please give your password to log in:</p> \
  <form action="/login" method="post"> \
    <div> \
        <input type="hidden" name="username" value="me" /> \
        <label>Password:</label> \
        <input type="password" name="password"/> \
    </div> \
    <div> \
        <input class="submit" type="submit" value="Log In"/> \
    </div> \
  </form>' + req.flash('error') + ' \
</body> \
</html> \
    ');
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
    .command('set-password')
    .description(
        'Set basic password for the current Cozy Light instance (username ' +
        'is always me)')
    .action(setPassword);
};
