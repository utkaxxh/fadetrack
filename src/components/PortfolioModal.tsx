import React, { useState } from 'react';
import Image from 'next/image';

interface PortfolioItem {
  id?: number;
  image_url: string;
  caption?: string;
  description?: string;
  service_type: string;
  created_at?: string;
}

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: {
    image_url: string;
    caption: string;
    service_type: string;
  }) => void;
  item?: PortfolioItem;
}

export default function PortfolioModal({ 
  isOpen, 
  onClose, 
  onSave, 
  item 
}: PortfolioModalProps) {
  const [formData, setFormData] = useState({
    image_url: item?.image_url || '',
    caption: item?.caption || item?.description || '',
    service_type: item?.service_type || 'haircut'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const serviceTypes = [
    { value: 'haircut', label: 'Haircut' },
    { value: 'beard_trim', label: 'Beard Trim' },
    { value: 'color', label: 'Hair Color' },
    { value: 'styling', label: 'Hair Styling' },
    { value: 'treatment', label: 'Hair Treatment' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.image_url.trim()) {
      newErrors.image_url = 'Image URL is required';
    }
    
    if (!formData.caption.trim()) {
      newErrors.caption = 'Caption is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image_url: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)' }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image_url: 'File size must be less than 5MB' }));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrors(prev => ({ ...prev, image_url: '' }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'portfolio'); // Organize images in folders

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/uploadImage', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      handleChange('image_url', result.url);
      
      // Reset upload state after a brief delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ 
        ...prev, 
        image_url: error instanceof Error ? error.message : 'Failed to upload image' 
      }));
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{backgroundColor: '#f1f5f9', border: '1px solid rgba(17, 75, 95, 0.2)'}}
      >
        <div 
          className="flex items-center justify-between p-6"
          style={{borderBottom: '1px solid rgba(17, 75, 95, 0.2)'}}
        >
          <h2 className="text-xl font-semibold" style={{color: '#114B5F'}}>
            {item ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{color: '#114B5F', opacity: 0.7}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
              Upload Image *
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 bg-slate-100 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'rgba(17, 75, 95, 0.3)', 
                  color: '#114B5F'
                }}
              />
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm" style={{color: '#114B5F'}}>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <p className="text-xs" style={{color: '#114B5F', opacity: 0.6}}>
                Or paste an image URL below (Max size: 5MB, formats: JPEG, PNG, WebP, GIF)
              </p>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                disabled={isUploading}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 bg-slate-100 focus:bg-white disabled:opacity-50"
                style={{
                  borderColor: errors.image_url ? '#ef4444' : 'rgba(17, 75, 95, 0.3)', 
                  color: '#114B5F'
                }}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && (
                <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>
              )}
            </div>
          </div>

          {formData.image_url && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Image Preview
              </label>
              <div 
                className="w-full h-48 rounded-lg border-2 border-dashed flex items-center justify-center"
                style={{borderColor: 'rgba(17, 75, 95, 0.3)'}}
              >
                <Image
                  src={formData.image_url}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={() => {
                    // If image fails to load, show placeholder
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
              Caption *
            </label>
            <textarea
              value={formData.caption}
              onChange={(e) => handleChange('caption', e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 bg-slate-100 focus:bg-white"
              style={{
                borderColor: errors.caption ? '#ef4444' : 'rgba(17, 75, 95, 0.3)', 
                color: '#114B5F'
              }}
              placeholder="Describe this work..."
            />
            {errors.caption && (
              <p className="text-red-500 text-sm mt-1">{errors.caption}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
              Service Type
            </label>
            <select
              value={formData.service_type}
              onChange={(e) => handleChange('service_type', e.target.value)}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 bg-slate-100 focus:bg-white"
              style={{
                borderColor: 'rgba(17, 75, 95, 0.3)', 
                color: '#114B5F'
              }}
            >
              {serviceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'rgba(17, 75, 95, 0.08)', 
                color: '#114B5F',
                border: '1px solid rgba(17, 75, 95, 0.2)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 btn-primary-teal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : (item ? 'Update Item' : 'Add to Portfolio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
