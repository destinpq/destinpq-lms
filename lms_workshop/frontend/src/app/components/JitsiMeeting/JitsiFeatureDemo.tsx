'use client';

import React, { useState } from 'react';
import { Button, Card, Divider, Switch, Input, Select, Form, Space, Typography, Tabs, Collapse } from 'antd';
import JitsiMeeting from './JitsiMeeting';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Define more specific types for meeting props and configs
interface MeetingConfig {
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  disableModeratorIndicator?: boolean;
  disableSelfView?: boolean;
  hideConferenceSubject?: boolean;
  prejoinConfig?: {
    enabled: boolean;
  };
  disableDeepLinking?: boolean;
  disableInviteFunctions?: boolean;
  enableClosePage?: boolean;
  enableWelcomePage?: boolean;
}

interface InterfaceConfig {
  DISABLE_JOIN_LEAVE_NOTIFICATIONS?: boolean;
  MOBILE_APP_PROMO?: boolean;
  HIDE_INVITE_MORE_HEADER?: boolean;
  SHOW_CHROME_EXTENSION_BANNER?: boolean;
  DISABLE_VIDEO_BACKGROUND?: boolean;
}

interface UserInfo {
  displayName?: string;
  email?: string;
}

interface MeetingProps {
  roomName: string;
  subject?: string;
  domain: string;
  configOverwrite: MeetingConfig;
  interfaceConfigOverwrite: InterfaceConfig;
  userInfo: UserInfo;
  containerStyle: React.CSSProperties;
}

const JitsiFeatureDemo: React.FC = () => {
  const [form] = Form.useForm();
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingProps, setMeetingProps] = useState<Partial<MeetingProps>>({});

  const startMeeting = () => {
    const formValues = form.getFieldsValue();
    
    // Format config values
    const configOverwrite: MeetingConfig = {
      startWithAudioMuted: formValues.startWithAudioMuted,
      startWithVideoMuted: formValues.startWithVideoMuted,
      disableModeratorIndicator: formValues.disableModeratorIndicator,
      disableSelfView: formValues.disableSelfView,
      hideConferenceSubject: formValues.hideConferenceSubject,
      prejoinConfig: {
        enabled: !formValues.disablePrejoin
      },
      disableDeepLinking: true,
      disableInviteFunctions: formValues.disableInvite,
      enableClosePage: false,
      enableWelcomePage: false
    };
    
    // Format interface config values
    const interfaceConfigOverwrite: InterfaceConfig = {
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: formValues.disableNotifications,
      MOBILE_APP_PROMO: false,
      HIDE_INVITE_MORE_HEADER: formValues.hideInviteHeader,
      SHOW_CHROME_EXTENSION_BANNER: false,
      DISABLE_VIDEO_BACKGROUND: true
    };
    
    // User info
    const userInfo: UserInfo = {
      displayName: formValues.displayName,
      email: formValues.email
    };
    
    // Prepare meeting props
    const props: MeetingProps = {
      roomName: formValues.roomName || 'demo-meeting',
      subject: formValues.subject,
      domain: formValues.domain || 'meet.jit.si',
      configOverwrite,
      interfaceConfigOverwrite,
      userInfo,
      containerStyle: {
        width: '100%',
        height: '600px',
      }
    };
    
    setMeetingProps(props);
    setMeetingStarted(true);
  };

  const endMeeting = () => {
    setMeetingStarted(false);
    setMeetingProps({});
  };

  return (
    <div>
      <Card>
        <Title level={2}>Jitsi Meet SDK Feature Demo</Title>
        <Paragraph>
          This demo showcases the various features available in the Jitsi Meet React SDK.
          Configure your meeting options below and start a meeting to see them in action.
        </Paragraph>
        
        <Divider />
        
        {!meetingStarted ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              roomName: 'demo-meeting',
              displayName: 'Demo User',
              domain: 'meet.jit.si',
              subject: 'Demo Meeting',
              startWithAudioMuted: true,
              startWithVideoMuted: false,
              disableModeratorIndicator: false,
              disableSelfView: false,
              disableNotifications: true,
              disablePrejoin: true,
              hideConferenceSubject: false,
              hideInviteHeader: true,
              disableInvite: true
            }}
          >
            <Tabs defaultActiveKey="basic">
              <TabPane tab="Basic Settings" key="basic">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item name="roomName" label="Room Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter room name" />
                  </Form.Item>
                  
                  <Form.Item name="displayName" label="Display Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter your display name" />
                  </Form.Item>
                  
                  <Form.Item name="domain" label="Domain" rules={[{ required: true }]}>
                    <Select>
                      <Option value="meet.jit.si">meet.jit.si (Default)</Option>
                      <Option value="8x8.vc">8x8.vc</Option>
                      <Option value="stage.8x8.vc">stage.8x8.vc (Staging)</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item name="subject" label="Meeting Subject">
                    <Input placeholder="Enter meeting subject" />
                  </Form.Item>
                  
                  <Form.Item name="email" label="Email (Optional)">
                    <Input placeholder="Enter your email" />
                  </Form.Item>
                </Space>
              </TabPane>
              
              <TabPane tab="Advanced Settings" key="advanced">
                <Collapse defaultActiveKey={['config', 'interface']}>
                  <Panel header="Configuration Settings" key="config">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item 
                        name="startWithAudioMuted" 
                        label="Start with audio muted" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item 
                        name="startWithVideoMuted" 
                        label="Start with video muted" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item 
                        name="disableModeratorIndicator" 
                        label="Disable moderator indicator" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item 
                        name="disableSelfView" 
                        label="Disable self view" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item 
                        name="hideConferenceSubject" 
                        label="Hide conference subject" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item 
                        name="disablePrejoin" 
                        label="Disable prejoin screen" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item 
                        name="disableInvite" 
                        label="Disable invite functions" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Space>
                  </Panel>
                  
                  <Panel header="Interface Settings" key="interface">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item 
                        name="disableNotifications" 
                        label="Disable join/leave notifications" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item 
                        name="hideInviteHeader" 
                        label="Hide invite more header" 
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Space>
                  </Panel>
                </Collapse>
              </TabPane>
            </Tabs>
            
            <Divider />
            
            <Button type="primary" size="large" onClick={startMeeting}>
              Start Meeting
            </Button>
          </Form>
        ) : (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <Button type="primary" danger onClick={endMeeting}>
                End Meeting
              </Button>
            </div>
            
            <JitsiMeeting
              roomName={meetingProps.roomName}
              displayName={meetingProps.userInfo?.displayName}
              subject={meetingProps.subject}
              domain={meetingProps.domain}
              configOverwrite={meetingProps.configOverwrite}
              interfaceConfigOverwrite={meetingProps.interfaceConfigOverwrite}
              userInfo={meetingProps.userInfo}
              containerStyle={meetingProps.containerStyle}
              onClose={endMeeting}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default JitsiFeatureDemo; 