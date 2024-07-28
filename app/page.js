'use client'
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const CustomerCareChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [modelAdapterId, setModelAdapterId] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated customer data
  const customer = {
    name: "John Doe",
    avatar: "/api/placeholder/32/32",
    isOnline: true
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const model = urlParams.get('model');
    setModelAdapterId(model);
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && chatHistory.length === 0) {
      // Add welcome message when chat is opened for the first time
      setChatHistory([
        { 
          role: 'assistant', 
          content: `Hello ${customer.name}! Welcome to our customer care chat. How may I assist you today?`
        }
      ]);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setError(null);
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }

    setMessage('');
  };

  const LoadingDots = () => (
    <div className="flex space-x-1 items-center">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 bg-orange-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: dot * 0.2,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4">
      <Button
        onClick={toggleChat}
        variant="default"
        size="icon"
        className="rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 bg-orange-500 hover:bg-orange-600 text-white"
      >
        {isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {isChatOpen && (
        <Card className="fixed bottom-20 right-4 w-80 h-[24rem] flex flex-col">
          <CardHeader className="bg-orange-500 text-orange-foreground p-2" style={{borderRadius:'5px 5px 0 0'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-medium">{customer.name}</CardTitle>
                  <p className="text-xs opacity-70 flex items-center">
                    <span className={`h-2 w-2 rounded-full mr-1 ${customer.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    {customer.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="text-orange-foreground h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-orange-foreground h-8 w-8">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-orange-foreground h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="flex-grow p-3 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="/api/placeholder/32/32" alt="Customer Care" />
                      <AvatarFallback>CC</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[70%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-orange-500 text-orange-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src="/api/placeholder/32/32" alt="Customer Care" />
                    <AvatarFallback>CC</AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary text-secondary-foreground p-2 rounded-lg">
                    <LoadingDots />
                  </div>
                </div>
              )}
              {error && <p className="text-destructive text-sm">{error}</p>}
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardFooter className="p-2">
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-grow text-sm"
              />
              <Button type="submit" size="icon" className="bg-orange-500 hover:bg-orange-600 text-white h-8 w-8" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CustomerCareChat;