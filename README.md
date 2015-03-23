This enables multi-user authentication and sessions for cozy-light.  
This works either by using the set-password command for each user or if the username
contains an @ sign checking against the dovecot user.
It also installs americano plugins for cozy-light apps to enable multiple user support.
(multi-emails, cozydb-multi for emails)
Additionally, a login.css will be read from `~/.cozy-light/login/public/css, if found.
Uses signed cookies for sessions (see options under cookie-session readme.). 
