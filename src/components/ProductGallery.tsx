'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ProductGalleryProps {
  images: string[]
  title: string
  className?: string
}

export default function ProductGallery({ images, title, className = '' }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const mainImage = images[selectedImage] || images[0]
  const hasMultipleImages = images.length > 1

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image Display */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
        {isMounted && (
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full cursor-zoom-in"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Image
              src={mainImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300"
              priority
            />
            
            {/* Zoom indicator */}
            <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium opacity-0 hover:opacity-100 transition-opacity">
              {isZoomed ? 'Klik for at zoome ud' : 'Klik for at zoome ind'}
            </div>
          </motion.div>
        )}

        {/* Premium shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Thumbnail Navigation */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index 
                  ? 'border-blue-500 shadow-md scale-105' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              whileHover={{ scale: selectedImage === index ? 1.05 : 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={image}
                alt={`${title} - billede ${index + 1}`}
                fill
                className="object-cover"
              />
              
              {/* Selected indicator */}
              {selectedImage === index && (
                <motion.div
                  layoutId="selected-indicator"
                  className="absolute inset-0 bg-blue-500/20"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="text-center text-sm text-slate-500">
          Billede {selectedImage + 1} af {images.length}
        </div>
      )}
    </div>
  )
}