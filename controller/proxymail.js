const proxymailModel = require('../models/proxymail');

module.exports = {
  getProxymail: async function(req, res) {
    try {
      const data = await proxymailModel.find({aliasId: req.body.aliasId})
      let response = {
        status: 200,
        message: 'proxymail',
        data: data,
        error: ''
      };
      res.status(200).send(response);
    } catch (err) {
      let error = {};
      error.status = 500;
      error.error = err.msg;
      error.result = "";
      res.status(err.status).send(error);
    }
  }
}