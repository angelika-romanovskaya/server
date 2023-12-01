const Router = require('express')
const router = new Router();
const clientController = require('../controller/clientController')

router.get('/getclients', clientController.get)
router.post('/blockedClient', clientController.blocked)
router.post('/unblockedClient', clientController.unblocked)
router.post('/deleteClient', clientController.delete)
router.post('/restoreClient', clientController.restore)

module.exports = router