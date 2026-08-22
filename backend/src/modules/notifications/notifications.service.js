const notificationsRepository = require('./notifications.repository');

// Every other module (messages, orders, ratings, listings) calls this
// to raise a notification. Keeping the create call behind one function
// here — rather than every module importing the repository directly —
// means the "what event fires what type + data shape" contract lives
// in one place.
//
// Failures here are logged but never thrown: a notification is a nice-
// to-have side effect of e.g. sending a message or completing a
// payment, and must never roll back or fail the actual action it's
// attached to.
async function notify(userId, type, data) {
  try {
    return await notificationsRepository.create({ user_id: userId, type, data });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to create "${type}" notification for user ${userId}:`, err.message);
    return null;
  }
}

async function getForUser(userId) {
  const [notifications, unreadCount] = await Promise.all([
    notificationsRepository.listByUser(userId),
    notificationsRepository.countUnread(userId),
  ]);
  return { notifications, unreadCount };
}

async function getUnreadCount(userId) {
  const count = await notificationsRepository.countUnread(userId);
  return { count };
}

async function markRead(id, userId) {
  return notificationsRepository.markRead(id, userId);
}

async function markAllRead(userId) {
  return notificationsRepository.markAllRead(userId);
}

module.exports = { notify, getForUser, getUnreadCount, markRead, markAllRead };
