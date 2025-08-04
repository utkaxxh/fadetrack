import React, { useState } from 'react';

interface Service {
  id?: number;
  service_name: string;
  description: string;
  price_min: number;
  price_max: number;
  duration_minutes: number;
  is_active: boolean;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: {
    service_name: string;
    description: string;
    price_min: number;
    price_max: number;
    duration_minutes: number;
    is_active: boolean;
  }) => void;
  service?: Service;
}

export default function ServiceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  service 
}: ServiceModalProps) {
  const [formData, setFormData] = useState({
    service_name: service?.service_name || '',
    description: service?.description || '',
    price_min: service?.price_min || 0,
    price_max: service?.price_max || 0,
    duration_minutes: service?.duration_minutes || 60,
    is_active: service?.is_active ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Service name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.price_min <= 0) {
      newErrors.price_min = 'Minimum price must be greater than 0';
    }
    
    if (formData.price_max < formData.price_min) {
      newErrors.price_max = 'Maximum price must be greater than or equal to minimum price';
    }
    
    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duration must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
            {service ? 'Edit Service' : 'Add New Service'}
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
              Service Name *
            </label>
            <input
              type="text"
              value={formData.service_name}
              onChange={(e) => handleChange('service_name', e.target.value)}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(247, 240, 222, 0.5)', 
                borderColor: errors.service_name ? '#ef4444' : 'rgba(17, 75, 95, 0.3)', 
                color: '#114B5F'
              }}
              placeholder="e.g., Men's Haircut, Beard Trim"
            />
            {errors.service_name && (
              <p className="text-red-500 text-sm mt-1">{errors.service_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(247, 240, 222, 0.5)', 
                borderColor: errors.description ? '#ef4444' : 'rgba(17, 75, 95, 0.3)', 
                color: '#114B5F'
              }}
              placeholder="Describe what's included in this service..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Minimum Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price_min}
                onChange={(e) => handleChange('price_min', parseFloat(e.target.value) || 0)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(247, 240, 222, 0.5)', 
                  borderColor: errors.price_min ? '#ef4444' : 'rgba(17, 75, 95, 0.3)', 
                  color: '#114B5F'
                }}
              />
              {errors.price_min && (
                <p className="text-red-500 text-sm mt-1">{errors.price_min}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
                Maximum Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price_max}
                onChange={(e) => handleChange('price_max', parseFloat(e.target.value) || 0)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(247, 240, 222, 0.5)', 
                  borderColor: errors.price_max ? '#ef4444' : 'rgba(17, 75, 95, 0.3)', 
                  color: '#114B5F'
                }}
              />
              {errors.price_max && (
                <p className="text-red-500 text-sm mt-1">{errors.price_max}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
              Duration (minutes) *
            </label>
            <input
              type="number"
              min="1"
              value={formData.duration_minutes}
              onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 60)}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(247, 240, 222, 0.5)', 
                borderColor: errors.duration_minutes ? '#ef4444' : 'rgba(17, 75, 95, 0.3)', 
                color: '#114B5F'
              }}
            />
            {errors.duration_minutes && (
              <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm" style={{color: '#114B5F'}}>
              Service is active and available for booking
            </label>
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
              {service ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
