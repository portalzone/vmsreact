const FilterInput = ({ label, name, value, onChange, type = "text", placeholder, options, min, max }) => {
  if (type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <select
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          className="form-input"
        >
          <option value="">All</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'date') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
          type="date"
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          className="form-input"
        />
      </div>
    );
  }

  if (type === 'number') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
          type="number"
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className="form-input"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  );
};

export default FilterInput;