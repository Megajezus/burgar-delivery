import React, { useState } from 'react';

const Checkout = ({ items, setItems, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('Plačilo po povzetju');
  const [deliveryLocation, setDeliveryLocation] = useState('Jedilnica');
  const [roomNumber, setRoomNumber] = useState('');

  const subtotal = items.reduce((acc, item) => acc + (item.cena * item.quantity), 0);
  const deliveryFee = subtotal * 0.10;
  const total = subtotal + deliveryFee;

  // Funkcija za brisanje izdelka
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Pridobimo zadnji izdelek v košarici za prikaz slike
  const lastItem = items.length > 0 ? items[items.length - 1] : null;

  const handleCashPayment = () => {
    console.log("Dostava v:", deliveryLocation, roomNumber);
    window.location.href = window.location.origin + '?status=success';
  };

  const handleStripePayment = async () => {
    const STRIPE_SECRET_KEY = 'sk_test_51TE8cc3RkWatYxex24rESnrtb7hRNXW6SWpvlF4N4qUDzcebYYqimJPLPczYAlMExVsN5wtP0wx4ZOBiXN9f2IdV00wNx3NOKh';
    try {
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': window.location.origin + '?status=success',
          'cancel_url': window.location.origin + '?status=cancel',
          'line_items[0][price_data][currency]': 'eur',
          'line_items[0][price_data][product_data][name]': `Naročilo: ${deliveryLocation} ${roomNumber}`,
          'line_items[0][price_data][unit_amount]': Math.round(total * 100).toString(),
          'line_items[0][quantity]': '1',
        }),
      });
      const session = await response.json();
      if (session.url) window.location.href = session.url;
    } catch (error) {
      alert("Napaka pri Stripe plačilu.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <button onClick={onBack} className="mb-6 text-gray-500 font-bold flex items-center gap-2 hover:text-red-600 transition-colors">
        ← NAZAJ V TRGOVINO
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-black mb-6 uppercase italic tracking-tighter">Tvoja košarica</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100 group">
                <div className="flex items-center gap-4">
                  {/* Gumb za brisanje */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-600 transition-colors text-xl font-light"
                    title="Odstrani izdelek"
                  >
                    ✕
                  </button>
                  <div className="font-bold uppercase tracking-tight text-lg">
                    {item.ime} <span className="text-gray-400 ml-2">x{item.quantity}</span>
                  </div>
                </div>
                <div className="font-black text-red-600">{(item.cena * item.quantity).toFixed(2)} €</div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed">
                <p className="text-gray-400 font-medium">Vaša košarica je prazna.</p>
                <button onClick={onBack} className="mt-4 text-red-600 font-bold underline">Vrni se v trgovino</button>
              </div>
            )}

            {/* SLIKA ZADNJEGA IZDELKA POD SEZNAMOM */}
            {lastItem && (
              <div className="mt-12 p-6 bg-white rounded-3xl border border-gray-100 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Zadnje dodano v košarico</span>
                <img 
                  src={lastItem.slika_url} 
                  alt={lastItem.ime} 
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
                <h4 className="mt-4 font-black italic uppercase text-xl">{lastItem.ime}</h4>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-red-600 h-fit">
          <h3 className="text-xl font-black mb-6 border-b pb-4 italic tracking-tighter">PODATKI O NAROČILU</h3>
          
          <div className="mb-6 space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Kam dostavimo?</label>
              <select 
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-red-600 font-bold transition-all"
              >
                <option value="Jedilnica">Jedilnica</option>
                <option value="Učilnica">Učilnica</option>
              </select>
            </div>

            {deliveryLocation === 'Učilnica' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Številka učilnice</label>
                <input 
                  type="text" 
                  placeholder="Npr. 102" 
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full border-2 border-red-100 p-3 rounded-xl text-sm outline-none focus:border-red-600 bg-red-50/30 font-bold"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-2xl">
            <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-widest">
              <span>Vrednost:</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-widest">
              <span>Dostava (10%):</span>
              <span>{deliveryFee.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-3 border-t-2 border-gray-200 mt-2">
              <span className="tracking-tighter italic text-black">SKUPAJ:</span>
              <span className="text-red-600">{total.toFixed(2)} €</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Način plačila</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm outline-none font-bold mb-4"
            >
              <option value="Plačilo po povzetju">Plačilo ob prevzemu</option>
              <option value="Kartica (Stripe)">Kreditna kartica</option>
            </select>

            <button 
              onClick={paymentMethod === 'Kartica (Stripe)' ? handleStripePayment : handleCashPayment}
              disabled={items.length === 0}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl uppercase tracking-tighter active:scale-95 ${
                items.length === 0 ? 'bg-gray-200 cursor-not-allowed text-gray-400 shadow-none' :
                paymentMethod === 'Kartica (Stripe)' ? 'bg-[#635bff] text-white hover:bg-[#4539ad]' : 'bg-red-600 text-white hover:bg-black'
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