import React, { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface DynamicFilterField {
  id: string;
  name: string;
  type: 'select' | 'multiselect';
  options: string[];
}

interface TherapistFiltersProps {
  onApplyFilters: (filters: Record<string, string[]>) => void;
}

const TherapistFilters: React.FC<TherapistFiltersProps> = ({ onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterFields, setFilterFields] = useState<DynamicFilterField[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchFilterableFields = async () => {
      const { data, error } = await supabase
        .from('profile_fields')
        .select('id, name, type, options')
        .eq('is_filterable', true);

      if (error) {
        console.error('Failed to fetch filterable fields:', error);
        return;
      }

      const formatted: DynamicFilterField[] = (data || []).map((field: any) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        options: field.options || [],
      }));

      setFilterFields(formatted);
    };

    fetchFilterableFields();
  }, []);

  const toggleFilterValue = (fieldId: string, value: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[fieldId] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [fieldId]: updatedValues,
      };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <Filter size={20} />
        <span>Filters</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-72 bg-white rounded-lg shadow-xl p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {filterFields.map((field) => (
              <div key={field.id}>
                <h4 className="font-medium text-sm text-gray-700 mb-2">{field.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {field.options.map((option) => {
                    const selected = selectedFilters[field.id]?.includes(option) || false;
                    return (
                      <button
                        key={option}
                        onClick={() => toggleFilterValue(field.id, option)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selected
                            ? 'bg-[#004D4D] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleApply}
            className="w-full mt-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TherapistFilters;
