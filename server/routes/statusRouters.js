const Router = require('express')
const router = new Router();
const statusController = require('../controller/statusController')

router.get('/addstatus', statusController.add)

module.exports = router