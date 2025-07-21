
'use client';

import { useState, useEffect } from 'react';
import CategoryScreen from './components/CategoryScreen';
import SizeSelection from './components/SizeSelection';
import PhotoUpload from './components/PhotoUpload';
import PhotoEditor from './components/PhotoEditor';
import Cart from './components/Cart';
import Confirmation from './components/Confirmation';
import Payment from './components/Payment';
import FinalCode from './components/FinalCode';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [showCartIcon, setShowCartIcon] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('mifoto-cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      setShowCartIcon(parsedCart.length > 0);
    }
  }, []);

  // Actualizar icono del carrito cuando cambie cartItems
  useEffect(() => {
    setShowCartIcon(cartItems.length > 0);
    localStorage.setItem('mifoto-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleCategorySelect = (category) => {
    if (category === 'instant') {
      setSelectedCategory(category);
      setCurrentScreen(2);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setCurrentScreen(3);
  };

  const handlePhotosUploaded = (photos) => {
    setUploadedPhotos(photos);
    setCurrentScreen(4);
  };

  const handleEditComplete = (processedPhotos) => {
    setUploadedPhotos(processedPhotos);
    setCurrentScreen(5);
  };

  const handleCartConfirm = (items) => {
    setCartItems(items);
    setCurrentScreen(6);
  };

  const handleOrderConfirm = (order) => {
    setOrderData(order);
    setCurrentScreen(7); 
  };

  const handlePaymentSuccess = (paidOrder) => {
    setOrderData(paidOrder);
    setCurrentScreen(8); 
  };

  const handleNewOrder = () => {
    setCurrentScreen(1);
    setSelectedCategory('');
    setSelectedSize(null);
    setUploadedPhotos([]);
    setCartItems([]);
    setOrderData(null);
    setShowCartIcon(false);
    localStorage.removeItem('mifoto-cart');
  };

  const handleBackToMain = () => {
    if (cartItems.length > 0 || uploadedPhotos.length > 0) {
      setShowExitWarning(true);
    } else {
      setCurrentScreen(1);
    }
  };

  const confirmExit = () => {
    setCurrentScreen(1);
    setSelectedCategory('');
    setSelectedSize(null);
    setUploadedPhotos([]);
    setCartItems([]);
    setOrderData(null);
    setShowCartIcon(false);
    setShowExitWarning(false);
    localStorage.removeItem('mifoto-cart');
  };

  const showCart = () => {
    setCurrentScreen(5);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Icono del carrito flotante */}
      {showCartIcon && currentScreen !== 5 && currentScreen !== 6 && currentScreen !== 7 && currentScreen !== 8 && (
        <div className="fixed top-8 right-8 z-50">
          <button
            onClick={showCart}
            className="bg-[#D75F1E] text-white w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 cursor-pointer relative"
          >
            <i className="ri-shopping-cart-fill text-2xl"></i>
            <div className="absolute -top-2 -right-2 bg-white text-[#D75F1E] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border-2 border-[#D75F1E]">
              {cartItems.length}
            </div>
          </button>
        </div>
      )}

      {currentScreen === 1 && (
        <CategoryScreen onCategorySelect={handleCategorySelect} />
      )}
      {currentScreen === 2 && (
        <SizeSelection 
          onSizeSelect={handleSizeSelect}
          onBack={handleBackToMain}
        />
      )}
      {currentScreen === 3 && (
        <PhotoUpload 
          selectedSize={selectedSize}
          onPhotosUploaded={handlePhotosUploaded}
          onBack={() => setCurrentScreen(2)}
        />
      )}
      {currentScreen === 4 && (
        <PhotoEditor 
          photos={uploadedPhotos}
          selectedSize={selectedSize}
          onEditComplete={handleEditComplete}
          onBack={() => setCurrentScreen(3)}
        />
      )}
      {currentScreen === 5 && (
        <Cart 
          items={cartItems}
          selectedSize={selectedSize}
          photos={uploadedPhotos}
          onConfirm={handleCartConfirm}
          onBack={() => setCurrentScreen(4)}
          onAddMore={() => setCurrentScreen(1)}
          onUpdateCart={setCartItems}
        />
      )}
      {currentScreen === 6 && (
        <Confirmation 
          cartItems={cartItems}
          onConfirm={handleOrderConfirm}
          onBack={() => setCurrentScreen(5)}
        />
      )}
      {currentScreen === 7 && (
        <Payment 
          orderData={orderData}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={() => setCurrentScreen(6)}
        />
      )}
      {currentScreen === 8 && (
        <FinalCode 
          orderData={orderData}
          onNewOrder={handleNewOrder}
        />
      )}

      {/* Modal de advertencia de salida */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-alert-line text-yellow-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-[#2D3A52] mb-2">¿Salir sin guardar?</h3>
              <p className="text-[#2D3A52]/70">
                Perderás el producto que estás creando. ¿Deseas continuar?
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowExitWarning(false)}
                className="flex-1 bg-gray-100 text-[#2D3A52] py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap"
              >
                Continuar Editando
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 bg-[#D75F1E] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#D75F1E]/90 transition-colors duration-200 whitespace-nowrap"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}