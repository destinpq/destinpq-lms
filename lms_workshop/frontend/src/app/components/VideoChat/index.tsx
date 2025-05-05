'use client';

import React, { useState } from 'react';
import { Button, Card, Avatar, Tooltip, Badge } from 'antd';
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import styles from './VideoChat.module.css';

interface VideoChatProps {
  userName?: string;
  adminName?: string;
  roomName?: string;
}

const VideoChat: React.FC<VideoChatProps> = ({
  userName = 'Student',
  adminName = 'Drakanksha (Admin)',
  roomName = 'Workshop Session'
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Toggle functions
  const toggleAudio = () => setAudioEnabled(!audioEnabled);
  const toggleVideo = () => setVideoEnabled(!videoEnabled);
  const toggleChat = () => setChatOpen(!chatOpen);

  return (
    <div className={styles.container}>
      <Card
        title={
          <div className={styles.header}>
            <div className={styles.roomInfo}>
              <span className={styles.roomName}>{roomName}</span>
              <Badge status="success" text="Live" />
            </div>
            <div className={styles.time}>{new Date().toLocaleTimeString()}</div>
          </div>
        }
        bodyStyle={{ padding: 0 }}
        className={styles.card}
      >
        <div className={styles.videoContainer}>
          <div className={styles.mainVideo}>
            <div className={styles.participantVideos}>
              {/* Admin video */}
              <div className={styles.videoTile}>
                <div className={styles.videoPlaceholder} style={{ backgroundColor: '#4d7c8a' }}>
                  {videoEnabled ? (
                    <div className={styles.fakeVideo}>
                      <img 
                        src="https://xsgames.co/randomusers/assets/avatars/female/67.jpg" 
                        alt="Admin"
                        className={styles.fakeVideoContent}
                      />
                    </div>
                  ) : (
                    <Avatar size={96} icon={<UserOutlined />} />
                  )}
                </div>
                <div className={styles.participantInfo}>
                  <span className={styles.participantName}>{adminName}</span>
                  {audioEnabled ? (
                    <AudioOutlined className={styles.audioIndicator} />
                  ) : (
                    <AudioMutedOutlined className={styles.audioIndicatorMuted} />
                  )}
                </div>
              </div>

              {/* User video */}
              <div className={styles.videoTile}>
                <div className={styles.videoPlaceholder} style={{ backgroundColor: '#3a5e79' }}>
                  {videoEnabled ? (
                    <div className={styles.fakeVideo}>
                      <img 
                        src="https://xsgames.co/randomusers/assets/avatars/male/24.jpg" 
                        alt="User"
                        className={styles.fakeVideoContent}
                      />
                    </div>
                  ) : (
                    <Avatar size={96} icon={<UserOutlined />} />
                  )}
                </div>
                <div className={styles.participantInfo}>
                  <span className={styles.participantName}>{userName}</span>
                  {audioEnabled ? (
                    <AudioOutlined className={styles.audioIndicator} />
                  ) : (
                    <AudioMutedOutlined className={styles.audioIndicatorMuted} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <Tooltip title={audioEnabled ? "Mute Audio" : "Unmute Audio"}>
            <Button
              type="default"
              shape="circle"
              icon={audioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
              onClick={toggleAudio}
              className={styles.controlButton}
            />
          </Tooltip>
          
          <Tooltip title={videoEnabled ? "Turn Off Video" : "Turn On Video"}>
            <Button
              type="default"
              shape="circle"
              icon={videoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
              onClick={toggleVideo}
              className={styles.controlButton}
            />
          </Tooltip>
          
          <Tooltip title="Chat">
            <Badge count={messageCount} size="small">
              <Button
                type="default"
                shape="circle"
                icon={<MessageOutlined />}
                onClick={toggleChat}
                className={styles.controlButton}
              />
            </Badge>
          </Tooltip>
          
          <Tooltip title="Settings">
            <Button
              type="default"
              shape="circle"
              icon={<SettingOutlined />}
              className={styles.controlButton}
            />
          </Tooltip>
          
          <Tooltip title="Leave Meeting">
            <Button
              danger
              type="primary"
              shape="round"
              icon={<LogoutOutlined />}
              className={styles.leaveButton}
            >
              Leave
            </Button>
          </Tooltip>
        </div>
      </Card>

      {chatOpen && (
        <div className={styles.chatPanel}>
          <Card title="Chat" className={styles.chatCard}>
            <div className={styles.chatMessages}>
              <div className={styles.messageAdmin}>
                <Avatar src="https://xsgames.co/randomusers/assets/avatars/female/67.jpg" size="small" />
                <div>
                  <div className={styles.messageSender}>{adminName}</div>
                  <div className={styles.messageContent}>Welcome to the session! Let me know if you have any questions.</div>
                </div>
              </div>
              
              <div className={styles.messageUser}>
                <div>
                  <div className={styles.messageSender}>You</div>
                  <div className={styles.messageContent}>Thanks for having me. I'm looking forward to learning more.</div>
                </div>
                <Avatar src="https://xsgames.co/randomusers/assets/avatars/male/24.jpg" size="small" />
              </div>
            </div>
            
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                className={styles.chatInputField}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setMessageCount(count => count + 1);
                  }
                }}
              />
              <Button type="primary">Send</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VideoChat; 