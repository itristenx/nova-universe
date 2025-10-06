import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Sparkles, Eye, EyeOff } from 'lucide-react';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  validation?: (value: any) => string | null;
  options?: { label: string; value: string | number }[];
  helpText?: string;
  aiSuggestion?: string;
  disabled?: boolean;
  rows?: number;
  min?: number;
  max?: number;
}

export interface SmartFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  aiEnabled?: boolean;
  className?: string;
}

export const SmartForm: React.FC<SmartFormProps> = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  loading = false,
  aiEnabled = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setFormData(initialData);
  }, [fields]);

  // Load AI suggestions
  useEffect(() => {
    if (aiEnabled) {
      const suggestions: Record<string, string> = {};
      fields.forEach(field => {
        if (field.aiSuggestion) {
          suggestions[field.name] = field.aiSuggestion;
        }
      });
      setAiSuggestions(suggestions);
    }
  }, [fields, aiEnabled]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: FormField) => {
    setTouched(prev => ({ ...prev, [field.name]: true }));
    
    // Validate on blur
    if (field.validation) {
      const error = field.validation(formData[field.name]);
      if (error) {
        setErrors(prev => ({ ...prev, [field.name]: error }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];

      // Required field validation
      if (field.required && (!value || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const applyAiSuggestion = (fieldName: string) => {
    if (aiSuggestions[fieldName]) {
      handleChange(fieldName, aiSuggestions[fieldName]);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];
    const error = touched[field.name] && errors[field.name];
    const hasAiSuggestion = aiEnabled && aiSuggestions[field.name];

    const baseInputClasses = `
      w-full px-4 py-2.5 rounded-apple-sm
      bg-white dark:bg-gray-800
      border ${error ? 'border-error-500' : 'border-gray-200 dark:border-gray-700'}
      text-gray-900 dark:text-white
      placeholder-gray-400
      font-sf-text text-sm
      focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-400 ease-apple
    `;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            rows={field.rows || 4}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            disabled={field.disabled || loading}
            className={baseInputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              id={field.id}
              name={field.name}
              checked={value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled || loading}
              className="w-5 h-5 rounded border-gray-300 text-apple-blue focus:ring-apple-blue"
            />
            <span className="text-sm font-sf-text text-gray-700 dark:text-gray-300">
              {field.label}
            </span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={field.disabled || loading}
                  className="w-5 h-5 border-gray-300 text-apple-blue focus:ring-apple-blue"
                />
                <span className="text-sm font-sf-text text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword[field.name] ? 'text' : 'password'}
              id={field.id}
              name={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field)}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              className={`${baseInputClasses} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, [field.name]: !prev[field.name] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={showPassword[field.name] ? 'Hide password' : 'Show password'}
            >
              {showPassword[field.name] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            min={field.min}
            max={field.max}
            className={baseInputClasses}
          />
        );

      default:
        return (
          <input
            type={field.type}
            id={field.id}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <AnimatePresence mode="popLayout">
        {fields.map((field, index) => {
          const error = touched[field.name] && errors[field.name];
          const hasAiSuggestion = aiEnabled && aiSuggestions[field.name];

          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0.0, 0.2, 1] }}
              className={field.type === 'checkbox' ? '' : 'space-y-2'}
            >
              {field.type !== 'checkbox' && (
                <label
                  htmlFor={field.id}
                  className="flex items-center gap-2 text-sm font-sf-text font-medium text-gray-700 dark:text-gray-300"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-error-500">*</span>
                  )}
                </label>
              )}

              {renderField(field)}

              {/* Help text or AI suggestion */}
              {(field.helpText || hasAiSuggestion) && !error && (
                <div className="flex items-start gap-2">
                  {hasAiSuggestion ? (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => applyAiSuggestion(field.name)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-apple-sm bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-xs font-sf-text transition-all duration-400 ease-apple"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI suggests: "{aiSuggestions[field.name]}"
                    </motion.button>
                  ) : (
                    <p className="flex items-start gap-2 text-xs font-sf-text text-gray-500 dark:text-gray-400">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {field.helpText}
                    </p>
                  )}
                </div>
              )}

              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-xs font-sf-text text-error-500"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Form actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-apple-blue hover:bg-apple-blue-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-apple-sm font-sf-text font-medium transition-all duration-400 ease-apple hover-lift disabled:cursor-not-allowed disabled:transform-none shadow-apple"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Processing...
            </span>
          ) : (
            submitLabel
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-apple-sm font-sf-text font-medium transition-all duration-400 ease-apple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  );
};
