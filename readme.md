```
Project Created From:
https://expressjs.com/en/starter/generator.html




Deployment:
https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true




Database Backup to Local:
Go to Atlas Web interface and they generate a command from the command line tools
execute the command, downloads a dump folder to your local




Database Restore remote:
Same reverse process as backup




Database Restore to local:
cd to innermost directory of dump folder
mongorestore -d newdbname .




Run blacklist script:
locally, 
npm run blacklist
on heroku, 
heroku run bash
npm run blacklist




Run seed script:
same as running blacklist script replacing blacklist with seed




Open papertrail logs quickly from command:
heroku addons:open papertrail




Turn heroku off:
heroku ps:scale web=0 // turn off
heroku ps:scale web=1 // turn on

```