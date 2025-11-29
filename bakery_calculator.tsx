import { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Receipt, Package } from 'lucide-react';
import logoImage from './assets/logo.jpg';
import qrImage from './assets/lilac_ig.jpg';

interface Item {
  id: number;
  name: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  totalCost: number;
  totalSelling: number;
  profit: number;
  margin: number;
}

const BakeryCalculator = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [currentItem, setCurrentItem] = useState<{ 
    name: string; 
    costPrice: string; 
    sellingPrice: string; 
    quantity: number | string;
  }>({ 
    name: '', 
    costPrice: '', 
    sellingPrice: '', 
    quantity: 1 
  });
  const [customerName, setCustomerName] = useState('');
  const [customerSource, setCustomerSource] = useState('walk-in');
  const [referralText, setReferralText] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('');
  const [showBill, setShowBill] = useState(false);
  const [roundOff, setRoundOff] = useState(true);



  const addItem = () => {
    const quantityNum = typeof currentItem.quantity === 'string' ? parseInt(currentItem.quantity) : currentItem.quantity;
    if (currentItem.name && currentItem.sellingPrice && quantityNum > 0) {
      const costPrice = parseFloat(currentItem.costPrice) || 0;
      const sellingPrice = parseFloat(currentItem.sellingPrice);
      const quantity = quantityNum;
      
      setItems([...items, { 
        ...currentItem,
        costPrice,
        sellingPrice,
        quantity,
        id: Date.now(),
        totalCost: costPrice * quantity,
        totalSelling: sellingPrice * quantity,
        profit: (sellingPrice - costPrice) * quantity,
        margin: costPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice * 100) : 0
      }]);
      setCurrentItem({ name: '', costPrice: '', sellingPrice: '', quantity: 1 });
    }
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };



  const subtotal = items.reduce((sum, item) => sum + item.totalSelling, 0);
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);
  const deliveryChargeAmount = delivery && deliveryCharge ? parseFloat(deliveryCharge) : 0;
  const grandTotal = subtotal + deliveryChargeAmount;
  const finalTotal = roundOff ? Math.round(grandTotal) : grandTotal;
  const roundOffAmount = finalTotal - grandTotal;

  const generateBill = () => {
    setShowBill(true);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-900 mb-2">🧁 The Lilac Confectionery</h1>
          <p className="text-purple-700 text-lg">Freshly Baked, Made with Love</p>
        </div>

        {!showBill ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Panel - Item Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                <ShoppingCart className="mr-2" /> Add Items
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-800 mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400"
                  placeholder="Enter customer name"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-800 mb-2">Customer Source</label>
                <select
                  value={customerSource}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
                >
                  <option value="walk-in">Walk-in</option>
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="referral">Referral</option>
                </select>
              </div>

              {customerSource === 'referral' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-purple-800 mb-2">Referral Details</label>
                  <input
                    type="text"
                    value={referralText}
                    onChange={(e) => setReferralText(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="Referred by..."
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={delivery}
                    onChange={(e) => setDelivery(e.target.checked)}
                    className="mr-3 w-5 h-5 accent-purple-500"
                  />
                  <span className="text-sm font-semibold text-purple-800">Delivery Required</span>
                </label>
              </div>

              {delivery && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">Delivery Charge (₹)</label>
                    <input
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400"
                      placeholder="Enter delivery charge"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">Mode of Delivery</label>
                    <input
                      type="text"
                      value={deliveryMode}
                      onChange={(e) => setDeliveryMode(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400"
                      placeholder="e.g., Dunzo, Swiggy, Self"
                    />
                  </div>
                </div>
              )}



              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-purple-800 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400"
                    placeholder="Enter item name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2 flex items-center">
                      <Package size={16} className="mr-1" /> Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      value={currentItem.costPrice}
                      onChange={(e) => setCurrentItem({...currentItem, costPrice: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400"
                      placeholder="Raw material cost"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={currentItem.sellingPrice}
                      onChange={(e) => setCurrentItem({...currentItem, sellingPrice: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400"
                      placeholder="Selling price"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-800 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400"
                    min="1"
                  />
                </div>

                {currentItem.costPrice && currentItem.sellingPrice && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <strong>Profit per unit:</strong> ₹{(parseFloat(currentItem.sellingPrice) - parseFloat(currentItem.costPrice)).toFixed(2)}
                    </p>
                    <p className="text-sm text-purple-800">
                      <strong>Margin:</strong> {((parseFloat(currentItem.sellingPrice) - parseFloat(currentItem.costPrice)) / parseFloat(currentItem.sellingPrice) * 100).toFixed(2)}%
                    </p>
                  </div>
                )}

                <button
                  onClick={addItem}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all shadow-lg"
                >
                  <Plus className="mr-2" size={20} /> Add to Order
                </button>
              </div>
            </div>

            {/* Right Panel - Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-center text-purple-600 py-8">
                    <ShoppingCart size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No items added yet</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-purple-900">{item.name}</p>
                          <p className="text-sm text-purple-600">₹{item.sellingPrice} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-purple-900">₹{item.totalSelling.toFixed(2)}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded flex justify-between">
                        <span>Cost: ₹{item.totalCost.toFixed(2)}</span>
                        <span>Profit: ₹{item.profit.toFixed(2)}</span>
                        <span>Margin: {item.margin.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <h3 className="font-semibold text-purple-900 mb-2">Profit Analysis</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-purple-800">
                        <span>Total Cost:</span>
                        <span className="font-semibold">₹{totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-purple-800">
                        <span>Total Selling:</span>
                        <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-700 font-bold">
                        <span>Total Profit:</span>
                        <span>₹{totalProfit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Overall Margin:</span>
                        <span className="font-semibold">{(totalProfit / subtotal * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t-2 border-purple-200 pt-4 space-y-2">
                <div className="flex justify-between text-purple-800">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {delivery && deliveryChargeAmount > 0 && (
                  <div className="flex justify-between text-purple-800">
                    <span>Delivery Charge:</span>
                    <span className="font-semibold">₹{deliveryChargeAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-purple-800">
                  <span>Grand Total:</span>
                  <span className="font-semibold">₹{grandTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-purple-200">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roundOff}
                      onChange={(e) => setRoundOff(e.target.checked)}
                      className="mr-2 w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-purple-800">Round Off</span>
                  </label>
                  {roundOff && (
                    <span className="text-sm text-purple-600">
                      ({roundOffAmount >= 0 ? '+' : ''}{roundOffAmount.toFixed(2)})
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between text-2xl font-bold text-purple-900 pt-2 border-t-2 border-purple-300">
                  <span>Final Total:</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {items.length > 0 && (
                <button
                  onClick={generateBill}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all shadow-lg"
                >
                  <Receipt className="mr-2" size={20} /> Generate Bill
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto border-2 border-purple-200">
            <div className="text-center mb-6 pb-6 border-b-2 border-dashed border-purple-300">
              <div className="flex justify-center mb-4">
                <img 
                  src={logoImage}
                  alt="The Lilac Confectionery"
                  className="h-32 mx-auto object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-purple-900 mb-2">The Lilac Confectionery</h1>
              <p className="text-purple-700">Sector 11, Panchkula</p>
              <p className="text-purple-700">Phone: +91 86999 22476</p>
            </div>

            <div className="mb-6">
              <p className="text-purple-800"><strong>Bill No:</strong> INV-{Date.now().toString().slice(-6)}</p>
              <p className="text-purple-800"><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-purple-800"><strong>Customer:</strong> {customerName || 'Customer'}</p>
              <p className="text-purple-800"><strong>Source:</strong> {customerSource.charAt(0).toUpperCase() + customerSource.slice(1)}</p>
              {customerSource === 'referral' && referralText && (
                <p className="text-purple-800"><strong>Referred by:</strong> {referralText}</p>
              )}
              {delivery && (
                <>
                  <p className="text-purple-800"><strong>Delivery:</strong> Yes</p>
                  {deliveryMode && <p className="text-purple-800"><strong>Mode:</strong> {deliveryMode}</p>}
                </>
              )}
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900">
                  <th className="text-left py-2 px-3">Item</th>
                  <th className="text-center py-2 px-3">Qty</th>
                  <th className="text-right py-2 px-3">Price</th>
                  <th className="text-right py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-purple-200">
                    <td className="py-3 px-3 text-purple-900">{item.name}</td>
                    <td className="py-3 px-3 text-center text-purple-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-purple-800">₹{item.sellingPrice}</td>
                    <td className="py-3 px-3 text-right font-semibold text-purple-900">₹{item.totalSelling.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-2 mb-6 text-right">
              <div className="flex justify-between text-purple-800">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {delivery && deliveryChargeAmount > 0 && (
                <div className="flex justify-between text-purple-800">
                  <span>Delivery Charge:</span>
                  <span>₹{deliveryChargeAmount.toFixed(2)}</span>
                </div>
              )}
              {roundOff && roundOffAmount !== 0 && (
                <div className="flex justify-between text-purple-800">
                  <span>Round Off:</span>
                  <span>{roundOffAmount >= 0 ? '+' : ''}{roundOffAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-purple-900 pt-3 border-t-2 border-purple-300">
                <span>Grand Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center border-t-2 border-dashed border-purple-300 pt-6 mb-6">
              <p className="font-semibold mb-4 text-purple-800">Follow us for more delicious treats!</p>
              <div className="flex justify-center mb-4">
                <img 
                  src={qrImage}
                  alt="Instagram QR Code"
                  className="w-48 h-auto object-contain"
                />
              </div>
              <p className="text-purple-700 font-semibold text-lg">@THELILACCONFECTIONERY</p>
              <p className="text-sm text-purple-600 mt-2">Thank you for your purchase!</p>
              <p className="text-sm text-purple-600">Have a sweet day! 🧁</p>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={downloadPDF}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all"
              >
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowBill(false);
                  setItems([]);
                  setCustomerName('');
                  setCustomerSource('walk-in');
                  setReferralText('');
                  setDelivery(false);
                  setDeliveryCharge('');
                  setDeliveryMode('');
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-all"
              >
                New Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BakeryCalculator;