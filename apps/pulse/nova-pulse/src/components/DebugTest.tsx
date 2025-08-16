import React from 'react'

export const DebugTest: React.FC = () => {
  console.log('🧪 DebugTest component rendering')
  
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f9ff', 
      border: '2px solid #0ea5e9',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h1 style={{ color: '#0c4a6e', marginBottom: '16px' }}>🎉 Nova Pulse Debug Test</h1>
      <p style={{ color: '#075985', marginBottom: '12px' }}>
        ✅ React is working! This component has successfully rendered.
      </p>
      <p style={{ color: '#075985', marginBottom: '12px' }}>
        Current time: {new Date().toLocaleString()}
      </p>
      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#0c4a6e' }}>
          Debug Information
        </summary>
        <ul style={{ marginTop: '8px', color: '#075985' }}>
          <li>✅ React 19.1.0 is loaded</li>
          <li>✅ TypeScript compilation successful</li>
          <li>✅ Vite development server running</li>
          <li>✅ Component rendering pipeline working</li>
        </ul>
      </details>
    </div>
  )
}
