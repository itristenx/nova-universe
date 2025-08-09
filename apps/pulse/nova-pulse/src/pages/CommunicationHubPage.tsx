import React from 'react'
import { CommunicationHub } from '../components/enhanced/CommunicationHub'
import type { CommunicationMessage } from '../components/enhanced/CommunicationHub'

const CommunicationHubPage: React.FC = () => {
  const handleMessageSend = (message: Omit<CommunicationMessage, 'id' | 'timestamp'>) => {
    console.log('Sending message:', message)
    // In real implementation, this would make an API call
    // to send the message through the appropriate channel
  }

  const handleEscalationTrigger = (workflowId: string, messageId: string) => {
    console.log('Triggering escalation:', { workflowId, messageId })
    // In real implementation, this would initiate the escalation workflow
    // and notify the appropriate stakeholders
  }

  return (
    <div className="p-6">
      <CommunicationHub
        onMessageSend={handleMessageSend}
        onEscalationTrigger={handleEscalationTrigger}
      />
    </div>
  )
}

export default CommunicationHubPage
