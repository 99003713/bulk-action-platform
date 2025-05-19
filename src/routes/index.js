const express = require('express');
const router = express.Router();
const bulkActionRoutes = require('./bulkActions.route');

router.use('/bulk-actions', bulkActionRoutes);

module.exports = router;