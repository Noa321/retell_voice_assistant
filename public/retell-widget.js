(function() {
  'use strict';

  // Global configuration
  let widgetConfig = {
    apiKey: '',
    agentId: '',
    position: 'bottom-right',
    theme: {
      primaryColor: '#2563EB',
      buttonSize: 'medium'
    }
  };

  // Widget state
  let currentState = 'idle';
  let widgetContainer = null;
  let websocket = null;
  let mediaRecorder = null;
  let audioStream = null;
  let sessionId = null;

  // Position mapping
  const positionClasses = {
    'bottom-right': { bottom: '24px', right: '24px' },
    'bottom-left': { bottom: '24px', left: '24px' },
    'top-right': { top: '24px', right: '24px' },
    'top-left': { top: '24px', left: '24px' }
  };

  // Size mapping
  const sizeMap = {
    small: '48px',
    medium: '56px',
    large: '64px'
  };

  // State configurations
  const stateConfig = {
    idle: {
      icon: '🎤',
      bgColor: widgetConfig.theme.primaryColor,
      text: 'Click to start conversation',
      showPulse: false
    },
    listening: {
      icon: '🎤',
      bgColor: '#10B981',
      text: 'Listening... Click to stop',
      showPulse: true
    },
    processing: {
      icon: '🧠',
      bgColor: '#F59E0B',
      text: 'Processing your request...',
      showPulse: false
    },
    speaking: {
      icon: '🔊',
      bgColor: '#8B5CF6',
      text: 'AI is speaking...',
      showPulse: false
    },
    error: {
      icon: '⚠️',
      bgColor: '#EF4444',
      text: 'Error occurred. Click to retry',
      showPulse: false
    }
  };

  // Create widget HTML
  function createWidgetHTML() {
    const size = sizeMap[widgetConfig.theme.buttonSize];
    const position = positionClasses[widgetConfig.position];
    
    return `
      <div id="retell-voice-widget" style="
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ${Object.entries(position).map(([key, value]) => `${key}: ${value}`).join('; ')};
      ">
        <!-- Status Tooltip -->
        <div id="retell-tooltip" style="
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background-color: #1F2937;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
          pointer-events: none;
        ">
          <span id="retell-status-text">Click to start conversation</span>
          <div style="
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #1F2937;
          "></div>
        </div>

        <!-- Main Voice Button -->
        <button id="retell-voice-btn" style="
          width: ${size};
          height: ${size};
          background-color: ${widgetConfig.theme.primaryColor};
          border: none;
          border-radius: 50%;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.2s ease-in-out;
          outline: none;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <span id="retell-icon">🎤</span>
        </button>

        <!-- Pulse Ring -->
        <div id="retell-pulse-ring" style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: #10B981;
          opacity: 0;
          transform: scale(0.75);
          animation: retell-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>

        <!-- Permission Modal -->
        <div id="retell-permission-modal" style="
          position: absolute;
          bottom: calc(100% + 12px);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #E5E7EB;
          padding: 24px;
          width: 320px;
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.2s ease-in-out;
          pointer-events: none;
        ">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="
              width: 40px;
              height: 40px;
              background-color: #DBEAFE;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            ">🎤</div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 8px 0; font-weight: 500; color: #111827;">Microphone Access Required</h3>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6B7280;">Allow microphone access to start voice conversation with your AI assistant.</p>
              <div style="display: flex; gap: 12px;">
                <button id="retell-allow-btn" style="
                  padding: 8px 16px;
                  background-color: #2563EB;
                  color: white;
                  border: none;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background-color 0.2s;
                " onmouseover="this.style.backgroundColor='#1D4ED8'" onmouseout="this.style.backgroundColor='#2563EB'">
                  Allow Access
                </button>
                <button id="retell-deny-btn" style="
                  padding: 8px 16px;
                  background-color: #E5E7EB;
                  color: #374151;
                  border: none;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background-color 0.2s;
                " onmouseover="this.style.backgroundColor='#D1D5DB'" onmouseout="this.style.backgroundColor='#E5E7EB'">
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Modal -->
        <div id="retell-error-modal" style="
          position: absolute;
          bottom: calc(100% + 12px);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #E5E7EB;
          padding: 24px;
          width: 320px;
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.2s ease-in-out;
          pointer-events: none;
        ">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="
              width: 40px;
              height: 40px;
              background-color: #FEE2E2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            ">⚠️</div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 8px 0; font-weight: 500; color: #111827;">Connection Error</h3>
              <p id="retell-error-message" style="margin: 0 0 16px 0; font-size: 14px; color: #6B7280;">
                Unable to connect to voice service. Please check your internet connection and try again.
              </p>
              <button id="retell-retry-btn" style="
                padding: 8px 16px;
                background-color: #EF4444;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              " onmouseover="this.style.backgroundColor='#DC2626'" onmouseout="this.style.backgroundColor='#EF4444'">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes retell-ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        #retell-pulse-ring {
          display: none;
        }
        
        #retell-pulse-ring.show {
          display: block;
        }
      </style>
    `;
  }

  // Update widget state
  function updateWidgetState(newState) {
    if (!stateConfig[newState]) return;
    
    currentState = newState;
    const config = stateConfig[newState];
    
    const button = document.getElementById('retell-voice-btn');
    const icon = document.getElementById('retell-icon');
    const statusText = document.getElementById('retell-status-text');
    const pulseRing = document.getElementById('retell-pulse-ring');
    
    if (!button || !icon || !statusText || !pulseRing) return;
    
    // Update button color
    button.style.backgroundColor = config.bgColor;
    
    // Update icon
    icon.textContent = config.icon;
    
    // Update status text
    statusText.textContent = config.text;
    
    // Show/hide pulse effect
    if (config.showPulse) {
      pulseRing.classList.add('show');
      pulseRing.style.opacity = '0.25';
    } else {
      pulseRing.classList.remove('show');
      pulseRing.style.opacity = '0';
    }
  }

  // Show/hide modal
  function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
      modal.style.pointerEvents = 'auto';
    }
  }

  function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      modal.style.pointerEvents = 'none';
    }
  }

  // Show/hide tooltip
  function showTooltip() {
    const tooltip = document.getElementById('retell-tooltip');
    if (tooltip) {
      tooltip.style.opacity = '1';
    }
  }

  function hideTooltip() {
    const tooltip = document.getElementById('retell-tooltip');
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  }

  // WebSocket connection
  function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = function() {
      console.log('RetellWidget: Connected to voice service');
    };
    
    websocket.onmessage = function(event) {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('RetellWidget: Failed to parse message', error);
      }
    };
    
    websocket.onclose = function() {
      console.log('RetellWidget: Disconnected from voice service');
      setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
    };
    
    websocket.onerror = function(error) {
      console.error('RetellWidget: WebSocket error', error);
      showError('Connection failed. Please check your internet connection.');
    };
  }

  // Handle WebSocket messages
  function handleWebSocketMessage(message) {
    switch (message.type) {
      case 'state_change':
        if (message.data?.status === 'connected') {
          updateWidgetState('listening');
          sessionId = message.data.sessionId;
          startRecording();
        } else if (message.data?.status === 'ended') {
          updateWidgetState('idle');
          stopRecording();
          sessionId = null;
        }
        break;
        
      case 'error':
        showError(message.data?.message || 'An error occurred');
        break;
    }
  }

  // Request microphone permission
  async function requestMicrophonePermission() {
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      hideModal('retell-permission-modal');
      startVoiceSession();
    } catch (error) {
      console.error('RetellWidget: Microphone permission denied', error);
      showError('Microphone access denied. Please allow microphone access to use voice features.');
    }
  }

  // Start voice session
  function startVoiceSession() {
    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      showError('Not connected to voice service. Please refresh and try again.');
      return;
    }
    
    updateWidgetState('processing');
    
    websocket.send(JSON.stringify({
      type: 'start_session',
      data: {
        agentId: widgetConfig.agentId,
        metadata: { apiKey: widgetConfig.apiKey }
      },
      timestamp: Date.now()
    }));
  }

  // Start recording
  function startRecording() {
    if (!audioStream) return;
    
    try {
      mediaRecorder = new MediaRecorder(audioStream);
      
      mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0 && sessionId) {
          // Convert blob to base64 and send via WebSocket
          const reader = new FileReader();
          reader.onload = function() {
            if (websocket && websocket.readyState === WebSocket.OPEN) {
              websocket.send(JSON.stringify({
                type: 'audio_chunk',
                sessionId: sessionId,
                data: { audioData: reader.result },
                timestamp: Date.now()
              }));
            }
          };
          reader.readAsDataURL(event.data);
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('RetellWidget: Recording error', error);
      showError('Failed to start recording. Please try again.');
    }
  }

  // Stop recording
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  // End voice session
  function endVoiceSession() {
    if (websocket && websocket.readyState === WebSocket.OPEN && sessionId) {
      websocket.send(JSON.stringify({
        type: 'end_session',
        sessionId: sessionId,
        timestamp: Date.now()
      }));
    }
    
    stopRecording();
    updateWidgetState('idle');
    sessionId = null;
  }

  // Show error
  function showError(message) {
    document.getElementById('retell-error-message').textContent = message;
    updateWidgetState('error');
    showModal('retell-error-modal');
  }

  // Main button click handler
  function handleVoiceButtonClick() {
    hideTooltip();
    
    switch (currentState) {
      case 'idle':
        if (!audioStream) {
          showModal('retell-permission-modal');
        } else {
          startVoiceSession();
        }
        break;
        
      case 'listening':
        endVoiceSession();
        break;
        
      case 'error':
        hideModal('retell-error-modal');
        updateWidgetState('idle');
        break;
    }
  }

  // Initialize widget
  function initWidget() {
    // Create and insert widget HTML
    widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = createWidgetHTML();
    document.body.appendChild(widgetContainer);
    
    // Setup event listeners
    const voiceBtn = document.getElementById('retell-voice-btn');
    const allowBtn = document.getElementById('retell-allow-btn');
    const denyBtn = document.getElementById('retell-deny-btn');
    const retryBtn = document.getElementById('retell-retry-btn');
    
    if (voiceBtn) {
      voiceBtn.addEventListener('click', handleVoiceButtonClick);
      voiceBtn.addEventListener('mouseenter', showTooltip);
      voiceBtn.addEventListener('mouseleave', hideTooltip);
    }
    
    if (allowBtn) {
      allowBtn.addEventListener('click', requestMicrophonePermission);
    }
    
    if (denyBtn) {
      denyBtn.addEventListener('click', function() {
        hideModal('retell-permission-modal');
      });
    }
    
    if (retryBtn) {
      retryBtn.addEventListener('click', function() {
        hideModal('retell-error-modal');
        updateWidgetState('idle');
      });
    }
    
    // Connect to WebSocket
    connectWebSocket();
  }

  // Public API
  window.RetellWidget = {
    init: function(config) {
      if (config.apiKey && config.agentId) {
        widgetConfig = {
          ...widgetConfig,
          ...config,
          theme: {
            ...widgetConfig.theme,
            ...config.theme
          }
        };
        
        // Update state config with new primary color
        stateConfig.idle.bgColor = widgetConfig.theme.primaryColor;
        
        // Initialize widget when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initWidget);
        } else {
          initWidget();
        }
      } else {
        console.error('RetellWidget: apiKey and agentId are required');
      }
    },
    
    destroy: function() {
      if (widgetContainer) {
        widgetContainer.remove();
        widgetContainer = null;
      }
      
      if (websocket) {
        websocket.close();
        websocket = null;
      }
      
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
      }
    }
  };
})();