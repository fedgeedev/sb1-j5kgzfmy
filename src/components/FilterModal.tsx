import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Therapist } from '../types';
import { useDirectoryStore } from '../store/directoryStore';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  onClear: () => void;
  therapists: Therapist[];
  activeFilters: Record<string, any>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  therapists,
  activeFilters
}) => {
  const { sections, loadSectionsFromDB } = useDirectoryStore();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(activeFilters);
  const [filterSections, setFilterSections] = useState<any[]>([]);

  useEffect(() => {
    loadSectionsFromDB();
  }, []);

  useEffect(() => {
    const filters = sections
      .map(section => ({
        id: section.id,
        name: section.name,
        fields: section.fields.filter(field =>
          (field.type === 'select' || field.type === 'multiselect') &&
          (field as any).filter === true
        )
      }))
      .filter(section => section.fields.length > 0);

    setFilterSections(filters);
  }, [sections]);

  useEffect(() => {
    setSelectedFilters(activeFilters);
  }, [activeFilters]);

  const handleFilterChange = (fieldId: string, value: string) => {
    setSelectedFilters(prev => {
      if (prev[fieldId] === value) {
        const { [fieldId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fieldId]: value };
    });
  };

  const handleMultiFilterChange = (fieldId: string, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [fieldId]: newValues
      };
    });
  };

  const handleClear = () => {
    setSelectedFilters({});
    onClear();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#004D4D]">Filters</h2>
          <button
            onClick={onClose}
            aria-label="Close Filter Modal"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {filterSections.map(section => (
            <div key={section.id} className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{section.name}</h3>
              {section.fields.map(field => (
                <div key={field.id} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{field.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {field.options?.map(option => {
                      const isSelected = field.type === 'multiselect'
                        ? (selectedFilters[field.id] || []).includes(option)
                        : selectedFilters[field.id] === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => field.type === 'multiselect'
                            ? handleMultiFilterChange(field.id, option)
                            : handleFilterChange(field.id, option)
                          }
                          className={`group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#004D4D] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                              <Check size={14} />
                            </span>
                          )}
                          <span className={isSelected ? 'ml-4' : ''}>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-between gap-4">
          <button
            onClick={handleClear}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={() => {
              onApply(selectedFilters);
              onClose();
            }}
            className="px-6 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] transition-colors shadow-md hover:shadow-lg"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
