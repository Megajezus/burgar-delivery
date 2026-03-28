import React, { useState } from 'react';
import supabase from '../config/supabase_client';

const AuthModal = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', ime: '', priimek: '', telefon: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (isRegister) {
      // 1. Registracija v Auth sistem
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setErrors({ general: authError.message });
      } else if (authData.user) {
        // 2. Shranjevanje v public.users tabelo
        const { error: dbError } = await supabase.from('users').insert([
          { 
            id: authData.user.id, 
            ime: formData.ime, 
            priimek: formData.priimek, 
            telefon: formData.telefon,
            email: formData.email 
          }
        ]);
        if (dbError) setErrors({ general: "Napaka pri shranjevanju podatkov." });
        else alert("Registracija uspešna! Preverite email.");
      }
    } else {
      // Prijava
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) setErrors({ general: "Napačna e-pošta ali geslo." });
      else onClose();
    }
    setLoading(false);
  };

  // Funkcija za pozabljeno geslo
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ general: "Prosimo, najprej vnesite svoj e-poštni naslov." });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: window.location.origin,
    });
    
    if (error) {
      setErrors({ general: error.message });
    } else {
      alert("Povezava za ponastavitev gesla je bila poslana na vaš e-naslov.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const inputStyle = "w-full border p-2 rounded focus:border-red-500 outline-none";
  const errorStyle = "text-[10px] text-red-600 mb-1 font-semibold block";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg w-[400px] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600 italic uppercase">
          {isRegister ? 'Ustvari račun' : 'Prijava'}
        </h2>

        {errors.general && <span className={errorStyle}>{errors.general}</span>}

        <form onSubmit={handleAuth} className="space-y-3">
          {isRegister && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-tight text-[10px]">Ime</label>
                <input type="text" className={inputStyle} required
                  onChange={(e) => setFormData({...formData, ime: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-tight text-[10px]">Priimek</label>
                <input type="text" className={inputStyle} required
                  onChange={(e) => setFormData({...formData, priimek: e.target.value})} />
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-tight text-[10px]">Telefonska številka</label>
              <input type="tel" className={inputStyle}
                onChange={(e) => setFormData({...formData, telefon: e.target.value})} />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 font-bold uppercase tracking-tight text-[10px]">E-poštni naslov</label>
            <input type="email" className={inputStyle} required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-bold uppercase tracking-tight text-[10px]">Geslo</label>
            <input type="password" className={inputStyle} required
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
            
            {/* Gumb za pozabljeno geslo - prikaže se samo pri Prijavi */}
            {!isRegister && (
              <div className="text-right mt-1">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] text-gray-400 font-bold uppercase hover:text-red-600 transition-colors"
                >
                  Ste pozabili geslo?
                </button>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-3 rounded-md font-bold hover:bg-black transition-all mt-4 uppercase tracking-widest">
            {loading ? 'Nalaganje...' : isRegister ? 'REGISTRACIJA' : 'PRIJAVA'}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          {isRegister ? 'Že imate račun?' : 'Še niste registrirani?'}
          <button onClick={() => setIsRegister(!isRegister)} className="text-red-600 ml-1 underline">
            {isRegister ? 'Prijavite se' : 'Ustvarite ga tukaj'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;