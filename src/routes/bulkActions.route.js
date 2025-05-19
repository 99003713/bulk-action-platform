const express = require('express');
const router = express.Router();

// Controllers
const { createBulkActionController } = require('../controllers/createBulkAction.controller');
const { listBulkActions } = require('../controllers/listBulkActions.controller');
const { getBulkActionStatus } = require('../controllers/getBulkActionStatus.controller');
const { getBulkActionStats } = require('../controllers/getBulkActionStats.controller');

// Validators
const { validateCreateBulkAction } = require('../validators/createBulkAction.validator');
const { validateGetBulkActionById } = require('../validators/getBulkActionById.validator');


// Routes
router.post('/', validateCreateBulkAction, createBulkActionController);
router.get('/', listBulkActions);
router.get('/:actionId', validateGetBulkActionById, getBulkActionStatus);
router.get('/:actionId/stats', validateGetBulkActionById, getBulkActionStats);

module.exports = router;