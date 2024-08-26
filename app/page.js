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
import axios from "axios"
import Vapi from "@vapi-ai/web";
import { createClient } from '@supabase/supabase-js'

const vapi = new Vapi("47bc2bc7-173d-4474-b2c5-ed12188b82b3");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


const CustomerCareChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [modelAdapterId, setModelAdapterId] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [assistantId, setAssistantId] = useState('');
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  // Simulated customer data
  const customer = {
    name: "StartConvo",
    avatar: "/api/placeholder/32/32",
    isOnline: true
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const model = urlParams.get('model');
    setModelAdapterId(model);

    if (model) {
      fetchAssistantId(model);
    }

    vapi.on("call-start", () => {
      console.log("Call has started.");
      // Update UI to show call in progress
    });

    vapi.on("call-end", () => {
      console.log("Call has ended.");
      setIsCallInProgress(false);
    });


    vapi.on("error", (e) => {
      console.error("Vapi error:", e);
      setError("An error occurred during the call.");
    });


    return () => {
      vapi.removeAllListeners();
    };

  }, []);

  const fetchAssistantId = async (modelId) => {
    try {
      const { data, error } = await supabase
        .from('mybots') // Replace with your actual table name
        .select('assistant_id')
        .eq('finetune_id', modelId)
        .single();

      if (error) throw error;

      if (data) {
        setAssistantId(data.assistant_id);
      } else {
        console.error('No assistant ID found for this model');
        setError('No assistant found for this model');
      }
    } catch (error) {
      console.error('Error fetching assistant ID:', error);
      setError('Error fetching assistant information');
    }
  };

  const handleCallClick = async () => {
    try {
      await vapi.start(assistantId);
      setIsCallInProgress(true);
    } catch (error) {
      console.error("Error starting call:", error);
      setError("Failed to start the call. Please try again.");
    }
  };

  const handleEndCall = async () => {
    try {
      await vapi.stop();
      setIsCallInProgress(false);
    } catch (error) {
      console.error("Error ending call:", error);
      setError("Failed to end the call properly. You may need to refresh the page.");
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && chatHistory.length === 0) {
      // Add welcome message when chat is opened for the first time
      setChatHistory([
        { 
          role: 'assistant', 
          content: `Hello ! Welcome to our customer care chat. How may I assist you today?`
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
      const response = await axios.post('https://api.cohere.com/v1/chat', {
        model: modelAdapterId,
        message: message
      }, {
        headers: {
          'Authorization': 'Bearer suaH02pXwO37aD8XQsYca1XlE3chrOvMGcdHJRJV',
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data && response.data.text) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.text }]);
      } else {
        throw new Error('Invalid response from Cohere API');
      }
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
              <Button 
  variant="ghost" 
  size="icon" 
  className="text-orange-foreground h-8 w-8"  
  onClick={isCallInProgress ? handleEndCall : handleCallClick} 
  disabled={!assistantId}
>
  {isCallInProgress ? (
    <X className="h-4 w-4 text-red-500" />
  ) : (
    <Phone className="h-4 w-4" />
  )}
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