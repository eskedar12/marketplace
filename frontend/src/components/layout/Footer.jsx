import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-display font-bold text-lg text-juniper mb-3">ReGebeya</h3>
            <p className="text-sm font-body text-ink/60 leading-relaxed">
              Every kinda thing, for every kinda person. Ethiopia's premier trusted marketplace to buy and sell used goods locally.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-ink mb-3 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm font-body text-ink/70">
              <li><a href="/" className="hover:text-mustard">Home</a></li>
              <li><a href="/sell" className="hover:text-mustard">Sell an Item</a></li>
              <li><a href="/messages" className="hover:text-mustard">Inbox Messages</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-ink mb-3 uppercase tracking-wider">Ethiopia Locations</h4>
            <p className="text-sm font-body text-ink/60">
              Serving Addis Ababa, Adama, Hawassa, Bahir Dar, Dire Dawa, and all of Ethiopia.
            </p>
          </div>
        </div>
        <div className="border-t border-line pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-ink/50 font-body">
          <span>&copy; {new Date().getFullYear()} ReGebeya. All rights reserved.</span>
          <span className="mt-2 md:mt-0">Built with trust and care in Ethiopia.</span>
        </div>
      </div>
    </footer>
  );
}
