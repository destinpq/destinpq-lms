'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import * as Redux from 'redux';
import * as ReduxThunk from 'redux-thunk';
import _ from 'lodash';
import { Button, Card, Alert, Spin } from 'antd';
import { zoomService, ZoomJoinInfo, ZoomMeetingResponse } from '@/api/zoomService';
import { useAuth } from '@/app/context/AuthContext';

// Import the Zoom Meeting SDK
// Note: We need to use dynamic imports due to the way Zoom's SDK loads
// We'll lazy-load the SDK when needed using a script tag approach
// This is necessary to avoid server-side rendering issues

interface ZoomMeetingProps {
  meetingId?: string;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const ZoomMeeting: React.FC<ZoomMeetingProps> = ({ 
  meetingId, 
  onClose,
  className,
  style
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingInfo, setMeetingInfo] = useState<ZoomMeetingResponse | null>(null);
  const [joinInfo, setJoinInfo] = useState<ZoomJoinInfo | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [sdkFailed, setSdkFailed] = useState(false);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  
  // Create a container for Zoom to render into
  useEffect(() => {
    // Make sure we create a new container on mount
    if (!document.getElementById('zmmtg-root')) {
      const zoomRoot = document.createElement('div');
      zoomRoot.id = 'zmmtg-root';
      document.body.appendChild(zoomRoot);
    }
    
    return () => {
      // Cleanup will happen in the SDK unload handler
    };
  }, []);

  // Load the Zoom Meeting SDK
  useEffect(() => {
    if (!meetingId) return;

    const loadZoomSDK = () => {
      if (document.getElementById('zoom-sdk')) {
        setIsSDKLoaded(true);
        return;
      }

      // Global polyfills
      if (typeof window !== 'undefined') {
        // Add required dependencies to window
        window.React = React;
        window.ReactDOM = ReactDOM;
        window.Redux = Redux;
        window.ReduxThunk = ReduxThunk;
        window._ = _;

        console.log('Added global dependencies for Zoom:', { 
          React: !!window.React, 
          ReactDOM: !!window.ReactDOM,
          Redux: !!window.Redux,
          ReduxThunk: !!window.ReduxThunk,
          Lodash: !!window._
        });
      }

      // Load Zoom SDK script
      const script = document.createElement('script');
      script.id = 'zoom-sdk';
      script.src = 'https://source.zoom.us/2.13.0/lib/vendor/react.min.js';
      script.async = true;
      script.onload = () => {
        // Load Zoom SDK core script
        const zoomScript = document.createElement('script');
        zoomScript.src = 'https://source.zoom.us/2.13.0/zoom-meeting-embedded-2.13.0.min.js';
        zoomScript.async = true;
        
        zoomScript.onload = () => {
          console.log('Zoom Meeting SDK loaded successfully');
          setIsSDKLoaded(true);
        };
        
        zoomScript.onerror = (e) => {
          console.error('Failed to load Zoom Meeting SDK:', e);
          setError('Failed to load Zoom Meeting SDK');
          setSdkFailed(true);
        };
        
        document.body.appendChild(zoomScript);
      };

      script.onerror = (e) => {
        console.error('Failed to load React for Zoom SDK:', e);
        setError('Failed to load React for Zoom SDK');
        setSdkFailed(true);
      };

      document.body.appendChild(script);
    };

    loadZoomSDK();

    // Clean up
    return () => {
      try {
        // Clean up Zoom if it's loaded
        if (window.ZoomMtg) {
          // Try to clean up any meeting
          const zoomRoot = document.getElementById('zmmtg-root');
          if (zoomRoot) {
            zoomRoot.innerHTML = '';
          }
        }
      } catch (e) {
        console.error('Error cleaning up Zoom:', e);
      }
    };
  }, [meetingId]);

  // Fetch meeting details
  useEffect(() => {
    if (!meetingId || !isSDKLoaded || sdkFailed) return;

    const fetchMeetingDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const meetingDetails = await zoomService.getMeeting(meetingId);
        console.log('Meeting details fetched:', meetingDetails);
        setMeetingInfo(meetingDetails);

        // For demo, using workshopId from props as meetingNumber
        const meetingNumber = meetingId || meetingDetails.id;
        
        console.log('Attempting to generate signature with:', { meetingNumber, role: 'user', userName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Guest' });
        
        // Use the correct function name: generateSignature
        const joinInfoData = await zoomService.generateSignature(
          meetingNumber,
          'user',
          user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Guest'
        );
        
        console.log('Signature generated successfully:', joinInfoData);
        setJoinInfo(joinInfoData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load meeting details';
        console.error('Error fetching meeting details:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [meetingId, isSDKLoaded, sdkFailed, user]);

  // Join meeting when we have all the required data
  useEffect(() => {
    if (!isSDKLoaded || !joinInfo || !meetingInfo || sdkFailed) return;

    // Initialize Zoom Meeting
    const joinMeeting = async () => {
      try {
        if (typeof window !== 'undefined' && window.ZoomMtg) {
          // Get Zoom root element
          const zoomAppRoot = document.getElementById('zmmtg-root');
          if (!zoomAppRoot) {
            throw new Error('Zoom root element not found');
          }
          
          const client = window.ZoomMtg.createClient();
          
          // Initialize the client
          client.init({
            debug: true,
            zoomAppRoot,
            language: 'en-US',
            customize: {
              video: {
                isResizable: true,
                viewSizes: {
                  default: {
                    width: Math.min(document.documentElement.clientWidth, 1000),
                    height: 600
                  }
                }
              }
            }
          });

          // Make sure we have a numeric meeting number (Zoom requirement)
          let meetingNumber = joinInfo.meetingNumber;
          console.log('Processing meeting number:', meetingNumber, 'Type:', typeof meetingNumber);
          console.log('Is numeric check result:', !/^\d+$/.test(meetingNumber));
          
          // Check if the endpoint is returning a real meeting ID
          if (meetingInfo && meetingInfo.id && /^\d+$/.test(meetingInfo.id)) {
            console.log('Using numeric meeting ID from meeting info:', meetingInfo.id);
            meetingNumber = meetingInfo.id;
          }
          // If we have a specific URL, extract the ID from it
          else if (meetingInfo && meetingInfo.join_url && meetingInfo.join_url.includes('/j/')) {
            const urlMatch = meetingInfo.join_url.match(/\/j\/(\d+)/);
            if (urlMatch && urlMatch[1]) {
              meetingNumber = urlMatch[1];
              console.log('Extracted meeting ID from URL:', meetingNumber);
            }
          }
          // Otherwise use our hash algorithm for non-numeric IDs
          else if (meetingNumber === 'next' || !/^\d+$/.test(meetingNumber)) {
            console.log('Converting non-numeric meeting ID to numeric format');
            // Use a consistent hash algorithm to convert string to number
            const hashNum = Array.from(meetingNumber).reduce(
              (acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000000, 0
            ) + 1000000000; // Ensure it's 10 digits by adding a base value
            
            meetingNumber = hashNum.toString();
            console.log(`Converted meeting ID "${joinInfo.meetingNumber}" to numeric format: ${meetingNumber}`);
          } else {
            console.log('Meeting ID is already numeric:', meetingNumber);
          }

          // Extract password from URL if available
          let password = meetingInfo.password || '';
          if (meetingInfo.join_url && meetingInfo.join_url.includes('pwd=')) {
            const pwdMatch = meetingInfo.join_url.match(/pwd=([^&]+)/);
            if (pwdMatch && pwdMatch[1]) {
              password = pwdMatch[1];
              console.log('Using password from URL:', password);
            }
          }

          console.log('Joining meeting with parameters:', {
            meetingNumber,
            userName: joinInfo.userName,
            signature: joinInfo.signature.substring(0, 10) + '...',
            sdkKey: '0KluAEmWRDqTod9bHgvMg',
            password
          });

          // Join the meeting
          client.join({
            sdkKey: '0KluAEmWRDqTod9bHgvMg',
            signature: joinInfo.signature,
            meetingNumber: meetingNumber,
            password: password,
            userName: joinInfo.userName,
            success: () => {
              console.log('Joined Zoom meeting successfully');
            },
            error: (err: Record<string, unknown>) => {
              console.error('Failed to join meeting:', JSON.stringify(err));
              const errorMsg = typeof err.message === 'string' ? err.message : 'Unknown error';
              setError(`Failed to join meeting: ${errorMsg}`);
              // If meeting join fails, show fallback UI
              setSdkFailed(true);
            }
          });
        } else {
          setError('Zoom SDK not loaded properly');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to join Zoom meeting';
        setError(errorMessage);
        console.error('Error joining Zoom meeting:', err);
        // Show fallback UI on error
        setSdkFailed(true);
      }
    };

    joinMeeting();
  }, [isSDKLoaded, joinInfo, meetingInfo, sdkFailed]);

  // Fallback UI for when the embedded client fails
  const renderFallbackUI = () => {
    if (!meetingInfo) return null;
    
    return (
      <Card title="Join Zoom Meeting" className={className} style={{ ...style }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2>{meetingInfo.topic}</h2>
          <p>Meeting ID: {meetingInfo.id}</p>
          <p>Password: {meetingInfo.password}</p>
          
          <div style={{ marginTop: '30px' }}>
            <Button 
              type="primary" 
              size="large"
              onClick={() => window.open(meetingInfo.join_url, '_blank')}
            >
              Join in Zoom App
            </Button>
          </div>
          
          <p style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
            {sdkFailed 
              ? 'Embedded client failed to load. Click the button to join through the Zoom app.' 
              : 'If the meeting doesn\'t appear below, use this button to join through the Zoom app.'}
          </p>
        </div>
      </Card>
    );
  };

  // Handle retry
  const handleRetry = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <Card className={className} style={{ ...style, minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className} style={{ ...style, minHeight: 200 }}>
        <Alert 
          type="error" 
          message="Failed to join Zoom meeting" 
          description={error}
          action={
            <Button size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        />
        {meetingInfo && renderFallbackUI()}
      </Card>
    );
  }

  // Always show the fallback UI as a backup
  return (
    <div className={className} style={{ ...style }}>
      {/* Main Zoom container */}
      <div 
        ref={zoomContainerRef}
        id="zoom-meeting-container"
        style={{ width: '100%', height: '100%', minHeight: 600 }}
      />
      
      {/* Always show fallback UI for better user experience */}
      {meetingInfo && (
        <div style={{ marginTop: '20px' }}>
          <Card title="Join Zoom Meeting" style={{ marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Alert
                message={sdkFailed ? "Embedded meeting failed to load" : "Meeting Options"}
                description={
                  sdkFailed
                    ? "Please use the button below to join the meeting directly in Zoom."
                    : "You can join the meeting through the embedded view above or directly in the Zoom app."
                }
                type={sdkFailed ? "warning" : "info"}
                showIcon
                style={{ marginBottom: '20px' }}
              />
              
              <h2>{meetingInfo.topic}</h2>
              
              <div style={{ margin: '20px 0', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                <p><strong>Meeting ID:</strong> {meetingInfo.id}</p>
                {meetingInfo.password && <p><strong>Password:</strong> {meetingInfo.password}</p>}
                <p><strong>Direct Link:</strong> <a href={meetingInfo.join_url} target="_blank" rel="noopener noreferrer">{meetingInfo.join_url}</a></p>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => window.open(meetingInfo.join_url, '_blank')}
                >
                  Join in Zoom App
                </Button>
              </div>
              
              {sdkFailed && (
                <div style={{ marginTop: '20px', color: '#999' }}>
                  <p>
                    The embedded meeting client could not be initialized. 
                    This could be due to browser restrictions or network issues.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ZoomMeeting; 