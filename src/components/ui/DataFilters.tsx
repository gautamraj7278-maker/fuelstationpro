import { Search, Filter, X, Calendar } from 'lucide-react';
import { Field, Input, Select } from './Field';

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface DataFiltersProps {
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  fields: FilterField[];
  className?: string;
  showClear?: boolean;
}

export default function DataFilters({
  filters,
  onFiltersChange,
  fields,
  className = '',
  showClear = true,
}: DataFiltersProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== null && v !== undefined);

  const handleChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    const cleared: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.type === 'daterange') {
        cleared[`${field.key}_from`] = '';
        cleared[`${field.key}_to`] = '';
      } else {
        cleared[field.key] = '';
      }
    });
    onFiltersChange(cleared);
  };

  return (
    <div className={`bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Filters</h3>
        </div>
        {showClear && hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800"
          >
            <X className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((field) => (
          <Field key={field.key} label={field.label}>
            {field.type === 'text' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  value={filters[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
                  className="pl-10"
                />
              </div>
            )}
            {field.type === 'select' && (
              <Select
                value={filters[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
              >
                <option value="">All {field.label}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            )}
            {field.type === 'date' && (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input type="date" value={filters[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} className="pl-10" />
              </div>
            )}
            {field.type === 'daterange' && (
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={filters[`${field.key}_from`] || ''} onChange={(e) => handleChange(`${field.key}_from`, e.target.value)} placeholder="From" />
                <Input type="date" value={filters[`${field.key}_to`] || ''} onChange={(e) => handleChange(`${field.key}_to`, e.target.value)} placeholder="To" />
              </div>
            )}
          </Field>
        ))}
      </div>
    </div>
  );
}