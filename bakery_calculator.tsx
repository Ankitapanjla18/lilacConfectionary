import { useState, useRef } from 'react';
import { Plus, Trash2, ShoppingCart, Receipt, Package } from 'lucide-react';
import logoImage from './assets/logo.jpg';
import qrImage from './assets/lilac_ig.jpg';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [discountType, setDiscountType] = useState<'value' | 'percentage'>('value');
  const [discountAmount, setDiscountAmount] = useState('');
  const billRef = useRef<HTMLDivElement>(null);



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
  
  // Calculate discount
  const discountValue = discountAmount ? parseFloat(discountAmount) : 0;
  const discountAmountCalculated = discountType === 'percentage' 
    ? (subtotal * discountValue / 100) 
    : discountValue;
  
  const grandTotal = subtotal + deliveryChargeAmount - discountAmountCalculated;
  const finalTotal = roundOff ? Math.round(grandTotal) : grandTotal;
  const roundOffAmount = finalTotal - grandTotal;

  const generateBill = () => {
    setShowBill(true);
  };

  const downloadPDF = async () => {
    if (!billRef.current) return;

    try {
      // Capture the bill as canvas
      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // If content is taller than one page, split it
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      // Generate filename with customer name, date, and bill number
      const billNumber = `INV-${Date.now().toString().slice(-6)}`;
      const customerNameForFile = customerName.trim() || 'Customer';
      // Sanitize customer name for filename (remove invalid characters)
      const sanitizedCustomerName = customerNameForFile
        .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters except spaces, hyphens, underscores
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50); // Limit length
      
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const fileName = `Bill_${sanitizedCustomerName}_${dateStr}_${billNumber}.pdf`;
      
      // Download PDF
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-purple-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-purple-900 mb-2">🧁 The Lilac Confectionery</h1>
          <p className="text-purple-700 text-sm sm:text-base md:text-lg">Freshly Baked, Made with Love</p>
        </div>

        {!showBill ? (
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Panel - Item Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border-2 border-purple-200">
              <h2 className="text-xl sm:text-2xl font-bold text-purple-900 mb-3 sm:mb-4 flex items-center">
                <ShoppingCart className="mr-2" size={20} /> Add Items
              </h2>
              
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-purple-800 mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm sm:text-base"
                  placeholder="Enter customer name"
                />
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-purple-800 mb-2">Customer Source</label>
                <select
                  value={customerSource}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white text-sm sm:text-base"
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
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm sm:text-base"
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
                <div className="space-y-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">Delivery Charge (₹)</label>
                    <input
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm sm:text-base"
                      placeholder="Enter delivery charge"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">Mode of Delivery</label>
                    <input
                      type="text"
                      value={deliveryMode}
                      onChange={(e) => setDeliveryMode(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm sm:text-base"
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
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm sm:text-base"
                    placeholder="Enter item name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2 flex items-center">
                      <Package size={16} className="mr-1" /> Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      value={currentItem.costPrice}
                      onChange={(e) => setCurrentItem({...currentItem, costPrice: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm sm:text-base"
                      placeholder="Raw material cost"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-2">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={currentItem.sellingPrice}
                      onChange={(e) => setCurrentItem({...currentItem, sellingPrice: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm sm:text-base"
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
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm sm:text-base"
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
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2.5 sm:py-3 rounded-lg flex items-center justify-center transition-all shadow-lg text-sm sm:text-base"
                >
                  <Plus className="mr-2" size={18} /> Add to Order
                </button>
              </div>
            </div>

            {/* Right Panel - Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border-2 border-purple-200">
              <h2 className="text-xl sm:text-2xl font-bold text-purple-900 mb-3 sm:mb-4">Order Summary</h2>
              
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
                
                {/* Discount Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-2 sm:p-3 rounded-lg border border-yellow-200">
                  <label className="block text-sm font-semibold text-purple-800 mb-2">Discount</label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <select
                      value={discountType}
                      onChange={(e) => {
                        setDiscountType(e.target.value as 'value' | 'percentage');
                        setDiscountAmount('');
                      }}
                      className="px-3 py-1.5 sm:py-1 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white text-sm"
                    >
                      <option value="value">₹ (Fixed)</option>
                      <option value="percentage">% (Percentage)</option>
                    </select>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="flex-1 px-3 py-1.5 sm:py-1 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm"
                      placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                      min="0"
                      step={discountType === 'percentage' ? '0.01' : '1'}
                    />
                  </div>
                  {discountAmountCalculated > 0 && (
                    <div className="flex justify-between text-sm text-purple-800 mt-1">
                      <span>Discount Applied:</span>
                      <span className="font-semibold text-green-700">
                        -₹{discountAmountCalculated.toFixed(2)}
                        {discountType === 'percentage' && ` (${discountValue}%)`}
                      </span>
                    </div>
                  )}
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
                  className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2.5 sm:py-3 rounded-lg flex items-center justify-center transition-all shadow-lg text-sm sm:text-base"
                >
                  <Receipt className="mr-2" size={18} /> Generate Bill
                </button>
              )}
            </div>
          </div>
        ) : (
          <div ref={billRef} className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto border-2 border-purple-200">
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

            <div className="mb-4 sm:mb-6">
              <p className="text-purple-800 text-sm sm:text-base"><strong>Bill No:</strong> INV-{Date.now().toString().slice(-6)}</p>
              <p className="text-purple-800 text-sm sm:text-base"><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-purple-800 text-sm sm:text-base"><strong>Customer:</strong> {customerName || 'Customer'}</p>
              <p className="text-purple-800 text-sm sm:text-base"><strong>Source:</strong> {customerSource.charAt(0).toUpperCase() + customerSource.slice(1)}</p>
              {customerSource === 'referral' && referralText && (
                <p className="text-purple-800 text-sm sm:text-base"><strong>Referred by:</strong> {referralText}</p>
              )}
              {delivery && (
                <>
                  <p className="text-purple-800 text-sm sm:text-base"><strong>Delivery:</strong> Yes</p>
                  {deliveryMode && <p className="text-purple-800 text-sm sm:text-base"><strong>Mode:</strong> {deliveryMode}</p>}
                </>
              )}
            </div>

            <div className="overflow-x-auto mb-4 sm:mb-6">
              <table className="w-full min-w-[300px]">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900">
                    <th className="text-left py-2 px-2 sm:px-3 text-xs sm:text-sm">Item</th>
                    <th className="text-center py-2 px-2 sm:px-3 text-xs sm:text-sm">Qty</th>
                    <th className="text-right py-2 px-2 sm:px-3 text-xs sm:text-sm">Price</th>
                    <th className="text-right py-2 px-2 sm:px-3 text-xs sm:text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-purple-200">
                      <td className="py-2 sm:py-3 px-2 sm:px-3 text-purple-900 text-xs sm:text-sm">{item.name}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 text-center text-purple-800 text-xs sm:text-sm">{item.quantity}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 text-right text-purple-800 text-xs sm:text-sm">₹{item.sellingPrice}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 text-right font-semibold text-purple-900 text-xs sm:text-sm">₹{item.totalSelling.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 mb-4 sm:mb-6 text-right">
              <div className="flex justify-between text-purple-800 text-sm sm:text-base">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmountCalculated > 0 && (
                <div className="flex justify-between text-purple-800 text-sm sm:text-base">
                  <span>Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}:</span>
                  <span className="text-green-700 font-semibold">-₹{discountAmountCalculated.toFixed(2)}</span>
                </div>
              )}
              {delivery && deliveryChargeAmount > 0 && (
                <div className="flex justify-between text-purple-800 text-sm sm:text-base">
                  <span>Delivery Charge:</span>
                  <span>₹{deliveryChargeAmount.toFixed(2)}</span>
                </div>
              )}
              {roundOff && roundOffAmount !== 0 && (
                <div className="flex justify-between text-purple-800 text-sm sm:text-base">
                  <span>Round Off:</span>
                  <span>{roundOffAmount >= 0 ? '+' : ''}{roundOffAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl sm:text-2xl font-bold text-purple-900 pt-3 border-t-2 border-purple-300">
                <span>Grand Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center border-t-2 border-dashed border-purple-300 pt-4 sm:pt-6 mb-4 sm:mb-6">
              <p className="font-semibold mb-3 sm:mb-4 text-purple-800 text-sm sm:text-base">Follow us for more delicious treats!</p>
              <div className="flex justify-center mb-3 sm:mb-4">
                <img 
                  src={qrImage}
                  alt="Instagram QR Code"
                  className="w-32 sm:w-40 md:w-48 h-auto object-contain"
                />
              </div>
              <p className="text-purple-700 font-semibold text-base sm:text-lg">@THELILACCONFECTIONERY</p>
              <p className="text-xs sm:text-sm text-purple-600 mt-2">Thank you for your purchase!</p>
              <p className="text-xs sm:text-sm text-purple-600">Have a sweet day! 🧁</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
              <button
                onClick={downloadPDF}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
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
                  setDiscountType('value');
                  setDiscountAmount('');
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
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