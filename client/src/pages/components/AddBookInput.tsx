import React from 'react';

interface AddBookInputProps {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'number';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
    min?: string;
    max?: string | number;
}

const AddBookInput: React.FC<AddBookInputProps> = ({
    id,
    name,
    label,
    type,
    value,
    onChange,
    required = false,
    disabled = false,
    min,
    max
}) => {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
            />
        </div>
    );
};

export default AddBookInput; 