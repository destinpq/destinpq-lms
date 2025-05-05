'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Layout, Menu, Typography, Form, Input, Button, Switch, Divider, Select, Card, Tabs } from 'antd';
import {
  VideoCameraOutlined,
  FormOutlined,
  TrophyOutlined,
  MessageOutlined,
  UserOutlined,
  AreaChartOutlined,
  SettingOutlined,
  SaveOutlined,
  BellOutlined,
  MailOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Content, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function SettingsPage() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <Content style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>Settings</Title>
        <Button type="primary">Save Changes</Button>
      </div>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="General Settings" key="1">
          <Card>
            <Form layout="vertical">
              <Form.Item label="Platform Name" name="platformName" initialValue="LMS Workshop">
                <Input placeholder="Platform Name" />
              </Form.Item>
              
              <Form.Item label="Support Email" name="supportEmail" initialValue="support@example.com">
                <Input placeholder="Support Email" />
              </Form.Item>
              
              <Form.Item label="Default Language" name="language" initialValue="en">
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Default Timezone" name="timezone" initialValue="UTC-5">
                <Select>
                  <Option value="UTC-8">Pacific Time (UTC-8)</Option>
                  <Option value="UTC-7">Mountain Time (UTC-7)</Option>
                  <Option value="UTC-6">Central Time (UTC-6)</Option>
                  <Option value="UTC-5">Eastern Time (UTC-5)</Option>
                  <Option value="UTC">UTC</Option>
                </Select>
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />}>Save Settings</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Workshop Settings" key="2">
          <Card>
            <Form layout="vertical">
              <Form.Item label="Default Workshop Duration (minutes)" name="workshopDuration" initialValue={60}>
                <Select>
                  <Option value={30}>30 minutes</Option>
                  <Option value={60}>60 minutes</Option>
                  <Option value={90}>90 minutes</Option>
                  <Option value={120}>120 minutes</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label="Allow Workshop Recording" 
                name="allowRecording" 
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                label="Allow Participants to Share Screen" 
                name="allowScreenShare" 
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                label="Auto-record All Workshops" 
                name="autoRecord" 
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />}>Save Workshop Settings</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Notification Settings" key="3">
          <Card>
            <Form layout="vertical">
              <Form.Item 
                label={<><BellOutlined /> Email Notifications</>}
                name="emailNotifications" 
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                label={<><MailOutlined /> Workshop Reminders</>}
                name="workshopReminders" 
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
              
              <Form.Item label="Reminder Time" name="reminderTime" initialValue="1hour">
                <Select>
                  <Option value="30min">30 minutes before</Option>
                  <Option value="1hour">1 hour before</Option>
                  <Option value="1day">1 day before</Option>
                </Select>
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />}>Save Notification Settings</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </Content>
  );
} 