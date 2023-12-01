const Router = require('express')
const router = new Router();
const bidController = require('../controller/bidController')

router.post('/addbid', bidController.add)
router.post('/getBid', bidController.get)
router.post('/viewedBid', bidController.viewed)
router.post('/deletedBid', bidController.deleted)
router.post('/approveBid', bidController.approve)
router.post('/rejectBid', bidController.reject)

module.exports = router