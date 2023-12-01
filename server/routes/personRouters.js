const Router = require('express')
const router = new Router();
const personController = require('../controller/personController')

router.post('/getpersoninfo', personController.getInfo)
router.post('/updatepersoninfo', personController.updateInfo)

module.exports = router