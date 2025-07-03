import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel: string;
  rightLabel: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
}

export default function ToggleSwitch({
  checked,
  onChange,
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon,
  disabled = false
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        {/* Label gauche */}
        <span className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          !checked 
            ? 'text-blue-600' 
            : 'text-gray-500'
        }`}>
          {leftIcon}
          {leftLabel}
        </span>
        
        {/* Switch */}
        <div className="relative mx-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              checked 
                ? 'bg-blue-500' 
                : 'bg-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
            onClick={() => !disabled && onChange(!checked)}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                checked ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
        
        {/* Label droit */}
        <span className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          checked 
            ? 'text-blue-600' 
            : 'text-gray-500'
        }`}>
          {rightIcon}
          {rightLabel}
        </span>
      </div>
    </div>
  );
}
