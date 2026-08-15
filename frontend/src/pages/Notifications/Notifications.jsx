import React from 'react';

// NOTE: the backend doesn't have a notifications module yet (no
// notifications.routes/service/repository under src/modules), so this
// page currently renders an empty state rather than fetching real data.
// Once a notifications API exists, wire it up the same way Favorites
// pulls from favoritesApi.getMine().
export default function Notifications() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-extrabold text-ink mb-6">Notifications</h1>

      <div className="text-center py-16 border border-dashed border-line rounded-2xl">
        <p className="font-display font-bold text-lg text-ink">You're all caught up</p>
        <p className="text-ink/50 text-sm mt-1 font-body">
          New activity on your listings and messages will show up here.
        </p>
      </div>
    </div>
  );
}
