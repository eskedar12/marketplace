import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useLanguage } from '../hooks/useLanguage.js';

import Home from '../pages/Home/index.jsx';
import Listings from '../pages/Listings/index.jsx';
import CategoryPage from '../pages/Category/index.jsx';
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import ListingDetail from '../pages/ListingDetail/index.jsx';
import CreateListing from '../pages/CreateListing/index.jsx';
import EditListing from '../pages/CreateListing/EditListing.jsx';
import Inbox from '../pages/Chat/Inbox.jsx';
import Thread from '../pages/Chat/Thread.jsx';
import Profile from '../pages/Profile/index.jsx';
import PublicProfile from '../pages/Profile/PublicProfile.jsx';
import Favorites from '../pages/Favorites/Favorites.jsx';
import Notifications from '../pages/Notifications/Notifications.jsx';
import Cart from '../pages/Cart/index.jsx';
import Orders from '../pages/Orders/Orders.jsx';
import OrderComplete from '../pages/Orders/OrderComplete.jsx';

// MyListings doesn't have its own top-level folder in the requested
// structure — it's seller-account content, so it lives alongside the
// other account pages under Profile/.
import MyListings from '../pages/Profile/MyListings.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/listings/:id" element={<ListingDetail />} />
      <Route path="/users/:id" element={<PublicProfile />} />

      <Route
        path="/sell"
        element={
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings/:id/edit"
        element={
          <ProtectedRoute>
            <EditListing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-listings"
        element={
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/complete"
        element={
          <ProtectedRoute>
            <OrderComplete />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages/:id"
        element={
          <ProtectedRoute>
            <Thread />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-700">{t('notFound.title')}</h1>
      <p className="text-ink/50 font-body mt-2">{t('notFound.body')}</p>
    </div>
  );
}