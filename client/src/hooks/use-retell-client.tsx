import { useEffect, useRef, useState, useCallback } from 'react';

interface RetellClient {
  startCall: (config: { accessToken: string }) => Promise<void>;
  stopCall: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

interface UseRetellClientProps {
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onAgentStartTalking?: () => void;
  onAgentStopTalking?: () => void;
  onError?: (error: any) => void;
}

export function useRetellClient({
  onCallStarted,
  onCallEnded,
  onAgentStartTalking,
  onAgentStopTalking,
  onError
}: UseRetellClientProps = {}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const clientRef = useRef<RetellClient | null>(null);

  // Initialize Retell client
  useEffect(() => {
    const loadRetellClient = async () => {
      try {
        // Load Retell client dynamically
        const { RetellWebClient } = await import('retell-client-js-sdk');
        clientRef.current = new RetellWebClient();
        
        // Set up event listeners
        if (clientRef.current) {
          clientRef.current.on('call_started', () => {
            setIsCallActive(true);
            onCallStarted?.();
          });

          clientRef.current.on('call_ended', () => {
            setIsCallActive(false);
            setIsAgentSpeaking(false);
            onCallEnded?.();
          });

          clientRef.current.on('agent_start_talking', () => {
            setIsAgentSpeaking(true);
            onAgentStartTalking?.();
          });

          clientRef.current.on('agent_stop_talking', () => {
            setIsAgentSpeaking(false);
            onAgentStopTalking?.();
          });

          clientRef.current.on('error', (error: any) => {
            console.error('Retell client error:', error);
            onError?.(error);
          });
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load Retell client:', error);
        onError?.(error);
      }
    };

    loadRetellClient();
  }, [onCallStarted, onCallEnded, onAgentStartTalking, onAgentStopTalking, onError]);

  const startCall = useCallback(async (accessToken: string) => {
    if (!clientRef.current || !isInitialized) {
      throw new Error('Retell client not initialized');
    }

    try {
      await clientRef.current.startCall({
        accessToken,
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }, [isInitialized]);

  const stopCall = useCallback(() => {
    if (!clientRef.current) {
      return;
    }

    try {
      clientRef.current.stopCall();
    } catch (error) {
      console.error('Failed to stop call:', error);
      throw error;
    }
  }, []);

  return {
    isInitialized,
    isCallActive,
    isAgentSpeaking,
    startCall,
    stopCall,
  };
}