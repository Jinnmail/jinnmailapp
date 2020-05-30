const express = require("express")
const router = express.Router()
const userRoutes = require("./user")
// const aliasRoutes = require("./routes/alias")
// const adminRoutes = require("./routes/admin")

router.use("/api/v1/user", userRoutes);
// router.use("/api/v1/alias", aliasRoutes);
// router.use("/api/v1/admin", adminRoutes)

module.exports = router