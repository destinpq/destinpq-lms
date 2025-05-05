'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Spin } from 'antd';
import { ZoomMtg } from '@zoom/meetingsdk';

// Configure Zoom SDK
ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.2/lib', '/av');
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

// Initialize Zoom language and features
ZoomMtg.i18n.load('en-US');
ZoomMtg.i18n.reload('en-US');

// Type definitions for the Zoom Meeting props
interface ZoomMeetingProps {
  // Required props
  meetingNumber: string;
  userName: string;
  userEmail?: string;
  password: string; // Zoom meeting password
  
  // Optional props
  containerStyle?: React.CSSProperties;
  onClose?: () => void;
  role?: number; // 0 for attendee, 1 for host
  leaveUrl?: string;
  sdkKey?: string; // Your Zoom SDK Key
  signature?: string; // Generated meeting signature
  zoomOptions?: Record<string, unknown>;
}

const ZoomMeeting: React.FC<ZoomMeetingProps> = ({
  meetingNumber,
  userName,
  userEmail = 'user@example.com',
  password,
  containerStyle = { width: '100%', height: '600px' },
  onClose,
  role = 0,
  leaveUrl = window.location.origin,
  sdkKey,
  signature,
  zoomOptions
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const zoomContainer = useRef<HTMLDivElement>(null);
  
  // Get the SDK key from environment variables if not provided
  const effectiveSdkKey = sdkKey || process.env.NEXT_PUBLIC_ZOOM_SDK_KEY || '';
  
  // Default Zoom options
  const defaultZoomOptions = {
    no_dial_in_via_phone: true,
    no_dial_out_to_phone: true,
    no_invite: true,
    no_share: false,
    no_audio: false,
    no_video: false,
    no_meeting_end_message: true,
    ...zoomOptions
  };

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined' && effectiveSdkKey && meetingNumber && password) {
      if (!signature) {
        console.error("No signature provided. Cannot join Zoom meeting.");
        setHasError(true);
        setErrorMessage("Missing meeting signature. Contact the administrator.");
        setLoading(false);
        return;
      }

      // Join the Zoom meeting
      ZoomMtg.join({
        sdkKey: effectiveSdkKey,
        signature: signature,
        meetingNumber: meetingNumber,
        password: password,
        userName: userName,
        userEmail: userEmail,
        tk: '',
        leaveUrl: leaveUrl,
        webEndpoint: 'https://zoom.us',
        success: (success: any) => {
          console.log('Zoom meeting joined successfully:', success);
          setLoading(false);
        },
        error: (error: any) => {
          console.error('Failed to join Zoom meeting:', error);
          setHasError(true);
          setErrorMessage(error.reason || "Failed to join Zoom meeting");
          setLoading(false);
        }
      });

      // Handle meeting closed event
      document.addEventListener('zooommeetingclosed', () => {
        if (onClose) {
          onClose();
        }
      });
    }

    // Cleanup
    return () => {
      ZoomMtg.leaveMeeting({});
      document.removeEventListener('zooommeetingclosed', () => {});
    };
  }, [meetingNumber, userName, password, effectiveSdkKey, signature, leaveUrl, userEmail, onClose]);

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
        <h2 style={{ color: '#ff4d4f' }}>Meeting Error</h2>
        <p>{errorMessage || "Failed to load Zoom meeting due to connection issues"}</p>
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
    <div 
      ref={zoomContainer}
      style={{ 
        position: 'relative',
        ...containerStyle
      }}
      id="zmmtg-root"
    >
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
          <Spin size="large" tip="Loading Zoom meeting..." />
        </div>
      )}
    </div>
  );
};

export default ZoomMeeting; 