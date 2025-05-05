const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');

// In-memory storage for messages (would be replaced with database in production)
const chatMessages = {};

// Get all messages for a session
router.get('/messages/:sessionId', authenticateJWT, (req, res) => {
  const { sessionId } = req.params;
  
  if (!chatMessages[sessionId]) {
    chatMessages[sessionId] = [];
  }
  
  res.json(chatMessages[sessionId]);
});

// Add a new message to a session
router.post('/messages/:sessionId', authenticateJWT, (req, res) => {
  const { sessionId } = req.params;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }
  
  if (!chatMessages[sessionId]) {
    chatMessages[sessionId] = [];
  }
  
  const message = {
    id: Date.now().toString(),
    senderId: req.user.id,
    senderName: req.user.firstName + ' ' + req.user.lastName,
    content,
    timestamp: new Date(),
    isAdmin: req.user.isAdmin || false
  };
  
  chatMessages[sessionId].push(message);
  
  // In a real app, we would broadcast this message to all connected clients via WebSockets
  
  res.status(201).json(message);
});

// Delete a message (admin only)
router.delete('/messages/:sessionId/:messageId', authenticateJWT, (req, res) => {
  const { sessionId, messageId } = req.params;
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Only admins can delete messages' });
  }
  
  if (!chatMessages[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const initialLength = chatMessages[sessionId].length;
  chatMessages[sessionId] = chatMessages[sessionId].filter(msg => msg.id !== messageId);
  
  if (chatMessages[sessionId].length === initialLength) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  res.status(200).json({ message: 'Message deleted successfully' });
});

// Clear all messages for a session (admin only)
router.delete('/messages/:sessionId', authenticateJWT, (req, res) => {
  const { sessionId } = req.params;
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Only admins can clear messages' });
  }
  
  if (!chatMessages[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  chatMessages[sessionId] = [];
  
  res.status(200).json({ message: 'All messages cleared successfully' });
});

module.exports = router; 