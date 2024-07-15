'use client'
import React, { useState, useEffect } from 'react';

const CustomerCareChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [modelAdapterId, setModelAdapterId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const model = urlParams.get('model');
    setModelAdapterId(model);
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelAdapterId,
          query: message,
          maxTokens: 100
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the server');
      }

      const data = await response.json();

      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setError(error.message || 'An unknown error occurred');
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
    }

    setMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={toggleChat}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        {isChatOpen ? 'Close Chat' : 'Customer Care'}
      </button>

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg">
            <h3 className="font-bold">Customer Care Chat</h3>
          </div>
          <div className="flex-grow p-4 overflow-y-auto">
            {chatHistory.map((msg, index) => (
              <p key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'} text-black`}>
                  {msg.content}
                </span>
              </p>
            ))}
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerCareChat;