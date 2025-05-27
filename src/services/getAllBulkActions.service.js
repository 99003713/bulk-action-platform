const BulkAction = require('../models/bulkAction.model');
const BulkActionTarget = require('../models/bulkActionTarget.model');
const { logger } = require('../utils/logger');

exports.getAllBulkActions = async ({ page = 1, limit = 10, status }) => {
  try {
    logger.info(`Fetching bulk actions - Page: ${page}, Limit: ${limit}, Status: ${status}`);
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const bulkActions = await BulkAction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await BulkAction.countDocuments(filter);

    const enriched = await Promise.all(
      bulkActions.map(async (action) => {
        const stats = await BulkActionTarget.aggregate([
          { $match: { bulkActionId: action._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const counts = stats.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {});

        const users = await BulkActionTarget.find({ bulkActionId: action._id })
          // .limit(5)
          .select('userId status error')
          .lean();

        return {
          ...action,
          targetStats: {
            total: users.length,
            pending: counts['pending'] || 0,
            success: counts['success'] || 0,
            failed: counts['failed'] || 0,
            skipped: counts['skipped'] || 0,
            retrying: counts['retrying'] || 0,
          },
          users
        };
      })
    );

    return {
      page,
      limit,
      totalCount,
      data: enriched
    };
  } catch (error) {
    logger.error(`Error fetching bulk actions: ${error.message}`);
    throw new Error('Error fetching bulk actions: ' + error.message);
  }
};