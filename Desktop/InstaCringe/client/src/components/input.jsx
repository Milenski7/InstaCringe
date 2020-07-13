import React from "react";

const Input = ({ name, value, type, label, onChange, error, className }) => {
    return (
        <div className="form-group">
            <label className="input-label" htmlFor={name}>
                {label}
            </label>
            <input
                value={value}
                name={name}
                onChange={onChange}
                id={name}
                type={type}
                className={className}
            />
            {error && <div className="alert">{error}</div>}
        </div>
    );
};

export default Input;