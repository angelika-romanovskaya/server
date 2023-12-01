const Router = require('express')
const router = new Router();
const roleController = require('../controller/roleController')

router.get('/addrole', roleController.add)

module.exports = router