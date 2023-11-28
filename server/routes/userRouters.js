const Router = require('express')
const router = new Router();
const userController = require('../controller/userController')

router.post('/login', userController.login)
router.post('/registration', userController.registration)

module.exports = router