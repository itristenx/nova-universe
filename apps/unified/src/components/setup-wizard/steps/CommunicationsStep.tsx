import React, { useEffect, useState } from 'react';

export interface CommunicationsStepProps {
  config: any;
  updateConfig: (updates: any) => void;
  validation: any;
  isLoading: boolean;
  sessionId: string | null;
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

export const CommunicationsStep: React.FC<CommunicationsStepProps> = () => {
  const [slackConnected, setSlackConnected] = useState(false);
  const [zoomConnected, setZoomConnected] = useState(false);

  useEffect(() => {
    fetch('/api/v1/integrations')
      .then((res) => res.json())
      .then((data) => {
        const slackConfig = data.storedConfigs?.slack;
        const zoomConfig = data.storedConfigs?.zoom;
        setSlackConnected(Boolean(slackConfig?.botToken || slackConfig?.accessToken));
        setZoomConnected(Boolean(zoomConfig?.accessToken));
      })
      .catch(() => {
        setSlackConnected(false);
        setZoomConnected(false);
      });
  }, []);

  const connectSlack = async () => {
    const res = await fetch('/api/v1/integrations/slack/auth-url');
    const data = await res.json();
    window.open(data.url, '_blank', 'noopener');
  };

  const connectZoom = async () => {
    const res = await fetch('/api/v1/integrations/zoom/auth-url');
    const data = await res.json();
    window.open(data.url, '_blank', 'noopener');
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Slack Integration
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          {slackConnected
            ? 'Slack workspace connected.'
            : 'Connect your Slack workspace to enable ticket creation and notifications.'}
        </p>
        <button
          onClick={connectSlack}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {slackConnected ? 'Reconnect Slack' : 'Connect Slack'}
        </button>
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Zoom Integration
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          {zoomConnected
            ? 'Zoom account connected.'
            : 'Connect Zoom to enable war-room meetings and call synchronization.'}
        </p>
        <button
          onClick={connectZoom}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {zoomConnected ? 'Reconnect Zoom' : 'Connect Zoom'}
        </button>
      </div>
    </div>
  );
};
