'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface ChatProps {
  chatId: string;
  recipientId?: string;
  isGroupChat?: boolean;
}

export default function Chat({ chatId, recipientId, isGroupChat = false }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Example: This would be replaced with actual API call
        // const response = await fetch(`/api/chats/${chatId}/messages`);
        // const data = await response.json();
        // setMessages(data.messages);
        
        // Placeholder data for now
        const placeholderMessages: Message[] = [
          {
            id: '1',
            senderId: 'instructor-1',
            senderName: 'Dr. Johnson',
            content: 'Welcome to the discussion for Cognitive Behavioral Techniques!',
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            id: '2',
            senderId: user?.uid || 'user-1',
            senderName: user?.displayName || 'You',
            content: 'Thank you! I have a question about the behavioral activation techniques discussed in class.',
            timestamp: new Date(Date.now() - 1800000)
          },
          {
            id: '3',
            senderId: 'instructor-1',
            senderName: 'Dr. Johnson',
            content: 'Of course, what would you like to know?',
            timestamp: new Date(Date.now() - 900000)
          }
        ];
        
        setMessages(placeholderMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, user?.uid, user?.displayName]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageData: Message = {
      id: `temp-${Date.now()}`,
      senderId: user.uid,
      senderName: user.displayName || user.email || 'You',
      content: newMessage,
      timestamp: new Date()
    };

    // Optimistic update
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    try {
      // This would be the actual API call to send the message
      // await fetch(`/api/chats/${chatId}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     content: newMessage,
      //     recipientId: recipientId,
      //   }),
      // });
      
      // For now, we're just using the client-side state
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the message if it failed to send
      setMessages(prev => prev.filter(msg => msg.id !== messageData.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Chat header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {isGroupChat ? 'Group Chat' : 'Discussion Thread'} - {chatId}
        </h2>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 p-3 rounded-lg ${
                    message.senderId === user?.uid 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {message.senderId === user?.uid ? 'You' : message.senderName} • {message.timestamp.toLocaleTimeString()}
                  </div>
                  <div>{message.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="border-t p-4">
        <form 
          className="flex space-x-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 