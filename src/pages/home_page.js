import React, { useState, useEffect } from 'react';
import supabase from '../config/supabase_client';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProductGrid from '../components/ProductGrid';
import Checkout from '../components/Checkout';
import AuthModal from '../components/AuthModal';


function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showSuccessOrder, setShowSuccessOrder] = useState(false);

  // Preverjanje seje in statusa naročila ob nalaganju
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Preverjanje, če se je uporabnik vrnil po uspešnem naročilu
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      setShowSuccessOrder(true);
      setCartItems([]); // Izpraznimo košarico
      setTimeout(() => {
        setShowSuccessOrder(false);
        window.history.replaceState({}, document.title, "/");
      }, 5000);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Odjava uspešna.");
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const bgStyle = {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${process.env.PUBLIC_URL + '/background.jpg'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
  };

  return (
      <div style={bgStyle} className="text-[#1a1a1a]">      
      
      {/* Animacija zahvale za naročilo */}
      {showSuccessOrder && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in zoom-in slide-in-from-top-8 duration-500">
          <div className="bg-[#1a1a1a] text-white px-8 py-4 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-4">
            <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-xl animate-bounce">✓</div>
            <div>
              <p className="font-black uppercase italic tracking-tighter text-lg leading-none">Hvala za naročilo!</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Burgar je že v Hofru.</p>
            </div>
          </div>
        </div>
      )}

      <Navbar 
        onSearchChange={setSearchQuery} 
        cartCount={cartCount} 
        onCartClick={() => setShowCheckout(true)}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        user={user}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {showCheckout ? (
        <Checkout items={cartItems} setItems={setCartItems} onBack={() => setShowCheckout(false)} />
      ) : (
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 flex flex-col md:flex-row gap-12">
          <aside className="w-full md:w-56 flex-shrink-0">
            <Sidebar onCategorySelect={setSelectedCategory} activeCategory={selectedCategory} />
          </aside>
          <main className="flex-grow">
            <header className="mb-10">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
                {selectedCategory || 'Ponudba'}
              </h2>
              <div className="h-1.5 w-12 bg-red-600"></div>
            </header>
            <ProductGrid 
              searchQuery={searchQuery} 
              selectedCategory={selectedCategory} 
              onAddToCart={(p) => setCartItems(prev => {
                const exists = prev.find(i => i.id === p.id);
                if (exists) return prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i);
                return [...prev, {...p, quantity: 1}];
              })}
            />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;