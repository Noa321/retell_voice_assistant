import { useEffect, useRef, useState, useCallback } from 'react';
import type { VoiceMessage } from '@shared/schema';

interface UseWebSocketProps {
  onMessage?: (message: VoiceMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket({
  onMessage,
  onOpen,
  onClose,
  onError
}: UseWebSocketProps = {}) {
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    setConnectionState('connecting');
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setConnectionState('connected');
      onOpen?.();
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as VoiceMessage;
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      setConnectionState('disconnected');
      onClose?.();
    };

    wsRef.current.onerror = (error) => {
      setConnectionState('disconnected');
      onError?.(error);
    };
  }, [onMessage, onOpen, onClose, onError]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  const sendMessage = useCallback((message: VoiceMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    connect,
    disconnect,
    sendMessage,
    isConnected: connectionState === 'connected',
  };
}
