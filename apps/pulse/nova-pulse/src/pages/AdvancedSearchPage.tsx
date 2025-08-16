import React from 'react'
import { AdvancedSearchNavigation } from '../components/enhanced/AdvancedSearchNavigation'

const AdvancedSearchPage: React.FC = () => {
  const handleNavigate = (url: string, context?: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
    console.log('Navigating to:', url, 'with context:', context)
    // In real implementation, this could handle context preservation
    // across navigation, such as maintaining search state, filters, etc.
  }

  return (
    <div className="p-6">
      <AdvancedSearchNavigation onNavigate={handleNavigate} />
    </div>
  )
}

export default AdvancedSearchPage
