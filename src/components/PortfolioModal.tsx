import React, { useState } from 'react';
import Image from 'next/image';

interface PortfolioItem {
  id?: number;
  image_url: string;
  caption: string;
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
    caption: item?.caption || '',
    service_type: item?.service_type || 'haircut'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo purposes, we'll just use a placeholder URL
      // In a real app, you'd upload to a service like Supabase Storage
      const placeholderUrl = `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(file.name)}`;
      handleChange('image_url', placeholderUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{backgroundColor: '#F7F0DE', border: '1px solid rgba(17, 75, 95, 0.2)'}}
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
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(247, 240, 222, 0.5)', 
                  borderColor: 'rgba(17, 75, 95, 0.3)', 
                  color: '#114B5F'
                }}
              />
              <p className="text-xs" style={{color: '#114B5F', opacity: 0.6}}>
                Or paste an image URL below
              </p>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(247, 240, 222, 0.5)', 
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
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(247, 240, 222, 0.5)', 
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
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(247, 240, 222, 0.5)', 
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
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                backgroundColor: 'rgba(17, 75, 95, 0.1)', 
                color: '#114B5F',
                border: '1px solid rgba(17, 75, 95, 0.2)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200"
              style={{backgroundColor: '#114B5F'}}
            >
              {item ? 'Update Item' : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
