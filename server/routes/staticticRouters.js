const Router = require('express')
const router = new Router();
const statisticController = require('../controller/statisticController')

router.get('/summaryBid', statisticController.summaryBid)
router.get('/sumPrice', statisticController.sumPrice)
router.get('/getChartManagerAdmin', statisticController.getChartManagerAdmin)
router.get('/getChartClientAdmin', statisticController.getChartClientAdmin)
router.post('/getReport', statisticController.getReport)
router.post('/topManagers', statisticController.topManagers)

module.exports = router