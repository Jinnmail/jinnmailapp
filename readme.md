## Project Created From:

[https://expressjs.com/en/starter/generator.html](https://expressjs.com/en/starter/generator.html)

## Dev

```
npm install
set environment variables below
npm start
```

This is the center of the data model,

```
proxyMail
    aliasId: 1
    senderAliasId: 2

alias
    aliasId: 1
    type: 'alias'

alias 
    aliasId: 2
    type: 'sender'
```

for local dev don't have to use pm2, so toggle

"start": "node ./bin/www",

// "start": "pm2 start ./bin/www --watch",

don't forget to put back to pm2 when deploy!!!!

## Environment Variables

```
DASHBOARD_URL=http://localhost:3001
DB_HOST=mongodb://host.docker.internal:27017/dev
# DB_HOST=mongodb://localhost/dev
# DB_HOST=mongodb+srv://username:password@xxxxlong...connectionstringxx.net/proddbnamegoeshere?retryWrites=true&w=majority
DB_USER=username
DB_PASSWORD=password
JM_EMAIL_DOMAIN=@dev.jinnmail.com
JM_REPLY_EMAIL_SUBDOMAIN=@reply.dev.jinnmail.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=abcd-111@groovy-dued-66666.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nNKE...extemelylongprivatekeygoesherelakjsdjf==\n-----END PRIVATE KEY-----\n
STRIPE_PUBLISHABLE_KEY=pk_test_x
STRIPE_SECRET_KEY=sk_test_xx
DOMAIN=http://localhost:3001
PRICE=price_x
PAYMENT_METHODS=card
JWT_SECRET=x
SENDGRID_API_KEY=SG._...
SENDGRID_WEBHOOK_API_STRING=x...
# Below this line for testing - not required
USER_EMAILS=comma space seperated list of jinnmail user addresses for testing
USER_RESET_PASSWORD_TOKENS=comma space separated for testing
USER_PASSWORDS=comma space separated list of hashed passwords for testing
USER_CODES=comman space separated list of verification codes for testing
ALIAS_ALIASES=comma space separated list of aliases for testing
ADMIN_PASSWORD=adminHASHEDpasswordhere for testing
```

### Docker

```
Install docker locally, however you do that.
docker build . --tag jinnmailapp
docker run --publish 3000:3000 --detach jinnmailapp
docker container ls
docker stop feca94bd374f
```

### Mongo
```
install mongo
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
```

### Testing

```
npm install mocha -g
...and/or... for debugging tests
npm install mocha --save-dev
Change your environment variables for dev
Seed database,
npm run seed
Run tests,
npm test
...or...to run a certain test
npm test -- -f "Use Case 1"
1 passing
```

## Prod

### First Deployment

```
create ubuntu 20.04 instance
git clone
cd jinnmailapp
sudo vim .env
set environmental variables similar to dev but with prod values and you don't need the ones used for testing.
when setting google variables make sure the blacklist sheets has programmatic access setup and use the associated values.
configure sendgrid inbound parse webhooks for both hosts
hosts: jinnmail.com, reply.jinnmail.com ..or.. for testing instance: test.jinnmail.com, reply.test.jinnmail.com, similar for dev
url: https://<api>/api/v1/parser/inbound?sendgrid_webhook_api_string=<x>
POST the raw, full MIME message  
npm run blacklist
npm run seed
install docker (optional, otherwise you have to install node 12.17.0 (https://cloud.google.com/nodejs/docs/setup)):
https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
sudo docker build . --tag jinnmailapp
sudo docker run --publish 3000:3000 --detach jinnmailapp
if you cannot use docker (requires server has 4GB memory) use screen and npm start 
or if using pm2, $ pm2 start bin/www and to restart $ pm2 restart www, no screen is required with pm2
to stop pm2 app
$ pm2 ls
$ pm2 stop 
install and configure apache port forwarding:
sudo apt install apache2
cd /var/www/html
sudo rm index.html
port forwarding to 3000 from 80:
add these two lines to existing
/etc/apache2/sites-available/000-default.conf
sites-enabled follows sites-available, sites-available seems to be the important one
<virtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
    ProxyPass / http://127.0.0.1:3000/ <--------------- new don't include arrows
    ProxyPassReverse / http://127.0.0.1:3000/ <-------- new 
now enable proxy mode also
sudo a2enmod ssl
sudo a2enmod proxy
sudo a2enmod proxy_balancer
sudo a2enmod proxy_http
disable apache2 cache
sudo vim /var/www/html/.htaccess
#disable cache
#Initialize mod_rewrite
RewriteEngine On
<FilesMatch "\.(html|htm|js|css)$">
  FileETag None
  <IfModule mod_headers.c>
    Header unset ETag
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "Wed, 12 Jan 1980 05:00:00 GMT"
  </IfModule>
</FilesMatch>
sudo service apache2 restart
follow certbot instructions for using https
https://certbot.eff.org/lets-encrypt/ubuntufocal-apache
exit
```

### Subsequent Deployments

```
cd jinnmailapp 
sudo git pull
sudo docker container ls
sudo docker stop feca94bd374f
sudo docker build . --tag jinnmailapp
sudo docker run --publish 3000:3000 --detach jinnmailapp
or if not using docker
use screen and npm start
... or don't use screen and use 
$ npm start
... or if using pm2
git pull
pm2 ls
pm2 stop www
pm2 start bin/www
no need for screen with pm2
```

### Troubleshoot Deployment

```
To debug for some error, you probably have to work outside of the docker container, 
which means you have to stop the docker container and install node on the remote server and do console.log().
https://cloud.google.com/nodejs/docs/setup
```

## Database Backups

### Database backup to local

```
Go to Atlas Web interface and they generate a command from the command line tools
execute the command, downloads a dump folder to your local
```

### Database restore to remote

```
Same reverse process as backup
```

### Database restore to local

```
cd to innermost directory of dump folder
mongorestore -d newdbname .
```

## OLD BEYOND THIS POINT

```
Deployment:
https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true
Open papertrail logs quickly from command:
heroku addons:open papertrail
Turn heroku off:
heroku ps:scale web=0 // turn off
heroku ps:scale web=1 // turn on
```
