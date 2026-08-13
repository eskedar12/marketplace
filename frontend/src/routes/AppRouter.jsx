import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';

import Home from '../pages/Home/index.jsx';
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import ListingDetail from '../pages/ListingDetail/index.jsx';
import CreateListing from '../pages/CreateListing/index.jsx';
import EditListing from '../pages/CreateListing/EditListing.jsx';
import Inbox from '../pages/Chat/Inbox.jsx';
import Thread from '../pages/Chat/Thread.jsx';
import Profile from '../pages/Profile/index.jsx';
import PublicProfile from '../pages/Profile/PublicProfile.jsx';

// MyListings doesn't have its own top-level folder in the requested
// structure — it's seller-account content, so it lives alongside the
// other account pages under Profile/.
import MyListings from '../pages/Profile/MyListings.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-700">Page not found</h1>
      <p className="text-ink/50 font-body mt-2">That page doesn't exist.</p>
    </div>
  );
}
