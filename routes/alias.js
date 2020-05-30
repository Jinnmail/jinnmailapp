

this.router.post('/', userAuth, this.registerAlias);
this.router.get('/', userAuth,  this.getRegisteredAlias);
this.router.get('/checkAlias', userAuth, this.getAlias);
this.router.post('/avail', userAuth, this.checkAvailability);
this.router.put('/status', userAuth, this.changeAliasStatus);
this.router.delete('/:aliasId', userAuth, this.deleteAlias);
this.router.get('/linkedUser', this.getAliasUser)

module.exports = router;