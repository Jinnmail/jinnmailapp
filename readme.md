## Project Created From:

[https://expressjs.com/en/starter/generator.html](https://expressjs.com/en/starter/generator.html)

## Dev

This is the center of the data model,

```
proxyMail
    aliasId: 
    senderAliasId:
```

### Docker
```
Install docker locally, however you do that.
docker build . --tag jinnmailapp
docker run --publish 3000:3000 --detach jinnmailapp
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
install docker:
https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
npm run blacklist
npm run seed
install and configure apache port forwarding:
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
sudo service apache2 restart
```

### Subsequent Deployments
```
To do.

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