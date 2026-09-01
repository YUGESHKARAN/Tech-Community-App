const mongoose = require('mongoose');
const { DailyEventLog, UserContributions } = require('../models/performanceTracker/performanceTrackerSchema');
const { Author } = require('../models/blogAuthorSchema');

// ── GET /api/authors/:authorId/contributions?year=2026 ────────────────────────
/**
 * Returns the full contributions map for a given year.
 * Used by the heatmap — no event detail, just day → points.
 * Public: any authenticated user can view any author's heatmap.
 */

// const getContributions = async (req, res) => {
//   const { authorId } = req.params;
// console.log("getContributions called")
// // const { authorId } = req.user;
//   const year = Number(req.query.year) || new Date().getFullYear();

//   if (!mongoose.Types.ObjectId.isValid(authorId)) {
//     return res.status(400).json({ message: 'Invalid authorId' });
//   }

//   try {
//     const doc = await UserContributions.findOne(
//       { authorId, year },
//       'days totalCount year'
//     ).lean();

//     if (!doc) {
//       // no activity yet for this year — return empty map
//       return res.status(200).json({
//         year,
//         contributions: {},
//         totalCount: 0,
//       });
//     }

//     // convert Map → plain object for JSON serialisation
//     const contributions = Object.fromEntries(
//       Object.entries(doc.days).map(([monthDay, pts]) => [
//         `${year}-${monthDay}`, // "MM-DD" → "YYYY-MM-DD" for frontend
//         pts,
//       ])
//     );

    

//     return res.status(200).json({
//       year,
//       contributions,
//       totalCount: doc.totalCount,
//     });
//   } catch (err) {
//     console.error('getContributions error:', err.message);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// ── GET /api/authors/:authorId/streak ─────────────────────────────────────────
const getContributions = async (req, res) => {
  const { authorId } = req.params;
  const year = Number(req.query.year) || new Date().getFullYear();
  const tenantId = req?.user?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ message: 'tenantId required' });
  }

  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return res.status(400).json({ message: 'Invalid authorId' });
  }

  try {
    // remove .lean() so Mongoose Map methods are available
    const doc = await UserContributions.findOne(
      { authorId, tenantId, year },
      'days totalCount year'
    );

    if (!doc) {
      return res.status(200).json({
        year,
        contributions: {},
        totalCount: 0,
      });
    }

    // doc.days is a Mongoose Map — use .entries() iterator, not Object.entries()
    // Object.entries() on a Mongoose Map only picks up own enumerable props
    // which is why you only see 2 entries despite 3 existing in the DB
    const contributions = {};
    for (const [monthDay, pts] of doc.days) {
      contributions[`${year}-${monthDay}`] = pts; // "MM-DD" → "YYYY-MM-DD"
    }

    return res.status(200).json({
      year,
      contributions,
      totalCount: doc.totalCount,
    });
  } catch (err) {
    console.error('getContributions error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
/**
 * Returns streak fields from the Author document.
 * Also returns joinedYear (derived from _id ObjectId timestamp)
 * so the frontend year selector knows how far back to go.
 * Private: only the logged-in user sees their own streak.
 * Others see the heatmap but not streak numbers.
 */
const getStreakData = async (req, res) => {
  const { authorId } = req.query;
  const { authorId: requestingId, tenantId: requestTenantId } = req.user || {};

  if (!requestTenantId) {
    return res.status(401).json({ message: 'tenantId required' });
  }

  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return res.status(400).json({ message: 'Invalid authorId' });
  }

  try {
    const author = await Author.findOne(
      { _id: authorId, tenantId: requestTenantId },
      'currentStreak longestStreak lastActiveDate _id tenantId'
    ).lean();

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const isOwn = authorId === requestingId?.toString();

    // joinedYear derived from ObjectId creation timestamp
    const joinedYear = new mongoose.Types.ObjectId(authorId)
      .getTimestamp()
      .getFullYear();

    return res.status(200).json({
      streak:{joinedYear,
      // streak fields — only returned for own profile
      currentStreak:  isOwn ? (author.currentStreak  || 0) : null,
      longestStreak:  isOwn ? (author.longestStreak   || 0) : null,
      lastActiveDate: isOwn ? (author.lastActiveDate  || null) : null,}
    });
  } catch (err) {
    console.error('getStreakData error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/authors/:authorId/events?date=2026-08-19&page=1&limit=10 ─────────
/**
 * Returns paginated events for a specific day.
 * Triggered when the user clicks a day cell on the heatmap.
 * Events are stored newest-first in the array, so we slice by page.
 *
 * Returns:
 *   { date, totalPts, events: [...], total, page, hasMore }
 */
const getDailyEvents = async (req, res) => {
  const { authorId } = req.params;
  const { date, page = 1, limit = 10 } = req.query;
  const tenantId = req?.user?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ message: 'tenantId required' });
  }

  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return res.status(400).json({ message: 'Invalid authorId' });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'date query param required (YYYY-MM-DD)' });
  }

  const skip     = (Number(page) - 1) * Number(limit);
  const limitNum = Number(limit);

  try {
    // use aggregation to paginate the events sub-array efficiently
    const [result] = await DailyEventLog.aggregate([
      { $match: { authorId: new mongoose.Types.ObjectId(authorId), tenantId, date } },
      {
        $project: {
          date:     1,
          totalPts: 1,
          total:    { $size: '$events' },
          events: {
            $slice: ['$events', skip, limitNum],
          },
        },
      },
    ]);

    if (!result) {
      return res.status(200).json({
        date,
        totalPts: 0,
        events:   [],
        total:    0,
        page:     Number(page),
        hasMore:  false,
      });
    }

    return res.status(200).json({
      date,
      totalPts: result.totalPts,
      events:   result.events,
      total:    result.total,
      page:     Number(page),
      hasMore:  skip + result.events.length < result.total,
    });
  } catch (err) {
    console.error('getDailyEvents error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getContributions, getStreakData, getDailyEvents };