import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface DialogflowResponse {
  text: string;
  intent?: string;
  parameters?: Record<string, any>;
}

interface AgentChatProps {
  isOpen?: boolean;
}

export const AgentChat: React.FC<AgentChatProps> = ({ isOpen: externalIsOpen }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Generate a unique session ID
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    
    // Use external isOpen state if provided
    const chatIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
    
    // Add welcome message when chat is opened for the first time
    if (chatIsOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: 'Hello! Welcome to Cake A Day, How can I assist you today?',
          sender: 'agent',
          timestamp: new Date()
        }
      ]);
    }
  }, [externalIsOpen, isOpen, messages.length]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a function to handle intent navigation
  const handleIntentNavigation = (intent?: string, parameters?: Record<string, any>) => {
    if (!intent) return;
    
    // Add your navigation logic based on intents here
    // For example:
    switch (intent) {
      case 'order.cake':
        navigate('/order');
        break;
      case 'view.cart':
        navigate('/cart');
        break;
      // Add more cases as needed
    }
  };

  // Update the handleSendMessage function
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      console.log('Sending message to Dialogflow:', input);
      
      // Use the full URL in development for debugging
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:3001/api/dialogflow/message' 
        : '/api/dialogflow/message';
      
      console.log('Using API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input,
          sessionId: sessionId || `session_${Date.now()}`,
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to get response from Dialogflow: ${response.status} ${errorText}`);
      }
      
      const data: DialogflowResponse = await response.json();
      console.log('Dialogflow response data:', data);
      
      const agentMessage: Message = {
        id: `agent_${Date.now()}`,
        text: data.text || "I'm sorry, I didn't understand that. Can you try again?",
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Handle navigation based on intent
      handleIntentNavigation(data.intent, data.parameters);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Sorry, I encountered an error. Please try again later.',
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-2 p-2 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};