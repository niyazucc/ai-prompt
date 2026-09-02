import { ChevronDown } from 'lucide-react';

const CUSTOM_OPTION = '__custom__';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function SelectField({ id, label, value, options, onChange }: SelectFieldProps) {
  const isCustomValue = !options.includes(value);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="select-wrap">
        <select
          id={id}
          value={isCustomValue ? CUSTOM_OPTION : value}
          onChange={(event) => onChange(event.target.value === CUSTOM_OPTION ? '' : event.target.value)}
        >
          {options.map((option) => <option key={option}>{option}</option>)}
          <option value={CUSTOM_OPTION}>Tulis sendiri...</option>
        </select>
        <ChevronDown aria-hidden="true" size={16} />
      </div>
      {isCustomValue && (
        <input
          className="custom-value-input"
          id={`${id}-custom`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Tulis pilihan anda sendiri..."
          aria-label={`${label} — pilihan sendiri`}
          autoFocus
        />
      )}
    </div>
  );
}
