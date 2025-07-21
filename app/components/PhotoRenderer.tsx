// app/components/PhotoRenderer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface PhotoRendererProps {
  photoData: {
    id: string;
    originalImage: string;
    settings: {
      margins: any;
      rotation: number;
      fit: string;
    };
    size: {
      id: string;
      dimensions: string;
    };
  };
  onRenderComplete: (imageBlob: Blob) => void;
  quality?: number; // Calidad de salida (0.1 - 1.0)
}

const PhotoRenderer: React.FC<PhotoRendererProps> = ({ 
  photoData, 
  onRenderComplete, 
  quality = 0.95 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Configuración de tamaños para impresión (300 DPI)
  const getSizeConfig = (sizeId: string) => {
    const configs = {
      'kiosco': { width: 1181, height: 1772 },      // 10x15 cm a 300 DPI
      'medium': { width: 1535, height: 2126 },      // 13x18 cm a 300 DPI
      'large': { width: 1772, height: 2362 },       // 15x20 cm a 300 DPI
      'square-small': { width: 1181, height: 1181 }, // 10x10 cm a 300 DPI
      'square-large': { width: 1772, height: 1772 }  // 15x15 cm a 300 DPI
    };
    return configs[sizeId] || configs['kiosco'];
  };

  useEffect(() => {
    renderPhoto();
  }, [photoData]);

  const renderPhoto = async () => {
    if (!canvasRef.current) return;

    const sizeConfig = getSizeConfig(photoData.size.id);
    
    // Crear canvas de Fabric.js con dimensiones de impresión
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: sizeConfig.width,
      height: sizeConfig.height,
      backgroundColor: '#ffffff'
    });

    try {
      // Cargar imagen original
      const imgElement = await loadImage(photoData.originalImage);
      const fabricImg = new fabric.Image(imgElement, {
        selectable: false,
        evented: false
      });

      // Aplicar configuraciones de edición
      applyPhotoSettings(canvas, fabricImg, photoData.settings, sizeConfig);
      
      canvas.add(fabricImg);
      canvas.renderAll();

      // Exportar como blob de alta calidad
      const imageBlob = await exportCanvasAsBlob(canvas, quality);
      onRenderComplete(imageBlob);

    } catch (error) {
      console.error('Error rendering photo:', error);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const applyPhotoSettings = (
    canvas: fabric.Canvas, 
    fabricImg: fabric.Image, 
    settings: any, 
    sizeConfig: any
  ) => {
    const { width: canvasWidth, height: canvasHeight } = sizeConfig;

    // Calcular márgenes en píxeles
    let marginSize = 0;
    if (settings.margins?.type !== 'none') {
      const marginMM = settings.margins?.size || 0;
      marginSize = (marginMM / 25.4) * 300; // Convertir mm a píxeles a 300 DPI
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
    const imgWidth = fabricImg.width!;
    const imgHeight = fabricImg.height!;
    let scaleX, scaleY;

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
    if (settings.margins?.type !== 'none' && settings.margins?.color) {
      const marginRect = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvasWidth,
        height: canvasHeight,
        fill: settings.margins.color,
        selectable: false,
        evented: false
      });

      canvas.add(marginRect);
      canvas.sendToBack(marginRect);
    }
  };

  const exportCanvasAsBlob = (canvas: fabric.Canvas, quality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      canvas.getElement().toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', quality);
    });
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'none' }} // Oculto porque solo se usa para renderizar
    />
  );
};

export default PhotoRenderer;