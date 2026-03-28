import React, { useEffect, useState } from 'react';
import supabase from '../config/supabase_client';

const ProductGrid = ({ searchQuery, selectedCategory, onAddToCart }) => {
  const [izdelki, setIzdelki] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIzdelki = async () => {
      setLoading(true);
      let query = supabase.from('izdelki').select('*');

      if (selectedCategory) {
        query = query.or(`kategorija.eq."${selectedCategory}",podkategorija.eq."${selectedCategory}"`);
      }

      if (searchQuery) {
        query = query.ilike('ime', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error) setIzdelki(data);
      setLoading(false);
    };

    fetchIzdelki();
  }, [searchQuery, selectedCategory]);

  if (loading) return <div className="text-center py-20 animate-pulse">Pripravljamo ponudbo...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {izdelki.map((p) => (
        <div key={p.id} className="bg-white p-4 border rounded-xl shadow-sm hover:shadow-md transition-all group">
          <div className="h-40 flex items-center justify-center mb-4 overflow-hidden">
            <img src={p.slika_url} alt={p.ime} className="max-h-full group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h4 className="text-xs font-bold h-10 overflow-hidden uppercase tracking-tighter">{p.ime}</h4>
          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-black">{p.cena} €</span>
            <button 
              onClick={() => onAddToCart(p)}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-black transition-colors"
            >
              V KOŠARICO
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;