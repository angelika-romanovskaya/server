const Router = require('express')
const router = new Router();
const userRouter = require('./userRouters')

router.use('/user',userRouter)

module.exports = router