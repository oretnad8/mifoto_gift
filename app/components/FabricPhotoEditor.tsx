// app/components/FabricPhotoEditor.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';

const FabricPhotoEditor = ({ photos, selectedSize, onEditComplete, onBack }) => {
  const [editedPhotos, setEditedPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [currentSettings, setCurrentSettings] = useState({
    margins: 'none',
    rotation: 0,
    fit: 'fill'
  });
  const [canvases, setCanvases] = useState(new Map());
  const canvasRefs = useRef(new Map());

  // Configuración de tamaños en píxeles (300 DPI para impresión)
  const getSizeConfig = (sizeId) => {
    const configs = {
      'kiosco': { width: 1181, height: 1772, aspectRatio: 10/15 },      // 10x15 cm
      'medium': { width: 1535, height: 2126, aspectRatio: 13/18 },      // 13x18 cm  
      'large': { width: 1772, height: 2362, aspectRatio: 15/20 },       // 15x20 cm
      'square-small': { width: 1181, height: 1181, aspectRatio: 1 },    // 10x10 cm
      'square-large': { width: 1772, height: 1772, aspectRatio: 1 }     // 15x15 cm
    };
    return configs[sizeId] || configs['kiosco'];
  };

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

  useEffect(() => {
    // Expandir fotos según su cantidad
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

  useEffect(() => {
    // Inicializar canvas para cada foto
    editedPhotos.forEach(photo => {
      if (!canvases.has(photo.id)) {
        initializeCanvas(photo);
      }
    });
  }, [editedPhotos]);

  const initializeCanvas = async (photo) => {
    const canvasId = `canvas-${photo.id}`;
    const canvasElement = document.getElementById(canvasId);
    
    if (!canvasElement) return;

    const sizeConfig = getSizeConfig(selectedSize?.id);
    const displaySize = 200; // Tamaño para mostrar en pantalla
    const scale = displaySize / Math.max(sizeConfig.width, sizeConfig.height);

    const canvas = new fabric.Canvas(canvasId, {
      width: sizeConfig.width * scale,
      height: sizeConfig.height * scale,
      backgroundColor: '#ffffff',
      selection: false,
      preserveObjectStacking: true
    });

    // Cargar la imagen
    try {
      const imgElement = await loadImage(photo.preview);
      const fabricImg = new fabric.Image(imgElement, {
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });

      // Aplicar configuraciones iniciales
      applyImageSettings(canvas, fabricImg, photo.settings, sizeConfig, scale);
      
      canvas.add(fabricImg);
      canvas.renderAll();

      // Guardar referencia del canvas
      setCanvases(prev => new Map(prev.set(photo.id, canvas)));
      canvasRefs.current.set(photo.id, canvas);

    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const applyImageSettings = (canvas, fabricImg, settings, sizeConfig, scale) => {
    const canvasWidth = sizeConfig.width * scale;
    const canvasHeight = sizeConfig.height * scale;

    // Calcular márgenes en píxeles
    let marginSize = 0;
    if (settings.margins !== 'none') {
      const marginMM = settings.margins.includes('5') ? 5 : 10;
      marginSize = (marginMM / 25.4) * 300 * scale; // Convertir mm a píxeles con escala
    }

    const effectiveWidth = canvasWidth - (marginSize * 2);
    const effectiveHeight = canvasHeight - (marginSize * 2);

    // Aplicar rotación
    fabricImg.set({
      angle: settings.rotation || 0,
      originX: 'center',
      originY: 'center'
    });

    // Calcular escala según el modo fit
    let scaleX, scaleY;
    const imgWidth = fabricImg.width;
    const imgHeight = fabricImg.height;

    if (settings.fit === 'fill') {
      // Rellenar: escalar para cubrir toda el área, puede recortar
      const scaleToFillX = effectiveWidth / imgWidth;
      const scaleToFillY = effectiveHeight / imgHeight;
      const scaleToFill = Math.max(scaleToFillX, scaleToFillY);
      scaleX = scaleY = scaleToFill;
    } else {
      // Encajar: escalar para que quepa completa, puede dejar espacios
      const scaleToFitX = effectiveWidth / imgWidth;
      const scaleToFitY = effectiveHeight / imgHeight;
      const scaleToFit = Math.min(scaleToFitX, scaleToFitY);
      scaleX = scaleY = scaleToFit;
    }

    fabricImg.set({
      scaleX,
      scaleY,
      left: canvasWidth / 2,
      top: canvasHeight / 2,
    });

    // Aplicar márgenes si existen
    if (settings.margins !== 'none') {
      const marginColor = settings.margins.includes('white') ? '#ffffff' : '#000000';
      
      // Crear rectángulo de fondo para el margen
      const marginRect = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvasWidth,
        height: canvasHeight,
        fill: marginColor,
        selectable: false,
        evented: false
      });

      canvas.add(marginRect);
      canvas.sendToBack(marginRect);
    }

    return fabricImg;
  };

  const updatePhotoSettings = (photoIds, newSettings) => {
    setEditedPhotos(prev => prev.map(photo => {
      if (photoIds.includes(photo.id)) {
        const updatedPhoto = {
          ...photo,
          settings: { ...photo.settings, ...newSettings }
        };

        // Actualizar canvas correspondiente
        const canvas = canvasRefs.current.get(photo.id);
        if (canvas) {
          updateCanvas(canvas, updatedPhoto);
        }

        return updatedPhoto;
      }
      return photo;
    }));
  };

  const updateCanvas = (canvas, photo) => {
    const sizeConfig = getSizeConfig(selectedSize?.id);
    const displaySize = 200;
    const scale = displaySize / Math.max(sizeConfig.width, sizeConfig.height);

    // Limpiar canvas
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    // Recargar y aplicar configuraciones
    loadImage(photo.preview).then(imgElement => {
      const fabricImg = new fabric.Image(imgElement, {
        selectable: false,
        evented: false
      });

      applyImageSettings(canvas, fabricImg, photo.settings, sizeConfig, scale);
      canvas.add(fabricImg);
      canvas.renderAll();
    });
  };

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

    // Aplicar a fotos seleccionadas
    const selectedIds = Array.from(selectedPhotos);
    if (selectedIds.length > 0) {
      updatePhotoSettings(selectedIds, { [setting]: value });
    }
  };

  const rotatePhotos = () => {
    const newRotation = (currentSettings.rotation + 90) % 360;
    updateSetting('rotation', newRotation);
  };

  const handleFillClick = () => {
    if (currentSettings.rotation !== 0) {
      setCurrentSettings(prev => ({ ...prev, fit: 'fill', rotation: 0 }));
      const selectedIds = Array.from(selectedPhotos);
      if (selectedIds.length > 0) {
        updatePhotoSettings(selectedIds, { fit: 'fill', rotation: 0 });
      }
    } else {
      updateSetting('fit', 'fill');
    }
  };

  const generateFinalImage = async (photo) => {
    const canvas = canvasRefs.current.get(photo.id);
    if (!canvas) return null;

    // Crear canvas a tamaño real para impresión (300 DPI)
    const sizeConfig = getSizeConfig(selectedSize?.id);
    const printCanvas = new fabric.Canvas(null, {
      width: sizeConfig.width,
      height: sizeConfig.height,
      backgroundColor: '#ffffff'
    });

    try {
      const imgElement = await loadImage(photo.preview);
      const fabricImg = new fabric.Image(imgElement, {
        selectable: false,
        evented: false
      });

      applyImageSettings(printCanvas, fabricImg, photo.settings, sizeConfig, 1);
      printCanvas.add(fabricImg);
      printCanvas.renderAll();

      // Exportar como blob de alta calidad
      return new Promise(resolve => {
        printCanvas.getElement().toBlob(resolve, 'image/jpeg', 0.95);
      });

    } catch (error) {
      console.error('Error generating final image:', error);
      return null;
    }
  };

  const handleContinue = async () => {
    // Generar imágenes finales para cada copia
    const processedPhotos = await preparePhotosForBackend(editedPhotos);
    onEditComplete(processedPhotos);
  };

  const preparePhotosForBackend = async (photos) => {
    const photoGroups = {};

    for (const photo of photos) {
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

      // Generar imagen final renderizada
      const finalImageBlob = await generateFinalImage(photo);

      photoGroups[originalId].copies.push({
        copyId: photo.id,
        copyIndex: photo.copyIndex,
        finalImage: finalImageBlob, // Imagen ya renderizada
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
    }

    return Object.values(photoGroups);
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
            <h1 className="text-3xl font-bold text-[#2D3A52] mb-2">Editor Profesional</h1>
            <p className="text-lg text-[#2D3A52]/70">Personaliza cada copia con precisión</p>
          </div>

          <div className="w-24"></div>
        </div>

        {/* Panel de controles */}
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
            </div>
          </div>
        </div>

        {/* Grid de fotos con canvas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 mb-8">
          {editedPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer"
              onClick={() => togglePhotoSelection(photo.id)}
            >
              <div className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                selectedPhotos.has(photo.id)
                  ? 'ring-4 ring-[#D75F1E] shadow-xl transform scale-105'
                  : 'shadow-lg hover:shadow-xl hover:scale-105'
              }`}>
                {/* Canvas para preview */}
                <canvas
                  id={`canvas-${photo.id}`}
                  className="w-full h-auto"
                  style={{ maxWidth: '200px', maxHeight: '240px' }}
                />

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
          ))}
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

export default FabricPhotoEditor;