# Breakout Room Chat Implementation

## Overview

This implementation replaces the built-in Jitsi chat functionality with a custom backend-driven breakout room chat system. The Jitsi chat has been hidden/disabled, and a new chat component has been integrated that works with our backend API.

## Components

### 1. JitsiMeeting Component
- The Jitsi built-in chat feature has been disabled by:
  - Removing 'chat' from the TOOLBAR_BUTTONS array
  - Adding DISABLE_CHAT: true to the interfaceConfigOverwrite object

### 2. BreakoutChat Component
- A new React component that provides chat functionality
- Features:
  - Real-time message updates via polling (can be replaced with WebSockets)
  - Admin controls for message deletion and chat moderation
  - Visual distinction between admin/instructor and student messages
  - Unread message notifications
  - Mobile-responsive design

### 3. Backend API
- RESTful API endpoints for chat operations:
  - GET /api/chat/messages/:sessionId - Fetch all messages for a session
  - POST /api/chat/messages/:sessionId - Add a new message
  - DELETE /api/chat/messages/:sessionId/:messageId - Delete a specific message (admin only)
  - DELETE /api/chat/messages/:sessionId - Clear all messages for a session (admin only)

## Integration

The breakout chat has been integrated into:
1. **Workshop Session Page** - For student users
   - Side-by-side with video conference
   - Also available as a dedicated tab for mobile users

2. **Admin Workshop Session Page** - For admin/instructor users
   - Side-by-side with video conference
   - Added admin controls for moderation
   - Dedicated tab for full-screen chat management

## Technical Details

### Backend
- Messages are stored on the backend server
- Authentication required for all chat operations
- Admin privileges required for moderation features
- In-memory storage used for demo (should be replaced with database in production)

### Frontend
- Real-time updates via polling (every 5 seconds)
- Seamless integration with existing authentication system
- Responsive layout that works alongside Jitsi video conference
- Graceful handling of API connection errors

## Security Features
- All chat messages are managed through the backend, not Jitsi
- Authentication required for all API calls
- Only admins can delete messages
- API endpoints protected with JWT authentication

## Development Notes
- Mock data is provided for development/testing
- Backend chat API can be extended to support additional features
- WebSocket implementation recommended for production use 