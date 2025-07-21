
'use client';

import { useState } from 'react';

const SizeSelection = ({ onSizeSelect, onBack }) => {
  const [selectedSize, setSelectedSize] = useState(null);

  const sizes = [
    {
      id: 'kiosco',
      name: 'Foto Kiosco',
      dimensions: '10x15 cm',
      price: '2520',
      preview: 'https://readdy.ai/api/search-image?query=professional%20photo%20print%2010x15%20cm%20size%20with%20white%20border%2C%20clean%20modern%20photography%20studio%20lighting%2C%20high%20quality%20photo%20paper%20texture%2C%20realistic%20photo%20dimension%20visualization%2C%20commercial%20printing%20quality&width=200&height=300&seq=kiosco-preview&orientation=portrait'
    },
    {
      id: 'medium',
      name: 'Foto Kiosco',
      dimensions: '13x18 cm',
      price: '1920',
      preview: 'https://readdy.ai/api/search-image?query=professional%20photo%20print%2013x18%20cm%20size%20with%20white%20border%2C%20clean%20modern%20photography%20studio%20lighting%2C%20high%20quality%20photo%20paper%20texture%2C%20realistic%20photo%20dimension%20visualization%2C%20commercial%20printing%20quality&width=260&height=360&seq=medium-preview&orientation=portrait'
    },
    {
      id: 'large',
      name: 'Foto Kiosco',
      dimensions: '15x20 cm',
      price: '1920',
      preview: 'https://readdy.ai/api/search-image?query=professional%20photo%20print%2015x20%20cm%20size%20with%20white%20border%2C%20clean%20modern%20photography%20studio%20lighting%2C%20high%20quality%20photo%20paper%20texture%2C%20realistic%20photo%20dimension%20visualization%2C%20commercial%20printing%20quality&width=300&height=400&seq=large-preview&orientation=portrait'
    },
    {
      id: 'square-small',
      name: 'Foto Kiosco',
      dimensions: '10x10 cm',
      price: '2520',
      preview: 'https://readdy.ai/api/search-image?query=professional%20square%20photo%20print%2010x10%20cm%20size%20with%20white%20border%2C%20clean%20modern%20photography%20studio%20lighting%2C%20high%20quality%20photo%20paper%20texture%2C%20realistic%20square%20photo%20dimension%20visualization%2C%20commercial%20printing%20quality&width=200&height=200&seq=square-small-preview&orientation=squarish'
    },
    {
      id: 'square-large',
      name: 'Foto Kiosco',
      dimensions: '15x15 cm',
      price: '2200',
      preview: 'https://readdy.ai/api/search-image?query=professional%20square%20photo%20print%2015x15%20cm%20size%20with%20white%20border%2C%20clean%20modern%20photography%20studio%20lighting%2C%20high%20quality%20photo%20paper%20texture%2C%20realistic%20square%20photo%20dimension%20visualization%2C%20commercial%20printing%20quality&width=300&height=300&seq=square-large-preview&orientation=squarish'
    }
  ];

  const handleSizeClick = (size) => {
    setSelectedSize(size);
    // Automáticamente continuar después de seleccionar
    setTimeout(() => {
      onSizeSelect(size);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#2D3A52] hover:text-[#D75F1E] transition-colors duration-200 whitespace-nowrap"
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span className="text-base sm:text-lg font-medium">Volver</span>
          </button>

          <div className="text-center flex-1 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3A52] mb-2">Selecciona el Tamaño</h1>
            <p className="text-base sm:text-lg text-[#2D3A52]/70 hidden sm:block">Elige el formato perfecto para tus fotos</p>
          </div>

          <div className="w-12 sm:w-24"></div>
        </div>

        {/* Vista móvil: Lista vertical */}
        <div className="block sm:hidden space-y-4 mb-8">
          {sizes.map((size) => (
            <div
              key={size.id}
              className={`bg-gradient-to-br from-[#CEDFE7] to-[#FCF4F3] rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                selectedSize?.id === size.id
                  ? 'ring-4 ring-[#D75F1E] shadow-xl'
                  : 'shadow-lg'
              }`}
              onClick={() => handleSizeClick(size)}
            >
              <div className="flex items-center justify-center text-center">
                <div className="flex flex-col items-center">
                  {/* Imagen centrada */}
                  <div className="mb-4">
                    <div className="relative overflow-hidden rounded-lg shadow-md">
                      <img
                        src={size.preview}
                        alt={`Preview ${size.name}`}
                        className="object-cover object-top"
                        style={{
                          width: size.id.includes('square') ? '80px' : '65px',
                          height: size.id.includes('square') ? '80px' : '90px'
                        }}
                      />
                      {selectedSize?.id === size.id && (
                        <div className="absolute inset-0 bg-[#D75F1E]/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-[#D75F1E] rounded-full flex items-center justify-center">
                            <i className="ri-check-line text-white text-sm"></i>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Texto centrado */}
                  <div>
                    <h3 className="text-lg font-bold text-[#2D3A52] mb-1">{size.name}</h3>
                    <p className="text-[#2D3A52]/70 mb-2">{size.dimensions}</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[#D75F1E] font-bold text-lg">${size.price}</span>
                      <span className="text-[#2D3A52]/70 text-sm">par</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop: Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 mb-12">
          {sizes.map((size) => (
            <div
              key={size.id}
              className={`bg-gradient-to-br from-[#CEDFE7] to-[#FCF4F3] rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                selectedSize?.id === size.id
                  ? 'ring-4 ring-[#D75F1E] shadow-xl scale-105'
                  : 'shadow-lg'
              }`}
              onClick={() => handleSizeClick(size)}
            >
              <div className="mb-6 flex justify-center">
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <img
                    src={size.preview}
                    alt={`Preview ${size.name}`}
                    className="object-cover object-top"
                    style={{
                      width: size.id.includes('square') ? '120px' : '90px',
                      height: size.id.includes('square') ? '120px' : '130px'
                    }}
                  />
                  {selectedSize?.id === size.id && (
                    <div className="absolute inset-0 bg-[#D75F1E]/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#D75F1E] rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-lg"></i>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-[#2D3A52] mb-2">{size.name}</h3>
                <p className="text-[#2D3A52]/70 mb-3">{size.dimensions}</p>
                <div className="bg-white/80 rounded-lg px-3 py-2 inline-block">
                  <span className="text-[#D75F1E] font-bold text-lg">${size.price}</span>
                  <span className="text-[#2D3A52]/70 text-sm ml-1">par</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-8 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-[#CEDFE7] to-[#FCF4F3] rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-[#2D3A52] mb-4">Información Importante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
              <div>
                <h4 className="font-semibold text-[#2D3A52] mb-2">Calidad Premium</h4>
                <p className="text-sm sm:text-base text-[#2D3A52]/70">Papel fotográfico profesional con acabado brillante</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3A52] mb-2">Impresión Instantánea</h4>
                <p className="text-sm sm:text-base text-[#2D3A52]/70">Tus fotos estarán listas en menos de 5 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeSelection;
