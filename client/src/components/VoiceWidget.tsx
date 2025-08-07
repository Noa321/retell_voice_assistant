import React, { useState, useCallback } from 'react';
import { VoiceButton, type VoiceState } from '@/components/ui/voice-button';
import { useRetellClient } from '@/hooks/use-retell-client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceWidgetProps {
  apiKey: string;
  agentId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  buttonSize?: 'small' | 'medium' | 'large';
  className?: string;
}

interface VoiceWidgetState {
  voiceState: VoiceState;
  showErrorModal: boolean;
  errorMessage: string;
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6', 
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

const statusMessages = {
  idle: 'Click to start conversation',
  listening: 'Listening... Click to stop',
  processing: 'Processing your request...',
  speaking: 'AI is speaking...',
  error: 'Error occurred. Click to retry',
};

export function VoiceWidget({
  apiKey,
  agentId,
  position = 'bottom-right',
  primaryColor = '#2563EB',
  buttonSize = 'medium',
  className
}: VoiceWidgetProps) {
  const { toast } = useToast();

  const [state, setState] = useState<VoiceWidgetState>({
    voiceState: 'idle',
    showErrorModal: false,
    errorMessage: '',
  });

  const [showTooltip, setShowTooltip] = useState(false);

  // Initialize Retell client
  const {
    isInitialized,
    isCallActive,
    isAgentSpeaking,
    startCall,
    stopCall,
  } = useRetellClient({
    onCallStarted: () => {
      setState(prev => ({ ...prev, voiceState: 'listening' }));
    },
    onCallEnded: () => {
      setState(prev => ({ ...prev, voiceState: 'idle' }));
    },
    onAgentStartTalking: () => {
      setState(prev => ({ ...prev, voiceState: 'speaking' }));
    },
    onAgentStopTalking: () => {
      setState(prev => ({ 
        ...prev, 
        voiceState: isCallActive ? 'listening' : 'idle' 
      }));
    },
    onError: (error) => {
      console.error('Retell client error:', error);
      setState(prev => ({
        ...prev,
        voiceState: 'error',
        errorMessage: 'Connection error occurred',
        showErrorModal: true,
      }));
    },
  });

  const handleVoiceButtonClick = useCallback(async () => {
    if (!isInitialized) {
      setState(prev => ({
        ...prev,
        voiceState: 'error',
        errorMessage: 'Voice service not initialized. Please refresh and try again.',
        showErrorModal: true,
      }));
      return;
    }

    switch (state.voiceState) {
      case 'idle':
        try {
          setState(prev => ({ ...prev, voiceState: 'processing' }));
          
          // Create web call through our backend
          const response = await fetch('/api/voice/create-web-call', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agentId,
              apiKey,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create web call');
          }

          const { accessToken } = await response.json();
          await startCall(accessToken);
        } catch (error) {
          console.error('Failed to start call:', error);
          setState(prev => ({
            ...prev,
            voiceState: 'error',
            errorMessage: 'Failed to start conversation. Please try again.',
            showErrorModal: true,
          }));
        }
        break;

      case 'listening':
      case 'speaking':
        // End call
        try {
          stopCall();
        } catch (error) {
          console.error('Failed to stop call:', error);
        }
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          voiceState: 'idle',
          showErrorModal: false,
          errorMessage: '',
        }));
        break;

      default:
        // Do nothing for processing state
        break;
    }
  }, [isInitialized, state.voiceState, agentId, apiKey, startCall, stopCall]);

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Status Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-200 whitespace-nowrap">
          {statusMessages[state.voiceState]}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* Main Voice Button */}
      <VoiceButton
        state={state.voiceState}
        size={buttonSize}
        primaryColor={primaryColor}
        onClick={handleVoiceButtonClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={!isInitialized}
      />

      {/* Error Modal */}
      {state.showErrorModal && (
        <Card className="absolute bottom-20 right-0 w-80 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2">Connection Error</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {state.errorMessage}
                </p>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      showErrorModal: false, 
                      voiceState: 'idle',
                      errorMessage: ''
                    }))}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}