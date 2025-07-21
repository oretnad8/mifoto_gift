
'use client';

import { useState, useEffect } from 'react';

const Cart = ({ items, selectedSize, photos, onConfirm, onBack, onAddMore, onUpdateCart }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [hasProcessedNewPhotos, setHasProcessedNewPhotos] = useState(false);

  const isPairSize = (sizeId) => {
    return sizeId === 'kiosco' || sizeId === 'square-small';
  };

  useEffect(() => {
    // Cargar elementos existentes del carrito
    const savedCart = localStorage.getItem('mifoto-cart');
    let existingItems = [];
    if (savedCart) {
      existingItems = JSON.parse(savedCart);
    }

    // Si hay nuevas fotos procesadas del editor Y no las hemos procesado ya
    if (photos && photos.length > 0 && selectedSize && !hasProcessedNewPhotos) {
      // Verificar que las fotos tienen copias válidas antes de procesar
      const validPhotos = photos.filter(photo => photo.copies && photo.copies.length > 0);

      if (validPhotos.length > 0) {
        // Verificar si ya existe un producto del mismo tamaño
        const existingProductIndex = existingItems.findIndex(item => 
          item.size.id === selectedSize.id
        );

        if (existingProductIndex >= 0) {
          // Si ya existe un producto del mismo tamaño, agregar las fotos a ese producto
          const existingProduct = existingItems[existingProductIndex];
          
          // Combinar fotos sin duplicar
          const combinedPhotos = [...existingProduct.processedPhotos];
          
          validPhotos.forEach(newPhoto => {
            // Verificar si esta foto ya existe en el producto
            const existingPhotoIndex = combinedPhotos.findIndex(p => p.id === newPhoto.id);
            
            if (existingPhotoIndex >= 0) {
              // Si la foto ya existe, combinar las copias
              const existingCopies = combinedPhotos[existingPhotoIndex].copies || [];
              const newCopies = newPhoto.copies || [];
              combinedPhotos[existingPhotoIndex].copies = [...existingCopies, ...newCopies];
            } else {
              // Si es una foto nueva, agregarla
              combinedPhotos.push(newPhoto);
            }
          });

          const updatedTotalCopies = combinedPhotos.reduce((sum, photo) => sum + (photo.copies ? photo.copies.length : 0), 0);
          
          let updatedSubtotal;
          if (isPairSize(selectedSize.id)) {
            const pairs = Math.ceil(updatedTotalCopies / 2);
            updatedSubtotal = pairs * parseFloat(selectedSize.price);
          } else {
            updatedSubtotal = updatedTotalCopies * parseFloat(selectedSize.price);
          }

          existingItems[existingProductIndex] = {
            ...existingProduct,
            processedPhotos: combinedPhotos,
            totalCopies: updatedTotalCopies,
            subtotal: updatedSubtotal,
            orderConfig: {
              ...existingProduct.orderConfig,
              photos: combinedPhotos.map(photo => ({
                originalPhotoId: photo.id,
                fileName: photo.name,
                fileData: photo.file,
                copies: photo.copies ? photo.copies.map(copy => ({
                  copyId: copy.copyId,
                  copyIndex: copy.copyIndex,
                  processingConfig: {
                    margins: copy.settings.margins,
                    rotation: copy.settings.rotation,
                    fit: copy.settings.fit,
                    processing: copy.settings.processing
                  }
                })) : []
              }))
            }
          };
        } else {
          // Crear nuevo producto si no existe uno del mismo tamaño
          const totalCopies = validPhotos.reduce((sum, photo) => sum + (photo.copies ? photo.copies.length : 0), 0);

          let subtotal;
          if (isPairSize(selectedSize.id)) {
            const pairs = Math.ceil(totalCopies / 2);
            subtotal = pairs * parseFloat(selectedSize.price);
          } else {
            subtotal = totalCopies * parseFloat(selectedSize.price);
          }

          const newCartItem = {
            id: Date.now(),
            size: selectedSize,
            processedPhotos: validPhotos,
            totalCopies: totalCopies,
            subtotal: subtotal,
            orderConfig: {
              sizeId: selectedSize.id,
              sizeName: selectedSize.name,
              dimensions: selectedSize.dimensions,
              pricePerUnit: parseFloat(selectedSize.price),
              isPairPricing: isPairSize(selectedSize.id),
              photos: validPhotos.map(photo => ({
                originalPhotoId: photo.id,
                fileName: photo.name,
                fileData: photo.file,
                copies: photo.copies ? photo.copies.map(copy => ({
                  copyId: copy.copyId,
                  copyIndex: copy.copyIndex,
                  processingConfig: {
                    margins: copy.settings.margins,
                    rotation: copy.settings.rotation,
                    fit: copy.settings.fit,
                    processing: copy.settings.processing
                  }
                })) : []
              }))
            }
          };
          existingItems.push(newCartItem);
        }

        setCartItems(existingItems);

        // Actualizar localStorage y notificar al componente padre
        localStorage.setItem('mifoto-cart', JSON.stringify(existingItems));
        if (onUpdateCart) {
          onUpdateCart(existingItems);
        }

        // Marcar que ya procesamos estas fotos para evitar duplicación
        setHasProcessedNewPhotos(true);
      } else {
        // Solo mostrar elementos existentes si no hay fotos válidas
        setCartItems(existingItems);
      }
    } else {
      // Solo mostrar elementos existentes
      setCartItems(existingItems);
    }
  }, [photos, selectedSize, hasProcessedNewPhotos]);

  // Resetear el flag cuando se cambian las fotos o el tamaño
  useEffect(() => {
    setHasProcessedNewPhotos(false);
  }, [photos, selectedSize]);

  const removeItemFromCart = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('mifoto-cart', JSON.stringify(updatedItems));
    if (onUpdateCart) {
      onUpdateCart(updatedItems);
    }
  };

  const removePhotoFromItem = (itemId, photoId) => {
    setCartItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === itemId) {
          const updatedPhotos = item.processedPhotos.filter(photo => photo.id !== photoId);

          if (updatedPhotos.length === 0) {
            return null;
          }

          const totalCopies = updatedPhotos.reduce((sum, photo) => sum + (photo.copies ? photo.copies.length : 0), 0);

          // Recalcular subtotal
          let subtotal;
          if (isPairSize(item.size.id)) {
            const pairs = Math.ceil(totalCopies / 2);
            subtotal = pairs * parseFloat(item.size.price);
          } else {
            subtotal = totalCopies * parseFloat(item.size.price);
          }

          return {
            ...item,
            processedPhotos: updatedPhotos,
            totalCopies: totalCopies,
            subtotal: subtotal,
            orderConfig: {
              ...item.orderConfig,
              photos: updatedPhotos.map(photo => ({
                originalPhotoId: photo.id,
                fileName: photo.name,
                fileData: photo.file,
                copies: photo.copies ? photo.copies.map(copy => ({
                  copyId: copy.copyId,
                  copyIndex: copy.copyIndex,
                  processingConfig: {
                    margins: copy.settings.margins,
                    rotation: copy.settings.rotation,
                    fit: copy.settings.fit,
                    processing: copy.settings.processing
                  }
                })) : []
              }))
            }
          };
        }
        return item;
      }).filter(Boolean);

      // Actualizar localStorage
      localStorage.setItem('mifoto-cart', JSON.stringify(updatedItems));
      if (onUpdateCart) {
        onUpdateCart(updatedItems);
      }

      return updatedItems;
    });
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTotalCopies = () => {
    return cartItems.reduce((sum, item) => sum + item.totalCopies, 0);
  };

  const getTotalProducts = () => {
    return cartItems.length;
  };

  const handleFinalize = () => {
    setShowModal(true);
  };

  const confirmFinalize = () => {
    // Validar cantidades pares para tamaños específicos
    const hasInvalidTotals = cartItems.some(item => {
      const sizeId = item.size.id;
      if (sizeId === 'kiosco' || sizeId === 'square-small') {
        return item.totalCopies % 2 !== 0;
      }
      return false;
    });

    if (hasInvalidTotals) {
      alert('Los tamaños 10x15 y 10x10 requieren un total de impresiones par (2, 4, 6, etc.)');
      return;
    }

    setShowModal(false);
    onConfirm(cartItems);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white px-8 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#FCF4F3] rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shopping-cart-line text-4xl text-[#2D3A52]/50"></i>
          </div>
          <h2 className="text-2xl font-bold text-[#2D3A52] mb-4">Carrito Vacío</h2>
          <p className="text-[#2D3A52]/70 mb-8">No tienes productos en tu carrito</p>
          <button
            onClick={onAddMore}
            className="bg-[#D75F1E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D75F1E]/90 transition-colors duration-200 whitespace-nowrap"
          >
            Añadir Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#2D3A52] hover:text-[#D75F1E] transition-colors duration-200 whitespace-nowrap"
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span className="text-lg font-medium">Volver</span>
          </button>

          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-[#2D3A52] mb-2">Tu Carrito</h1>
            <p className="text-lg text-[#2D3A52]/70">Revisa tu pedido personalizado</p>
          </div>

          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <div key={item.id} className="bg-gradient-to-r from-[#CEDFE7] to-[#FCF4F3] rounded-2xl p-6">
                  {/* Header del producto */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#2D3A52]">Producto #{index + 1} - {item.size.name}</h3>
                      <p className="text-[#2D3A52]/70">
                        {item.size.dimensions} • ${item.size.price}
                        {isPairSize(item.size.id) ? ' par' : ' c/u'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-[#2D3A52]/70">
                          {item.totalCopies} copia{item.totalCopies !== 1 ? 's' : ''}
                          {isPairSize(item.size.id) && ` (${Math.ceil(item.totalCopies / 2)} par${Math.ceil(item.totalCopies / 2) !== 1 ? 'es' : ''})`}
                        </p>
                        <p className="text-2xl font-bold text-[#D75F1E]">${item.subtotal.toFixed(0)}</p>
                      </div>
                      <button
                        onClick={() => removeItemFromCart(item.id)}
                        className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-red-600"></i>
                      </button>
                    </div>
                  </div>

                  {/* Lista de fotos con sus copias */}
                  <div className="space-y-4">
                    {item.processedPhotos.map((photo) => (
                      <div key={photo.id}>
                        {/* Header de la foto */}
                        <div className="bg-white/80 rounded-xl p-4 mb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={photo.preview}
                                  alt={photo.name}
                                  className="w-full h-full object-cover object-top"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-[#2D3A52]">{photo.name}</p>
                                <p className="text-sm text-[#2D3A52]/70">
                                  {photo.copies ? photo.copies.length : 0} copia{(photo.copies && photo.copies.length !== 1) ? 's' : ''}
                                  {isPairSize(item.size.id) && photo.copies && (
                                    ` • ${Math.ceil(photo.copies.length / 2)} par${Math.ceil(photo.copies.length / 2) !== 1 ? 'es' : ''}`
                                  )}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removePhotoFromItem(item.id, photo.id)}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line text-red-600 text-sm"></i>
                            </button>
                          </div>
                        </div>

                        {/* Lista de copias individuales */}
                        {photo.copies && photo.copies.length > 0 && (
                          <div className="ml-8 space-y-2">
                            {photo.copies.map((copy) => (
                              <div key={copy.copyId} className="bg-white/60 rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-[#D75F1E]/10 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-[#D75F1E]">{copy.copyIndex + 1}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-[#2D3A52]">Copia {copy.copyIndex + 1}</p>
                                    <div className="flex gap-4 text-xs text-[#2D3A52]/60">
                                      <span>Margin: {copy.settings.margins.type || copy.settings.margins}</span>
                                      <span>Rotation: {copy.settings.rotation}°</span>
                                      <span>Fit: {copy.settings.fit === 'fill' ? 'Fill' : 'Fit'}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-[#2D3A52}">
                                  {isPairSize(item.size.id) ? '½ par' : `$${item.size.price}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Botón añadir más productos */}
              <div className="mt-8">
                <button
                  onClick={onAddMore}
                  className="w-full bg-white border-2 border-[#D75F1E] text-[#D75F1E] py-4 rounded-xl font-bold text-lg hover:bg-[#D75F1E] hover:text-white transition-all duration-200 whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  Añadir Más Productos
                </button>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#CEDFE7] to-[#FCF4F3] rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-bold text-[#2D3A52] mb-6">Resumen del Pedido</h3>

              {/* Estadísticas */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-white/50">
                  <span className="text-[#2D3A52]/70">Total de Copias:</span>
                  <span className="font-bold text-[#2D3A52]">{getTotalCopies()}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/50">
                  <span className="text-[#2D3A52]/70">Productos:</span>
                  <span className="font-bold text-[#2D3A52]">{getTotalProducts()}</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-lg font-semibold text-[#2D3A52]">Total:</span>
                  <span className="text-2xl font-bold text-[#D75F1E]">${getTotalAmount().toFixed(0)}</span>
                </div>
              </div>

              {/* Desglose por producto */}
              <div className="mb-6">
                <h4 className="font-semibold text-[#2D3A52] mb-3">Desglose:</h4>
                <div className="space-y-2">
                  {cartItems.map((item, index) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[#2D3A52]/70">
                        Producto #{index + 1} ({item.totalCopies})
                      </span>
                      <span className="font-medium text-[#2D3A52]">
                        ${item.subtotal.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón finalizar */}
              <button
                onClick={handleFinalize}
                className="w-full bg-[#D75F1E] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D75F1E]/90 transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                Finalizar Compra
                <i className="ri-arrow-right-line ml-2"></i>
              </button>

              {/* Info adicional */}
              <div className="mt-6 p-4 bg-white/60 rounded-lg">
                <div className="flex items-start gap-2">
                  <i className="ri-settings-3-line text-[#D75F1E] mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-[#2D3A52]">Personalización Lista</p>
                    <p className="text-xs text-[#2D3A52]/70">Cada copia con sus ajustes únicos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmación */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#D75F1E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-question-line text-[#D75F1E] text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#2D3A52] mb-2">¿Confirmas tu pedido?</h3>
                <p className="text-[#2D3A52]/70">
                  Tu pedido personalizado está listo para procesar
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-[#2D3A52] py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap"
                >
                  Revisar más
                </button>
                <button
                  onClick={confirmFinalize}
                  className="flex-1 bg-[#D75F1E] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#D75F1E]/90 transition-colors duration-200 whitespace-nowrap"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
