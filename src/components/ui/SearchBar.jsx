import { Search, X } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = 'Search…', label = 'Search', onSubmit, className }) {
  return (
    <form
      className={`search-bar ${className ?? ''}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <label className="sr-only" htmlFor={`search-${label}`}>
        {label}
      </label>
      <div className="input-group">
        <Search size={16} className="input-icon" />
        <input
          id={`search-${label}`}
          className="input"
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            style={{ position: 'absolute', right: 4 }}
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </form>
  );
}
