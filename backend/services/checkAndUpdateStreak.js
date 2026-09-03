// utils/checkAndUpdateStreak.js
const { Author } = require('../models/blogAuthorSchema');

const getTodayIST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const getYesterdayIST = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const checkAndUpdateStreak = async (authorId, tenantId) => {
  if (!authorId || !tenantId) return;

  const today     = getTodayIST();
  const yesterday = getYesterdayIST();

  const author = await Author.findOne(
    { _id: authorId, tenantId },
    'currentStreak longestStreak lastActiveDate'
  );
  if (!author) return;

  // already recorded activity today — no update needed
  if (author.lastActiveDate === today) return;

  const isConsecutive = author.lastActiveDate === yesterday;
  const newStreak     = isConsecutive ? (author.currentStreak || 0) + 1 : 1;
  const newLongest    = Math.max(newStreak, author.longestStreak || 0);

  await Author.updateOne(
    { _id: authorId, tenantId },
    {
      $set: {
        currentStreak:  newStreak,
        longestStreak:  newLongest,
        lastActiveDate: today,
      },
    }
  );
};

module.exports = { checkAndUpdateStreak };