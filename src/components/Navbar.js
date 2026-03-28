import React from 'react';

const Navbar = ({ onSearchChange, cartCount, onCartClick, onLoginClick, onLogout, user }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter cursor-pointer">
            Burgar<span className="text-red-600"> DELIVERY</span>
          </h1>
        </div>

        <div className="flex-1 max-w-md relative group">
          <input 
            type="text" 
            placeholder="Išči izdelke..." 
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-2xl py-2.5 px-5 pl-11 outline-none focus:ring-2 focus:ring-red-600/20 transition-all text-sm font-medium"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          {/* DINAMIČEN GUMB ZA PRIJAVO / ODJAVO */}
          {user ? (
            <button 
              onClick={onLogout}
              className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-black transition-colors px-4 py-2 border border-red-100 rounded-lg"
            >
              Odjava
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors px-4 py-2"
            >
              Prijava
            </button>
          )}

          <button onClick={onCartClick} className="relative bg-[#1a1a1a] text-white p-3 rounded-xl shadow-lg active:scale-95 transition-transform">
            <span className="text-xl leading-none italic">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;