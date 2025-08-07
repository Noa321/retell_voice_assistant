import React from 'react';
import { VoiceWidget } from '@/components/VoiceWidget';

interface EmbedProps {
  apiKey: string;
  agentId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  buttonSize?: 'small' | 'medium' | 'large';
}

export default function Embed({
  apiKey,
  agentId,
  position = 'bottom-right',
  primaryColor = '#2563EB',
  buttonSize = 'medium'
}: EmbedProps) {
  // This page is designed to be embedded in an iframe or used directly
  return (
    <div className="w-full h-full">
      <VoiceWidget
        apiKey={apiKey}
        agentId={agentId}
        position={position}
        primaryColor={primaryColor}
        buttonSize={buttonSize}
      />
    </div>
  );
}
