import React from 'react';

export default function Table({ className = '', children }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="table table-zebra w-full text-sm">
        {children}
      </table>
    </div>
  );
}
