'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  label?: string
  description?: string
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  label = "Billeder",
  description = "Upload billeder af præmien"
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleFileUpload = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      alert(`Du kan maksimalt uploade ${maxImages} billeder`)
      return
    }

    setIsUploading(true)
    const newImages: string[] = []

    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert(`Billede "${file.name}" er for stort. Maksimal størrelse er 5MB.`)
            continue
          }

          const base64 = await convertToBase64(file)
          newImages.push(base64)
        } else {
          alert(`"${file.name}" er ikke et gyldigt billedformat`)
        }
      }

      onImagesChange([...images, ...newImages])
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Der opstod en fejl ved upload af billeder')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    onImagesChange(updatedImages)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {images.length > 0 && <span className="text-slate-500">({images.length}/{maxImages})</span>}
      </label>
      <p className="text-sm text-slate-500 mb-4">{description}</p>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading || images.length >= maxImages}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-slate-600">Uploader billeder...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">
              {images.length >= maxImages 
                ? `Maksimalt ${maxImages} billeder uploadet`
                : 'Træk billeder hertil eller klik for at vælge'
              }
            </p>
            <p className="text-xs text-slate-500">
              PNG, JPG, GIF op til 5MB ({maxImages - images.length} tilbage)
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Billede {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* URL Input Alternative */}
      <div className="mt-4">
        <details className="group">
          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
            ➕ Tilføj billede via URL
          </summary>
          <div className="mt-3 p-4 border border-slate-200 rounded-lg">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement
                  const url = input.value.trim()
                  if (url && images.length < maxImages) {
                    onImagesChange([...images, url])
                    input.value = ''
                  }
                }
              }}
            />
            <p className="text-xs text-slate-500 mt-1">Indtast URL og tryk Enter</p>
          </div>
        </details>
      </div>
    </div>
  )
}