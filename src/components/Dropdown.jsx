import React, { useEffect, useRef, useState } from "react";

export default function Dropdown({
  label,
  placeholder = "Select…",
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleDocumentMouseDown = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !popoverRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () =>
      document.removeEventListener("mousedown", handleDocumentMouseDown);
  }, []);

  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel = selectedOption?.label ?? "";

  return (
    <div className={`relative ${disabled ? "opacity-60" : ""}`}>
      {label && <label className="block text-sm mb-1">{label}</label>}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-left text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950/60 dark:focus:border-cyan-500 flex items-center justify-between"
      >
        <span className={`${selectedLabel ? "" : "text-gray-400"}`}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full mt-1 z-40 w-full rounded-xl border bg-white shadow-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900"
          role="listbox"
          tabIndex={-1}
        >
          <div className="max-h-60 overflow-auto py-1 cc-scroll">
            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No options</div>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  option.value === value
                    ? "bg-gray-50 dark:bg-gray-800/70 font-medium"
                    : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {required && (
        <input
          tabIndex={-1}
          className="hidden"
          value={value}
          onChange={() => {}}
          required
        />
      )}
    </div>
  );
}
