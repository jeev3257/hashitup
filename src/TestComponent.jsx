import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ backgroundColor: 'red', color: 'white', padding: '20px', fontSize: '24px' }}>
      <h1>Test Component - If you see this, React is working!</h1>
      <div className="bg-blue-500 text-white p-4 m-4">
        This should be blue if Tailwind is working
      </div>
    </div>
  );
};

export default TestComponent;