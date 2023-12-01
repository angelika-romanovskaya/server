const Router = require('express')
const router = new Router();
const documentController = require('../controller/documentController')

router.post('/createDocument', documentController.create)
router.post('/saveDocument', documentController.get)

module.exports = router