const express = require("express")
const router = express.Router()
const userRoutes = require("./user")
const user2Routes = require("./user2")
const aliasRoutes = require("./alias")
const adminRoutes = require("./admin")
const parserRoutes = require("./parser")
const paymentRoutes = require("./payment")
const inviteRoutes = require("./invite")
const proxymailRoutes = require("./proxymail")

router.use("/api/v1/user", userRoutes);
router.use("/api/v2/user", user2Routes);
router.use("/api/v1/alias", aliasRoutes);
router.use("/api/v1/admin", adminRoutes)
router.use("/api/v1/parser", parserRoutes)
router.use("/api/v1/payment", paymentRoutes);
router.use("/api/v1/invite", inviteRoutes);
router.use("/api/v1/proxymail", proxymailRoutes);
router.all('/*', (req, res) => {
    res.status(400).send('are you supposed to be here?');
})

module.exports = router