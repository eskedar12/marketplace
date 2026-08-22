import { formatPrice } from './formatters.js';

// Maps a notification's `type` + `data` (as stored by the backend) to
// a translated body string and where tapping it should navigate.
// Keeping this in one place means the bell dropdown and the full
// Notifications page render identically without duplicating logic.
export function notificationText(notification, t) {
  const { type, data = {} } = notification;

  switch (type) {
    case 'new_message':
      return {
        title: t('notifications.types.newMessageTitle'),
        body: t('notifications.types.newMessage', {
          name: data.senderName || '',
          listing: data.listingTitle || '',
        }),
        link: data.conversationId ? `/messages/${data.conversationId}` : '/messages',
      };
    case 'listing_sold':
      return {
        title: t('notifications.types.listingSoldTitle'),
        body: t('notifications.types.listingSold', {
          listing: data.listingTitle || '',
          name: data.buyerName || '',
        }),
        link: data.listingId ? `/listings/${data.listingId}` : '/my-listings',
      };
    case 'rating_received':
      return {
        title: t('notifications.types.ratingReceivedTitle'),
        body: t('notifications.types.ratingReceived', {
          name: data.raterName || '',
          score: data.score,
        }),
        link: '/profile',
      };
    case 'price_drop':
      return {
        title: t('notifications.types.priceDropTitle'),
        body: t('notifications.types.priceDrop', {
          listing: data.listingTitle || '',
          price: formatPrice(data.newPrice),
        }),
        link: data.listingId ? `/listings/${data.listingId}` : '/cart',
      };
    default:
      return { title: '', body: '', link: '/notifications' };
  }
}
