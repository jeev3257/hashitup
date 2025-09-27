import React from "react";

export function Avatar({ children, className = "", ...props }) {
  return (
    <div
      className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({ children, className = "", ...props }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
