'use client';

import React, { useEffect, useState } from 'react';
import { JitsiMeeting as JitsiMeetSDK } from '@jitsi/react-sdk';
import { Spin } from 'antd';

// Declare known device types for Jitsi
interface JitsiDevices {
  audioInput?: string;
  audioOutput?: string;
  videoInput?: string;
}

// Declare invitee type for Jitsi
interface JitsiInvitee {
  name?: string;
  email?: string;
  phone?: string;
}

// Type definitions for the Jitsi React SDK props
interface JitsiMeetingProps {
  // Required props
  roomName?: string;
  displayName?: string;
  
  // Optional props
  containerStyle?: React.CSSProperties;
  onClose?: () => void;
  subject?: string;
  domain?: string;
  password?: string;
  
  // Additional features
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  };
  jwt?: string;
  lang?: string;
  devices?: JitsiDevices;
  invitees?: JitsiInvitee[];
}

// Define a minimal interface for the Jitsi API
interface JitsiMeetAPI {
  executeCommand(command: string, ...args: unknown[]): void;
  addListener(event: string, callback: (...args: unknown[]) => void): void;
  removeListener(event: string, callback: (...args: unknown[]) => void): void;
  dispose(): void;
}

const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
  roomName = 'workshop-meeting',
  displayName = 'Drakanksha (Admin)',
  containerStyle = { width: '100%', height: '600px' },
  onClose,
  subject,
  domain = 'meet.jit.si',
  password,
  configOverwrite,
  interfaceConfigOverwrite,
  userInfo,
  jwt,
  lang,
  devices,
  invitees
}) => {
  const [apiObject, setApiObject] = useState<JitsiMeetAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Default config overwrites for better user experience
  const defaultConfigOverwrite = {
    startWithAudioMuted: true,
    hiddenPremeetingButtons: ['microphone'],
    prejoinConfig: {
      enabled: false
    },
    disableDeepLinking: true,
    disableInviteFunctions: true,
    enableClosePage: false,
    enableWelcomePage: false,
    // Disable authentication
    disableThirdPartyRequests: true,
    disableLocalVideoFlip: true,
    // Disable login prompt
    tokenAuthUrl: null,
    tokenAuthUrlAutoRedirect: false,
    // Disable all authentication methods
    authenticationEnabled: false,
    // Disable calendar integrations
    googleApiApplicationClientID: '',
    microsoftApiApplicationClientID: '',
    // Disable extension prompts
    disableCalendarIntegration: true,
    // Disable various features
    disableProfile: true,
    disableIncomingMessageSound: true,
    // Disable all controls
    disableRemoteControl: true,
    disableNoisyMicDetection: true,
    ...configOverwrite
  };

  // Default interface config overwrites
  const defaultInterfaceConfigOverwrite = {
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    MOBILE_APP_PROMO: false,
    HIDE_INVITE_MORE_HEADER: true,
    DISABLE_VIDEO_BACKGROUND: true,
    // Disable calendar integration buttons
    TOOLBAR_BUTTONS: [
      'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
      'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
      'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
      'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
      'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
      'security'
    ],
    SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'sounds'],
    // Hide UI prompts
    SHOW_CHROME_EXTENSION_BANNER: false,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,
    SHOW_JITSI_WATERMARK: false,
    ...interfaceConfigOverwrite
  };

  // Default user info
  const defaultUserInfo = {
    displayName: displayName,
    ...userInfo
  };

  // Handle API events
  const handleApiReady = (api: JitsiMeetAPI) => {
    setApiObject(api);
    setLoading(false);
    
    // Set subject if provided
    if (subject) {
      api.executeCommand('subject', subject);
    }
    
    // Set password if provided
    if (password) {
      api.executeCommand('password', password);
    }
    
    // Add event listeners
    api.addListener('videoConferenceJoined', () => {
      console.log('User joined the conference');
      // Ensure UI updates when we join
      setHasError(false);
    });
    
    api.addListener('videoConferenceLeft', () => {
      if (onClose) {
        onClose();
      }
    });
    
    api.addListener('readyToClose', () => {
      if (onClose) {
        onClose();
      }
    });
    
    // Error handling
    api.addListener('connectionFailed', () => {
      setHasError(true);
      setErrorMessage("Connection to the conference failed");
    });
    
    api.addListener('error', () => {
      setHasError(true);
      setErrorMessage("An error occurred with the conference");
    });
  };

  // Handle errors
  const handleError = (error: Error) => {
    console.error("Jitsi Meeting Error:", error);
    setHasError(true);
    setErrorMessage(error.message || "Failed to load meeting");
    setLoading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (apiObject) {
        apiObject.dispose();
      }
    };
  }, [apiObject]);

  if (hasError) {
    return (
      <div style={{ 
        width: '100%', 
        height: containerStyle.height || '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ff4d4f' }}>Conference Error</h2>
        <p>{errorMessage || "Failed to load meeting API due to connection issues"}</p>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '8px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      position: 'relative',
      ...containerStyle
    }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          borderRadius: '8px'
        }}>
          <Spin size="large" tip="Loading meeting..." />
        </div>
      )}
      
      <JitsiMeetSDK
        domain={domain}
        roomName={roomName}
        configOverwrite={defaultConfigOverwrite as Record<string, unknown>}
        interfaceConfigOverwrite={defaultInterfaceConfigOverwrite as Record<string, unknown>}
        userInfo={defaultUserInfo as { displayName: string }}
        jwt={jwt}
        lang={lang}
        devices={devices as JitsiDevices}
        invitees={invitees as JitsiInvitee[]}
        getIFrameRef={(node: HTMLDivElement) => {
          if (node) {
            // Apply styles to the container div
            node.style.height = containerStyle.height ? containerStyle.height.toString() : '600px';
            node.style.width = '100%';
            node.style.border = '0';
            node.style.borderRadius = '8px';
            node.style.overflow = 'hidden';
          }
        }}
        onApiReady={handleApiReady}
        onApiError={handleError}
      />
    </div>
  );
};

export default JitsiMeeting; 