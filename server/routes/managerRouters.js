const Router = require('express')
const router = new Router();
const managerController = require('../controller/managerController')

router.post('/addmanager', managerController.add)
router.get('/getmanagers', managerController.get)
router.post('/deleteManager', managerController.delete)

module.exports = router