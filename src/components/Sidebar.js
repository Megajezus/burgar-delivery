import React, { useEffect, useState } from 'react';
import supabase from '../config/supabase_client';

const Sidebar = ({ onCategorySelect, activeCategory }) => {
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // Shranjuje, kateri deli menija so odprti

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        // Pridobimo vse tri nivoje iz baze
        const { data, error } = await supabase
          .from('izdelki')
          .select('vrsta, kategorija, podkategorija');

        if (error) throw error;

        // Organiziramo podatke v drevesno strukturo
        const tree = {};
        data.forEach(item => {
          const v = item.vrsta || "Ostalo";
          const k = item.kategorija || "Splošno";
          const p = item.podkategorija || "";

          if (!tree[v]) tree[v] = {};
          if (!tree[v][k]) tree[v][k] = new Set();
          if (p) tree[v][k].add(p);
        });

        // Spremenimo Set v Array za lažje izrisovanje
        const finalTree = {};
        for (const v in tree) {
          finalTree[v] = {};
          for (const k in tree[v]) {
            finalTree[v][k] = Array.from(tree[v][k]);
          }
        }
        setMenuData(finalTree);
      } catch (err) {
        console.error("Napaka pri meniju:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Funkcija za odpiranje/zapiranje nivojev
  const toggle = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <div className="p-4 text-sm text-gray-500 italic">Nalaganje oddelkov...</div>;

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden select-none">
      <div 
        onClick={() => onCategorySelect("")}
        className="p-4 bg-red-600 text-white font-bold cursor-pointer text-center hover:bg-red-700 transition-colors"
      >
        VSI IZDELKI
      </div>

      <div className="divide-y divide-gray-100">
        {Object.keys(menuData).map(vrsta => (
          <div key={vrsta} className="flex flex-col">
            {/* 1. Nivo: VRSTA (npr. Prigrizki, Hrana) */}
            <div 
              onClick={() => toggle(vrsta)}
              className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 font-bold text-gray-700 text-xs uppercase tracking-wider"
            >
              <span>{vrsta}</span>
              <span>{expanded[vrsta] ? '−' : '+'}</span>
            </div>

            {expanded[vrsta] && (
              <div className="bg-white">
                {Object.keys(menuData[vrsta]).map(kat => (
                  <div key={kat} className="border-l-2 border-red-100 ml-2">
                    {/* 2. Nivo: KATEGORIJA (npr. Slano, Sladko) */}
                    <div 
                      onClick={() => {
                        toggle(vrsta + kat);
                        onCategorySelect(kat); // Klik na kategorijo filtrira vse v tej kategoriji
                      }}
                      className={`p-2 pl-4 flex justify-between items-center cursor-pointer text-sm hover:text-red-600 ${activeCategory === kat ? 'text-red-600 font-bold' : 'text-gray-600'}`}
                    >
                      <span>{kat}</span>
                      <span className="text-[10px]">{expanded[vrsta + kat] ? '▼' : '▶'}</span>
                    </div>

                    {/* 3. Nivo: PODKATEGORIJA (npr. Čips, Oreščki) */}
                    {expanded[vrsta + kat] && (
                      <ul className="pb-2">
                        {menuData[vrsta][kat].map(sub => (
                          <li 
                            key={sub}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCategorySelect(sub);
                            }}
                            className={`pl-8 pr-4 py-1.5 cursor-pointer text-xs transition-colors hover:bg-red-50 ${activeCategory === sub ? "text-red-600 font-bold" : "text-gray-500"}`}
                          >
                            • {sub}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;