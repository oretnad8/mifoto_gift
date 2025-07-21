
'use client';

import { useState, useEffect } from 'react';

const PhotoEditor = ({ photos, selectedSize, onEditComplete, onBack }) => {
  const [editedPhotos, setEditedPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [currentSettings, setCurrentSettings] = useState({
    margins: 'none',
    rotation: 0,
    fit: 'fill'
  });

  useEffect(() => {
    // Expandir fotos según su cantidad - cada copia individual
    const expandedPhotos = [];
    photos.forEach(photo => {
      for (let i = 0; i < photo.quantity; i++) {
        expandedPhotos.push({
          ...photo,
          id: `${photo.id}_copy_${i}`,
          originalId: photo.id,
          copyIndex: i,
          copyName: `${photo.name} (Copia ${i + 1})`,
          settings: { ...currentSettings }
        });
      }
    });
    setEditedPhotos(expandedPhotos);
  }, [photos]);

  const marginOptions = [
    { id: 'none', label: 'Sin Márgenes', icon: 'ri-crop-line' },
    { id: 'white-5', label: 'Blanco 5mm', icon: 'ri-square-line' },
    { id: 'white-10', label: 'Blanco 10mm', icon: 'ri-square-fill' },
    { id: 'black-5', label: 'Negro 5mm', icon: 'ri-checkbox-blank-line' },
    { id: 'black-10', label: 'Negro 10mm', icon: 'ri-checkbox-blank-fill' }
  ];

  const fitOptions = [
    { id: 'fill', label: 'Rellenar', icon: 'ri-fullscreen-line' },
    { id: 'fit', label: 'Encajar', icon: 'ri-picture-in-picture-line' }
  ];

  const togglePhotoSelection = (photoId) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPhotos.size === editedPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(editedPhotos.map(photo => photo.id)));
    }
  };

  const updateSetting = (setting, value) => {
    setCurrentSettings(prev => ({ ...prev, [setting]: value }));

    // Aplicar cambios automáticamente a fotos seleccionadas
    setEditedPhotos(prev => prev.map(photo => {
      if (selectedPhotos.has(photo.id)) {
        return {
          ...photo,
          settings: { ...photo.settings, [setting]: value }
        };
      }
      return photo;
    }));
  };

  const rotatePhotos = () => {
    const newRotation = (currentSettings.rotation + 90) % 360;
    updateSetting('rotation', newRotation);
  };

  const handleContinue = () => {
    // Preparar datos para el backend con configuraciones detalladas
    const processedPhotos = preparePhotosForBackend(editedPhotos);
    onEditComplete(processedPhotos);
  };

  const preparePhotosForBackend = (photos) => {
    // Agrupar copias por foto original y preparar configuraciones
    const photoGroups = {};

    photos.forEach(photo => {
      const originalId = photo.originalId;
      if (!photoGroups[originalId]) {
        photoGroups[originalId] = {
          id: originalId,
          file: photo.file,
          preview: photo.preview,
          name: photo.name,
          copies: []
        };
      }

      photoGroups[originalId].copies.push({
        copyId: photo.id,
        copyIndex: photo.copyIndex,
        settings: {
          margins: {
            type: photo.settings.margins,
            size: photo.settings.margins.includes('5') ? 5 : photo.settings.margins.includes('10') ? 10 : 0,
            color: photo.settings.margins.includes('white') ? '#ffffff' : photo.settings.margins.includes('black') ? '#000000' : 'none'
          },
          rotation: photo.settings.rotation,
          fit: photo.settings.fit,
          processing: {
            objectFit: photo.settings.fit === 'fill' ? 'cover' : 'contain',
            transform: `rotate(${photo.settings.rotation}deg)`,
            borderConfig: photo.settings.margins !== 'none' ? {
              width: photo.settings.margins.includes('5') ? '5mm' : '10mm',
              color: photo.settings.margins.includes('white') ? '#ffffff' : '#000000'
            } : null
          }
        }
      });
    });

    return Object.values(photoGroups);
  };

  const getSizeAspectRatio = (sizeId) => {
    const ratios = {
      'kiosco': 10/15,      // 10x15 cm
      'medium': 13/18,      // 13x18 cm
      'large': 15/20,       // 15x20 cm
      'square-small': 1,    // 10x10 cm
      'square-large': 1     // 15x15 cm
    };
    return ratios[sizeId] || 1;
  };

  const getPhotoStyle = (photo) => {
    const settings = photo.settings || currentSettings;
    const aspectRatio = getSizeAspectRatio(selectedSize?.id);

    let containerStyle = {
      aspectRatio: aspectRatio,
      width: '144px',
      height: aspectRatio === 1 ? '144px' : '180px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    };

    // Calcular dimensiones correctas para imagen rotada
    const isRotated = settings.rotation === 90 || settings.rotation === 270;
    let imageStyle = {
      transform: `rotate(${settings.rotation || 0}deg)`,
      objectFit: settings.fit === 'fill' ? 'cover' : 'contain',
      transformOrigin: 'center center'
    };

    // Ajustar tamaño de imagen cuando está rotada para evitar bordes blancos
    if (isRotated && settings.fit === 'fill') {
      // Cuando la imagen está rotada 90° o 270°, necesita ser más grande para rellenar completamente
      const scaleFactor = Math.max(
        containerStyle.width / (aspectRatio * 144),
        (aspectRatio === 1 ? 144 : 180) / 144
      );
      imageStyle.width = `${100 * scaleFactor}%`;
      imageStyle.height = `${100 * scaleFactor}%`;
      imageStyle.minWidth = '120%';
      imageStyle.minHeight = '120%';
    } else {
      imageStyle.width = '100%';
      imageStyle.height = '100%';
    }

    // Aplicar márgenes
    if (settings.margins !== 'none') {
      const marginSize = settings.margins.includes('5') ? '4px' : '8px';
      const marginColor = settings.margins.includes('white') ? '#ffffff' : '#000000';
      imageStyle.border = `${marginSize} solid ${marginColor}`;
      imageStyle.boxSizing = 'border-box';
    }

    return { containerStyle, imageStyle };
  };

  const handleFillClick = () => {
    // Cuando se selecciona rellenar, resetear rotación si hay conflicto
    if (currentSettings.rotation !== 0) {
      setCurrentSettings(prev => ({ ...prev, fit: 'fill', rotation: 0 }));

      setEditedPhotos(prev => prev.map(photo => {
        if (selectedPhotos.has(photo.id)) {
          return {
            ...photo,
            settings: { ...photo.settings, fit: 'fill', rotation: 0 }
          };
        }
        return photo;
      }));
    } else {
      updateSetting('fit', 'fill');
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold text-[#2D3A52] mb-2">Editor de Fotos</h1>
            <p className="text-lg text-[#2D3A52]/70">Personaliza cada copia individualmente</p>
          </div>

          <div className="w-24"></div>
        </div>

        {/* Panel de controles horizontal */}
        <div className="bg-gradient-to-r from-[#CEDFE7] to-[#FCF4F3] rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Selección */}
            <div>
              <h4 className="font-semibold text-[#2D3A52] mb-3 text-center">Selección</h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="bg-white/80 hover:bg-white text-[#2D3A52] py-6 px-3 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap h-24 flex items-center justify-center"
                >
                  {selectedPhotos.size === editedPhotos.length ? 'Ninguna' : 'Todas'}
                </button>
              </div>
            </div>

            {/* Márgenes */}
            <div>
              <h4 className="font-semibold text-[#2D3A52] mb-3 text-center">Márgenes</h4>
              <div className="flex flex-col gap-2">
                {marginOptions.slice(0, 3).map(option => (
                  <button
                    key={option.id}
                    onClick={() => updateSetting('margins', option.id)}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      currentSettings.margins === option.id
                        ? 'bg-[#D75F1E] text-white'
                        : 'bg-white/80 hover:bg-white text-[#2D3A52]'
                    }`}
                  >
                    <i className={`${option.icon}`}></i>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#2D3A52] mb-3 text-center invisible">Más</h4>
              <div className="flex flex-col gap-2">
                {marginOptions.slice(3).map(option => (
                  <button
                    key={option.id}
                    onClick={() => updateSetting('margins', option.id)}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      currentSettings.margins === option.id
                        ? 'bg-[#D75F1E] text-white'
                        : 'bg-white/80 hover:bg-white text-[#2D3A52]'
                    }`}
                  >
                    <i className={`${option.icon}`}></i>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ajuste */}
            <div>
              <h4 className="font-semibold text-[#2D3A52] mb-3 text-center">Ajuste</h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFillClick}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    currentSettings.fit === 'fill'
                      ? 'bg-[#D75F1E] text-white'
                      : 'bg-white/80 hover:bg-white text-[#2D3A52]'
                  }`}
                >
                  <i className="ri-fullscreen-line"></i>
                  <span>Rellenar</span>
                </button>
                <button
                  onClick={() => updateSetting('fit', 'fit')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    currentSettings.fit === 'fit'
                      ? 'bg-[#D75F1E] text-white'
                      : 'bg-white/80 hover:bg-white text-[#2D3A52]'
                  }`}
                >
                  <i className="ri-picture-in-picture-line"></i>
                  <span>Encajar</span>
                </button>
              </div>
            </div>

            {/* Rotar */}
            <div>
              <h4 className="font-semibold text-[#2D3A52] mb-3 text-center">Rotar</h4>
              <button
                onClick={rotatePhotos}
                className="w-full bg-white/80 hover:bg-white text-[#2D3A52] py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap mb-4"
              >
                <i className="ri-refresh-line mr-1"></i>
                90°
              </button>
              <p className="text-xs text-[#2D3A52]/60 text-center">
                {currentSettings.rotation}°
              </p>
              {currentSettings.fit === 'fill' && currentSettings.rotation !== 0 && (
                <p className="text-xs text-orange-600 text-center mt-1">
                  Rotación optimizada
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Grid de fotos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 mb-8">
          {editedPhotos.map((photo) => {
            const { containerStyle, imageStyle } = getPhotoStyle(photo);

            return (
              <div
                key={photo.id}
                className="relative group cursor-pointer"
                onClick={() => togglePhotoSelection(photo.id)}
              >
                {/* Contenedor de imagen con proporción del tamaño */}
                <div className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                  selectedPhotos.has(photo.id)
                    ? 'ring-4 ring-[#D75F1E] shadow-xl transform scale-105'
                    : 'shadow-lg hover:shadow-xl hover:scale-105'
                }`}>
                  {/* Imagen con proporción y ajustes correctos */}
                  <div style={containerStyle}>
                    <img
                      src={photo.preview}
                      alt={photo.copyName}
                      style={imageStyle}
                    />

                  </div>

                  {/* Overlay de selección */}
                  {selectedPhotos.has(photo.id) && (
                    <div className="absolute inset-0 bg-[#D75F1E]/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#D75F1E] rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-lg"></i>
                      </div>
                    </div>
                  )}

                  {/* Checkbox esquina */}
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    selectedPhotos.has(photo.id)
                      ? 'bg-[#D75F1E] border-[#D75F1E]'
                      : 'bg-white/80 border-white/80'
                  }`}>
                    {selectedPhotos.has(photo.id) && (
                      <i className="ri-check-line text-white text-sm"></i>
                    )}
                  </div>
                </div>

                {/* Info de la foto */}
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium text-[#2D3A52] truncate">
                    {photo.copyName}
                  </p>
                  <p className="text-xs text-[#2D3A52]/60">
                    Copia {photo.copyIndex + 1}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón continuar */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="bg-[#D75F1E] text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-[#D75F1E]/90 transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-nowrap"
          >
            Continuar al Carrito
            <i className="ri-arrow-right-line ml-2 text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;
