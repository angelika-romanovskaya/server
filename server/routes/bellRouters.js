const Router = require('express')
const router = new Router();
const bellController = require('../controller/bellController')

router.post('/addBell', bellController.add)
router.get('/getbell', bellController.get)
router.post('/deleteCalls', bellController.delete)

module.exports = router