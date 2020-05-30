

module.exports = {

    responseHandler: function(message, data, res) {
        return new Promise((resolve, reject) => {
            let response = {
                status: 200,
                message: message,
                data: data,
                error: ''
            };
            resolve(res.status(200).send(response));
        })
    }, 

    redirectViaResponse: function(path, res) {
        return new Promise((resolve, reject) => {
            resolve(res.redirect(path));
        })
    }, 

    //for handling http errors
    httpErrorHandler: function(err, res) {
        console.log(err)
        return new Promise((resolve, reject) => {
            let error = {};
            error.status = err.code;
            error.error = err.msg.message || err.msg.errmsg || err.msg;
            error.result = "";
            resolve(res.status(err.code).send(error));
        })
    }

}