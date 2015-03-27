var React = require('react');

exports.loginPage = function (req, title, css) {
  if (!title) title = "Login";
  if (!css) css = "/css/login.css";
  return React.renderToStaticMarkup(
    <html>
    <head>
      <title>{title}</title>
      <link href="{css}" rel="stylesheet"/>
    </head>
    <body>
      <p>Please give your password to log in:</p>
      <form action="/login" method="post"> 
        <div> 
            <label>User</label>
            <input type="text" name="username" /> 
            <label>Password:</label> 
            <input type="password" name="password"/> 
        </div> 
        <div> 
            <input class="submit" type="submit" value="Log In"/> 
        </div> 
      </form>{req.flash('error')}
    </body> 
    </html> 
  );
}
