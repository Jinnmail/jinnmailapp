const express = require("express")
const router = express.Router()
const userRoutes = require("./user")
const aliasRoutes = require("./alias")
const adminRoutes = require("./admin")
const parserRoutes = require("./parser")

router.use("/api/v1/user", userRoutes);
router.use("/api/v1/alias", aliasRoutes);
router.use("/api/v1/admin", adminRoutes)
router.use("/api/v1/parser", parserRoutes)
router.all('/*', (req, res) => {
    res.status(400).send('are you supposed to be here?');
})

module.exports = router