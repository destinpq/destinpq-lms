'use client';

import React, { useEffect, useRef } from 'react';
import JitsiMeeting from '@/app/components/JitsiMeeting/JitsiMeeting';

interface CustomJitsiProps {
  roomName: string;
  displayName: string;
  subject: string;
}

const CustomJitsiMeeting: React.FC<CustomJitsiProps> = ({ 
  roomName, 
  displayName,
  subject
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use effect to inject CSS into iframe after it loads
  useEffect(() => {
    // Give some time for the Jitsi iframe to load
    const timeoutId = setTimeout(() => {
      try {
        // Try to find the iframe that Jitsi creates
        const iframe = document.getElementById('jitsiConferenceFrame0') as HTMLIFrameElement;
        
        if (iframe && iframe.contentWindow) {
          // Create a style element
          const style = document.createElement('style');
          style.textContent = `
            #new-toolbox, .subject, .watermark, .chrome-extension-banner,
            .filmstrip, .vertical-filmstrip, .local-filmstrip, 
            .subject-info-container, .new-toolbox {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }
            
            .videocontainer { 
              background-color: black !important;
            }
            
            body {
              background-color: black !important;
            }
          `;
          
          // Append style to the iframe's document head
          try {
            if (iframe.contentDocument && iframe.contentDocument.head) {
              iframe.contentDocument.head.appendChild(style);
              console.log('Successfully injected styles into Jitsi iframe');
            }
          } catch (error) {
            console.error('Error accessing iframe document:', error);
          }
        }
      } catch (error) {
        console.error('Error setting up Jitsi iframe CSS override:', error);
      }
    }, 3000); // Wait 3 seconds for iframe to load
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '500px' }}>
      {/* Black overlay to hide the top toolbar completely */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: 'black',
        opacity: 0.7,
        zIndex: 999,
        pointerEvents: 'none'
      }} />
      
      <JitsiMeeting
        displayName={displayName}
        containerStyle={{ 
          width: '100%', 
          height: '500px',
          overflow: 'hidden',
          borderRadius: '8px'
        }}
        roomName={roomName}
        subject={subject}
        domain="meet.jit.si"
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinConfig: {
            enabled: false
          },
          disableDeepLinking: true,
          disableInviteFunctions: true,
          enableClosePage: false,
          enableWelcomePage: false,
          enableAuth: false,
          autoJoin: true,
          requireDisplayName: false,
          resolution: 360,
          disableThirdPartyRequests: true,
          disableLocalVideoFlip: true,
          disableProfile: true,
          hideConferenceSubject: true,
          hideConferenceTimer: true,
          hideParticipantsStats: true,
          toolbarButtons: []
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
          DISABLE_VIDEO_BACKGROUND: true,
          TOOLBAR_BUTTONS: [],
          TOOLBAR_ALWAYS_VISIBLE: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: '#000000',
          HIDE_DEEP_LINKING_LOGO: true,
          FILM_STRIP_MAX_HEIGHT: 0,
          VERTICAL_FILMSTRIP: false,
          INITIAL_TOOLBAR_TIMEOUT: 0,
          TOOLBAR_TIMEOUT: 0
        }}
      />
    </div>
  );
};

export default CustomJitsiMeeting; 