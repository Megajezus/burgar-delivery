import React, { useState } from 'react';

const Checkout = ({ items, setItems, onBack }) => {
  // --- SHRANJEVANJE IZBIRE UPORABNIKA (State) ---
  const [paymentMethod, setPaymentMethod] = useState('Plačilo po povzetju');
  const [deliveryLocation, setDeliveryLocation] = useState('Jedilnica');
  const [roomNumber, setRoomNumber] = useState('');

  // --- IZRAČUN CEN ---
  // Seštejemo ceno vseh izdelkov v košarici
  const subtotal = items.reduce((suma, izdelek) => suma + (izdelek.cena * izdelek.quantity), 0);
  // Izračunamo 10% stroška dostave
  const deliveryFee = subtotal * 0.10;
  // Končni znesek
  const total = subtotal + deliveryFee;

  // --- POMOŽNE FUNKCIJE ---
  
  // Funkcija, ki odstrani izdelek iz seznama
  const removeItem = (id) => {
    const noviSeznam = items.filter(izdelek => izdelek.id !== id);
    setItems(noviSeznam);
  };

  // Najdemo zadnji dodan izdelek, da ga pokažemo na dnu
  const lastItem = items.length > 0 ? items[items.length - 1] : null;

  // --- PLAČILNI POSTOPKI ---

  // 1. Plačilo z gotovino (Preprosto preusmerimo na uspeh)
  const handleCashPayment = () => {
    alert("Naročilo oddano! Dostava v: " + deliveryLocation + " " + roomNumber);
    window.location.href = window.location.origin + '?status=success';
  };

  // 2. Plačilo s kartico (Stripe)
  const handleStripePayment = async () => {
    const KLJUC = 'sk_test_51TE8cc3RkWatYxex24rESnrtb7hRNXW6SWpvlF4N4qUDzcebYYqimJPLPczYAlMExVsN5wtP0wx4ZOBiXN9f2IdV00wNx3NOKh';
    
    try {
      // Pošljemo podatke o plačilu na Stripe strežnik
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KLJUC}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': window.location.origin + '?status=success',
          'cancel_url': window.location.origin + '?status=cancel',
          'line_items[0][price_data][currency]': 'eur',
          'line_items[0][price_data][product_data][name]': `Naročilo: ${deliveryLocation} ${roomNumber}`,
          'line_items[0][price_data][unit_amount]': Math.round(total * 100).toString(), // Stripe zahteva cente
          'line_items[0][quantity]': '1',
        }),
      });

      const session = await response.json();
      if (session.url) window.location.href = session.url; // Preusmeritev na Stripe stran
    } catch (napaka) {
      alert("Nekaj je šlo narobe pri povezavi s Stripe.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Gumb za nazaj */}
      <button onClick={onBack} className="mb-6 text-gray-500 font-bold hover:text-red-600">
        ← NAZAJ V TRGOVINO
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEVA STRAN: Seznam izdelkov */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-black mb-6 uppercase italic">Tvoja košarica</h2>
          
          <div className="space-y-4">
            {items.map(izdelek => (
              <div key={izdelek.id} className="bg-white p-6 rounded-2xl shadow-sm flex justify-between border">
                <div className="flex items-center gap-4">
                  {/* Gumb za brisanje (X) */}
                  <button onClick={() => removeItem(izdelek.id)} className="text-gray-300 hover:text-red-600 text-xl">
                    ✕
                  </button>
                  <div className="font-bold uppercase">
                    {izdelek.ime} <span className="text-gray-400 ml-2">x{izdelek.quantity}</span>
                  </div>
                </div>
                <div className="font-black text-red-600">{(izdelek.cena * izdelek.quantity).toFixed(2)} €</div>
              </div>
            ))}

            {/* Če je košarica prazna */}
            {items.length === 0 && <p className="text-center py-10 text-gray-400">Vaša košarica je prazna.</p>}

            {/* Prikaz zadnjega izdelka (slika) */}
            {lastItem && (
              <div className="mt-12 p-6 bg-white rounded-3xl border flex flex-col items-center">
                <span className="text-[10px] font-black text-gray-300 uppercase mb-4">Zadnje dodano</span>
                <img src={lastItem.slika_url} alt={lastItem.ime} className="w-48 h-48 object-contain" />
                <h4 className="mt-4 font-black italic uppercase text-xl">{lastItem.ime}</h4>
              </div>
            )}
          </div>
        </div>

        {/* DESNA STRAN: Povzetek in dostava */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-red-600">
          <h3 className="text-xl font-black mb-6 border-b pb-4 italic">PODATKI O NAROČILU</h3>
          
          <div className="mb-6 space-y-5">
            {/* Lokacija dostave */}
            <label className="text-[10px] font-black text-gray-400 uppercase block">Kam dostavimo?</label>
            <select 
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="w-full border-2 p-3 rounded-xl font-bold"
            >
              <option value="Jedilnica">Jedilnica</option>
              <option value="Učilnica">Učilnica</option>
            </select>

            {/* Če je izbrana učilnica, pokaži polje za številko */}
            {deliveryLocation === 'Učilnica' && (
              <input 
                type="text" 
                placeholder="Številka učilnice (npr. 102)" 
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full border-2 border-red-100 p-3 rounded-xl bg-red-50/30 font-bold"
              />
            )}
          </div>

          {/* Izračun končne cene */}
          <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-2xl">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>Vrednost:</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>Dostava (10%):</span>
              <span>{deliveryFee.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-3 border-t-2 mt-2">
              <span className="italic">SKUPAJ:</span>
              <span className="text-red-600">{total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Izbira plačila in gumb */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase">Način plačila</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border-2 p-3 rounded-xl font-bold mb-4"
            >
              <option value="Plačilo po povzetju">Plačilo ob prevzemu</option>
              <option value="Kartica (Stripe)">Kreditna kartica</option>
            </select>

            <button 
              onClick={paymentMethod === 'Kartica (Stripe)' ? handleStripePayment : handleCashPayment}
              disabled={items.length === 0}
              className={`w-full py-5 rounded-2xl font-black text-lg uppercase transition-all shadow-xl ${
                items.length === 0 ? 'bg-gray-200 text-gray-400' :
                paymentMethod === 'Kartica (Stripe)' ? 'bg-indigo-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              Potrdi naročilo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;