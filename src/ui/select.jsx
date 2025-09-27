import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Context for Select
const SelectContext = React.createContext();

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        isOpen,
        setIsOpen,
        selectedValue,
        handleValueChange,
      }}
    >
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className = "", ...props }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown
        className={`h-4 w-4 opacity-50 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

const SelectValue = ({ placeholder = "" }) => {
  const { selectedValue } = React.useContext(SelectContext);

  return (
    <span className={selectedValue ? "" : "text-muted-foreground"}>
      {selectedValue || placeholder}
    </span>
  );
};

const SelectContent = ({ children, className = "", ...props }) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-full left-0 right-0 z-50 mt-1 bg-popover text-popover-foreground shadow-md rounded-md border p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const SelectItem = ({ children, value, className = "", ...props }) => {
  const { handleValueChange, selectedValue } = React.useContext(SelectContext);

  const isSelected = selectedValue === value;

  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer ${
        isSelected ? "bg-accent" : ""
      } ${className}`}
      onClick={() => handleValueChange(value)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
