'use client';

import React from 'react';
import { Button, Card, Divider, Typography } from 'antd';
import Link from 'next/link';
import JitsiMeeting from '@/app/components/JitsiMeeting/JitsiMeeting';

const { Title, Text } = Typography;

const TestMeetingPage = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>Video Meeting Test Page</Title>
        
        <Divider />
        
        <div style={{ marginBottom: '20px' }}>
          <Text strong>Using:</Text> Jitsi Meet React SDK ✅
        </div>
        
        <div style={{ 
          width: '100%', 
          height: '500px', 
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <JitsiMeeting 
            roomName="test-meeting-room"
            displayName="Workshop Participant"
            containerStyle={{ 
              width: '100%', 
              height: '500px'
            }}
          />
        </div>
        
        <Button type="primary">
          <Link href="/workshop/session/123">Back to Session</Link>
        </Button>
      </Card>
    </div>
  );
};

export default TestMeetingPage; 