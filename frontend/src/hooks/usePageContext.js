import { useEffect, useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { listingsApi, categoriesApi } from '../api/listings.api.js';

// Mirrors routes/AppRouter.jsx. Kept as a flat list (not derived from
// the router itself) so this hook can run outside the <Routes> tree —
// the widget lives in App.jsx as a sibling of <AppRouter/>, not nested
// inside a matched Route, so useParams() there would always be empty.
const ROUTES = [
  { path: '/', page: 'home' },
  { path: '/listings', page: 'listings' },
  { path: '/category/:slug', page: 'category' },
  { path: '/login', page: 'login' },
  { path: '/register', page: 'register' },
  { path: '/listings/:id/edit', page: 'editListing' },
  { path: '/listings/:id', page: 'listingDetail' },
  { path: '/users/:id', page: 'publicProfile' },
  { path: '/help', page: 'help' },
  { path: '/help/how-to-buy', page: 'howToBuy' },
  { path: '/help/how-to-sell', page: 'howToSell' },
  { path: '/help/payment-safety', page: 'paymentSafety' },
  { path: '/help/contact', page: 'contactSupport' },
  { path: '/safety', page: 'safety' },
  { path: '/about', page: 'about' },
  { path: '/mission', page: 'mission' },
  { path: '/terms', page: 'terms' },
  { path: '/privacy', page: 'privacy' },
  { path: '/sell', page: 'sell' },
  { path: '/my-listings', page: 'myListings' },
  { path: '/profile', page: 'profile' },
  { path: '/favorites', page: 'favorites' },
  { path: '/notifications', page: 'notifications' },
  { path: '/cart', page: 'cart' },
  { path: '/orders/complete', page: 'orderComplete' },
  { path: '/orders', page: 'orders' },
  { path: '/messages/:id', page: 'messageThread' },
  { path: '/messages', page: 'messages' },
];

function matchRoute(pathname) {
  for (const route of ROUTES) {
    const match = matchPath({ path: route.path, end: true }, pathname);
    if (match) return { page: route.page, params: match.params };
  }
  return { page: 'notFound', params: {} };
}

// Returns { page, pageDetails } for whatever route the app is currently
// on. `pageDetails` starts empty and, for the two pages where it's
// genuinely useful (a specific category or a specific listing), fills
// in from data the page itself would already be fetching — a plain GET
// on an already-public endpoint, not anything account-specific.
export function usePageContext() {
  const location = useLocation();
  const { page, params } = matchRoute(location.pathname);
  const [pageDetails, setPageDetails] = useState({});

  useEffect(() => {
    let cancelled = false;
    setPageDetails({});

    if (page === 'category' && params.slug) {
      categoriesApi
        .getBySlug(params.slug)
        .then((res) => {
          if (!cancelled && res?.data?.name) {
            setPageDetails({ categoryName: res.data.name });
          }
        })
        .catch(() => {});
    }

    if (page === 'listingDetail' && params.id) {
      listingsApi
        .getOne(params.id)
        .then((res) => {
          const listing = res?.data;
          if (!cancelled && listing?.title) {
            setPageDetails({
              listingTitle: listing.title,
              listingPrice: listing.price != null ? `${listing.price} ETB` : undefined,
            });
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [page, params.slug, params.id]);

  return { page, pageDetails };
}
