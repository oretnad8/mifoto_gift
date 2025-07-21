'use client';

import { useState } from 'react';

const Payment = ({ orderData, onPaymentSuccess, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setIsProcessing(false);
      const paidOrder = {
        ...orderData,
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: paymentMethod
      };
      onPaymentSuccess(paidOrder);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#2D3A52] hover:text-[#D75F1E] transition-colors duration-200 whitespace-nowrap"
            disabled={isProcessing}
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span className="text-lg font-medium">Volver</span>
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-[#2D3A52] mb-2">Pago Seguro</h1>
            <p className="text-lg text-[#2D3A52]/70">Completa tu compra de forma segura</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de pago */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-[#CEDFE7] to-[#FCF4F3] rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-[#2D3A52] mb-8">Método de Pago</h3>
              
              {/* Selector de método de pago */}
              <div className="space-y-4 mb-8">
                <div
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'card'
                      ? 'bg-white ring-4 ring-[#D75F1E] shadow-lg'
                      : 'bg-white/80 hover:bg-white hover:shadow-md'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'card'
                        ? 'border-[#D75F1E] bg-[#D75F1E]'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'card' && (
                        <i className="ri-check-line text-white text-sm"></i>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="ri-bank-card-line text-2xl text-[#2D3A52]"></i>
                      <div>
                        <h4 className="font-semibold text-[#2D3A52]">Tarjeta de Crédito/Débito</h4>
                        <p className="text-sm text-[#2D3A52]/70">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'transfer'
                      ? 'bg-white ring-4 ring-[#D75F1E] shadow-lg'
                      : 'bg-white/80 hover:bg-white hover:shadow-md'
                  }`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'transfer'
                        ? 'border-[#D75F1E] bg-[#D75F1E]'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'transfer' && (
                        <i className="ri-check-line text-white text-sm"></i>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="ri-bank-line text-2xl text-[#2D3A52]"></i>
                      <div>
                        <h4 className="font-semibold text-[#2D3A52]">Transferencia Bancaria</h4>
                        <p className="text-sm text-[#2D3A52]/70">Banco de Chile, BCI, Santander</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de tarjeta */}
              {paymentMethod === 'card' && (
                <div className="bg-white/60 rounded-xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D3A52] mb-2">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 bg-white rounded-lg border-2 border-transparent focus:border-[#D75F1E] focus:outline-none text-sm"
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3A52] mb-2">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 bg-white rounded-lg border-2 border-transparent focus:border-[#D75F1E] focus:outline-none text-sm"
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D3A52] mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 bg-white rounded-lg border-2 border-transparent focus:border-[#D75F1E] focus:outline-none text-sm"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2D3A52] mb-2">
                      Nombre del Titular
                    </label>
                    <input
                      type="text"
                      placeholder="Como aparece en la tarjeta"
                      className="w-full px-4 py-3 bg-white rounded-lg border-2 border-transparent focus:border-[#D75F1E] focus:outline-none text-sm"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              )}

              {/* Información de transferencia */}
              {paymentMethod === 'transfer' && (
                <div className="bg-white/60 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-[#D75F1E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-information-line text-[#D75F1E] text-2xl"></i>
                    </div>
                    <h4 className="font-semibold text-[#2D3A52] mb-2">Datos para Transferencia</h4>
                    <p className="text-sm text-[#2D3A52]/70">Realiza la transferencia con los siguientes datos:</p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#2D3A52]/70">Banco:</span>
                      <span className="font-medium text-[#2D3A52]">Banco de Chile</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2D3A52]/70">Cuenta:</span>
                      <span className="font-medium text-[#2D3A52]">12345678-9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2D3A52]/70">RUT:</span>
                      <span className="font-medium text-[#2D3A52]">76.123.456-7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2D3A52]/70">Nombre:</span>
                      <span className="font-medium text-[#2D3A52]">MiFoto SpA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de pago */}
              <div className="mt-8">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-[#D75F1E] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D75F1E]/90 transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-nowrap disabled:opacity-50 disabled:transform-none"
                >
                  {isProcessing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Procesando Pago...
                    </>
                  ) : (
                    <>
                      <i className="ri-secure-payment-line mr-2"></i>
                      Pagar ${orderData.total.toFixed(0)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#CEDFE7] to-[#FCF4F3] rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-bold text-[#2D3A52] mb-6">Resumen de Compra</h3>
              
              {/* Cliente */}
              <div className="bg-white/80 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-[#2D3A52] mb-2">Cliente</h4>
                <p className="text-sm text-[#2D3A52]">{orderData.customerName}</p>
                <p className="text-xs text-[#2D3A52]/70">Código: {orderData.id}</p>
              </div>

              {/* Productos */}
              <div className="space-y-3 mb-6">
                {orderData.items.map((item, index) => (
                  <div key={index} className="bg-white/80 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-[#2D3A52] text-sm">{item.size.name}</p>
                        <p className="text-xs text-[#2D3A52]/70">
                          {item.totalPhotos} impresiones • {item.size.dimensions}
                        </p>
                      </div>
                      <span className="font-bold text-[#D75F1E]">${item.subtotal.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-white/50 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#2D3A52]/70">Total Fotos:</span>
                  <span className="font-bold text-[#2D3A52]">{orderData.totalPhotos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#2D3A52]">Total:</span>
                  <span className="text-2xl font-bold text-[#D75F1E]">${orderData.total.toFixed(0)}</span>
                </div>
              </div>

              {/* Seguridad */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-shield-check-line text-green-600"></i>
                  <span className="text-sm font-medium text-green-800">Pago Seguro</span>
                </div>
                <p className="text-xs text-green-700">
                  Tu información está protegida con encriptación SSL de 256 bits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de procesamiento */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
              <div className="w-16 h-16 bg-[#D75F1E] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <i className="ri-loader-4-line text-white text-2xl animate-spin"></i>
              </div>
              <h3 className="text-xl font-bold text-[#2D3A52] mb-4">Procesando Pago</h3>
              <p className="text-[#2D3A52]/70 mb-4">
                Por favor espera mientras validamos tu pago...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#D75F1E] h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;