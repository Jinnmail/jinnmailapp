const randToken = require('rand-token');

module.exports = {

     refreshTokenGenerator: function() {
        return new Promise((resolve ,reject) => {
            var refresh_token = randToken.uid(241);
            resolve(refresh_token);
        })
     }

}

