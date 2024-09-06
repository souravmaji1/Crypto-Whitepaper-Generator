'use client'


import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, Video, MoreVertical, ChevronsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from "axios"
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js'
import Vapi from "@vapi-ai/web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const vapi = new Vapi("ae9531e2-ffe6-4d7f-aa52-ec3f9bc043ac");

const supabaseUrl = 'https://tnijqmtoqpmgdhvltuhl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaWpxbXRvcXBtZ2Rodmx0dWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwOTE3MzcsImV4cCI6MjA0MDY2NzczN30.3c2EqGn5n0jLmG4l2NO_ovN_aIAhaLDBa0EKdwdnhCg'
const supabase = createClient(supabaseUrl, supabaseKey)

const CustomerCareChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [modelAdapterId, setModelAdapterId] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState('initial'); // 'initial', 'signIn', 'signUp', 'verifying', 'chat'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [code, setCode] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [isCallInProgress, setIsCallInProgress] = useState(false);

  const [username, setUsername] = useState('');

  const [botTitle, setBotTitle] = useState('');
const [botDescription, setBotDescription] = useState('');
const [brandingColor, setBrandingColor] = useState('');
const [fontStyle, setFontStyle] = useState('');
const [ initialmessage, setInitialMessage] = useState("");
const [temperature, setTemperature] = useState("");

const [tickets, setTickets] = useState([]);
const [selectedTicket, setSelectedTicket] = useState(null);
const [ticketTitle, setTicketTitle] = useState('');
const [ticketDescription, setTicketDescription] = useState('');
const [ticketChatHistory, setTicketChatHistory] = useState([]);

  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { user } = useUser();
  const [ avatarurl, setavatarurl] = useState('');

  useEffect(() => {
    if (user) {
      setAuthState('chat');
      fetchTickets();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const model = urlParams.get('model');
    setModelAdapterId(model);

    if (model) {
      fetchAssistantId(model);
      fetchBotSettings(model);
    }

    vapi.on("call-start", () => {
      console.log("Call has started.");
      setIsCallInProgress(true);
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
  }, [user]);

  const fetchAssistantId = async (modelId) => {
    try {
      const { data, error } = await supabase
        .from('chatbot')
        .select('assistant_id','temperature')
        .eq('finetune_id', modelId)
        .single();

      if (error) throw error;

      if (data) {
        setAssistantId(data.assistant_id);
        setTemperature(data.temperature);
      } else {
        console.error('No assistant ID found for this model');
        setError('No assistant found for this model');
      }
    } catch (error) {
      console.error('Error fetching assistant ID:', error);
      setError('Error fetching assistant information');
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('model_adapter_id', modelAdapterId)
        .eq('user_id', user.id);

      if (error) throw error;
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to fetch tickets');
    }
  };

  const createTicket = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          model_adapter_id: modelAdapterId,
          title: ticketTitle,
          description: ticketDescription,
          status: 'open'
        })
        .select();

      if (error) throw error;

      setTickets([...tickets, data[0]]);
      setTicketTitle('');
      setTicketDescription('');
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create ticket');
    }
  };

  const selectTicket = (ticket) => {
    setSelectedTicket(ticket);
    fetchTicketChatHistory(ticket.id);
  };

  const fetchTicketChatHistory = async (ticketId) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTicketChatHistory(data);
    } catch (error) {
      console.error('Error fetching ticket chat history:', error);
      setError('Failed to fetch ticket chat history');
    }
  };

  const handleTicketReply = async () => {
    if (!message.trim() || !selectedTicket) return;

    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          content: message,
          is_from_user: true
        })
        .select();

      if (error) throw error;

      setTicketChatHistory([...ticketChatHistory, data[0]]);
      setMessage('');
    } catch (error) {
      console.error('Error sending ticket reply:', error);
      setError('Failed to send reply');
    }
  };






  const fetchBotSettings = async (modelAdapterId) => {
    try {
      const { data, error } = await supabase
        .from('chatbot')
        .select('*')
        .eq('finetune_id', modelAdapterId)
        .single();
  
      if (error) throw error;
  
      if (data) {
        setBotTitle(data.title);
        setBotDescription(data.description);
        setBrandingColor(data.theme);
        setFontStyle(data.fontfamily);
        setInitialMessage(data.initial_message);
        setavatarurl(data.avatar_url);
      } else {
        console.error('No bot settings found for this model');
        setError('No bot settings found for this model');
      }
    } catch (error) {
      console.error('Error fetching bot settings:', error);
      setError('Error fetching bot settings');
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!isSignInLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        setAuthState('chat');
      } else {
        setError("Sign in failed. Please check your credentials and try again.");
      }
    } catch (err) {
      console.error("Error during sign in:", err);
      setError("An error occurred during sign in.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
  
    try {
      const result = await signUp.create({
        emailAddress: email,
        username,
        password,
      });
  
      await result.prepareEmailAddressVerification({ strategy: "email_code" });
      setAuthState('verifying');
    } catch (err) {
      console.error("Error during sign up:", err);
      setError("An error occurred during sign up.");
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
  
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("Verification response:", completeSignUp);
      
      if (completeSignUp.status === "complete") {
        await setSignUpActive({ session: completeSignUp.createdSessionId });
        setAuthState('chat');
      } else if (completeSignUp.status === "missing_requirements") {
        console.error("Missing requirements:", completeSignUp.missingFields);
        setError(`Verification incomplete. Missing: ${completeSignUp.missingFields.join(', ')}`);
      } else {
        console.error("Incomplete verification:", completeSignUp);
        setError(`Verification failed: ${completeSignUp.status}`);
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setError(`An error occurred during verification: ${err.message}`);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && chatHistory.length === 0) {
      setChatHistory([
        { 
          role: 'assistant', 
          content: `${initialmessage}`
        }
      ]);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };


  const saveChatMessage = async (role, content) => {
    try {
      const { error } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          model_adapter_id: modelAdapterId,
          role,
          content,
          email: user.emailAddresses[0].emailAddress,
          username: user.username,
          imageurl: user.imageUrl
        });

      if (error) throw error;

      await updateChatbotStatistics(modelAdapterId);

    } catch (error) {
      console.error('Error saving chat message:', error);
      // Optionally set an error state here
    }
  };


  const updateTotalTokens = async (modelAdapterId, tokensUsed) => {
    try {
      const { data, error } = await supabase
        .from('chatbot')
        .select('total_tokens')
        .eq('finetune_id', modelAdapterId)
        .single();

      if (error) throw error;

      const newTotalTokens = (data.total_tokens || 0) + tokensUsed;

      const { updateError } = await supabase
        .from('chatbot')
        .update({ total_tokens: newTotalTokens })
        .eq('finetune_id', modelAdapterId);

      if (updateError) throw updateError;

      console.log('Total tokens updated successfully');
    } catch (error) {
      console.error('Error updating total tokens:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    await saveChatMessage('user', message);
    setError(null);
    setIsLoading(true);
  
    try {

   // Tokenize the user message
   const tokenResponse = await axios.post(
    'https://api.cohere.com/v1/tokenize',
    {
      model: 'command',
      text: message,
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer 9MJzxkVoFlOO37IBNZaZKM4LUi06I9Z4mbPKQwYr`, // Replace with your actual API key
      }
    }
  );

  console.log('Tokenized response:', tokenResponse.data);

  // Update total tokens in the Supabase table
  const totalTokens = tokenResponse.data.tokens.length;
  

  await updateTotalTokens(modelAdapterId,totalTokens);

      const response = await axios.post('https://api.cohere.com/v1/chat', {
        model: modelAdapterId,
        message: message,
        temperature: temperature
      }, {
        headers: {
          'Authorization': 'Bearer suaH02pXwO37aD8XQsYca1XlE3chrOvMGcdHJRJV',
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data && response.data.text) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.text }]);
        await saveChatMessage('assistant', response.data.text);
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


  const updateChatbotStatistics = async (modelAdapterId) => {
    try {
      // Get the count of unique users and total messages for this model adapter
      const { data, error } = await supabase
        .from('chat_history')
        .select('user_id, id', { count: 'exact' })
        .eq('model_adapter_id', modelAdapterId);

      if (error) throw error;

      // Count unique users
      const uniqueUserCount = new Set(data.map(item => item.user_id)).size;

      // Total content is the total number of messages
      const totalContent = data.length;

      // Update the statistics
      const { error: updateError } = await supabase
        .from('chatbot')
        .update({
          total_conversations: uniqueUserCount,
          total_content: totalContent
        })
        .eq('finetune_id', modelAdapterId);

      if (updateError) throw updateError;

      console.log('Chatbot statistics updated successfully');
    } catch (error) {
      console.error('Error updating chatbot statistics:', error);
      setError('Failed to update chatbot statistics');
    }
  };

  const renderTicketList = () => (
    <ScrollArea className="h-[300px] pr-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className={`mb-2 p-2 rounded cursor-pointer ${
            selectedTicket && selectedTicket.id === ticket.id ? 'bg-secondary' : 'hover:bg-secondary/50'
          }`}
          onClick={() => selectTicket(ticket)}
        >
          <h3 className="font-semibold">{ticket.title}</h3>
          <p className="text-sm text-muted-foreground">{ticket.status}</p>
        </div>
      ))}
    </ScrollArea>
  );

  const renderTicketChat = () => (
    <>
      <ScrollArea className="h-[300px] pr-4">
        {ticketChatHistory.map((msg, index) => (
          <div key={index} className={`mb-3 flex ${msg.is_from_user ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
              msg.is_from_user ? `bg-orange-500 text-orange-foreground` : 'bg-secondary text-secondary-foreground'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </ScrollArea>
      <Separator className="my-2" />
      <form onSubmit={(e) => { e.preventDefault(); handleTicketReply(); }} className="flex items-center space-x-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply..."
          className="flex-grow"
        />
        <Button type="submit" size="icon" className="text-white" style={{ backgroundColor: brandingColor }}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </>
  );

  const renderTicketCreation = () => (
    <div className="space-y-4">
      <Input
        type="text"
        value={ticketTitle}
        onChange={(e) => setTicketTitle(e.target.value)}
        placeholder="Ticket Title"
      />
      <Input
        type="text"
        value={ticketDescription}
        onChange={(e) => setTicketDescription(e.target.value)}
        placeholder="Ticket Description"
      />
      <Button onClick={createTicket} className="w-full">Create Ticket</Button>
    </div>
  );




  const renderAuthContent = () => {
    switch (authState) {
      case 'initial':
        return (
          <>
            <Button onClick={() => setAuthState('signIn')} className="w-full mb-2">Sign In</Button>
            <Button onClick={() => setAuthState('signUp')} className="w-full">Sign Up</Button>
          </>
        );
      case 'signIn':
        return (
          <form onSubmit={handleSignIn}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button className='w-full mt-4' type="submit">Sign In</Button>
          </form>
        );
        case 'signUp':
          return (
            <form onSubmit={handleSignUp}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button className='w-full mt-4' type="submit">Sign Up</Button>
            </form>
          );
      case 'verifying':
        return (
          <form onSubmit={handleVerification}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="code">Verification Code</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" />
              </div>
            </div>
            <Button className='w-full mt-4' type="submit">Verify</Button>
          </form>
        );
      case 'chat':
        return (
          <>
           <Tabs defaultValue="chat">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="new-ticket">New Ticket</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">

            <ScrollArea className="h-[300px] pr-4">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="/api/placeholder/32/32" alt="Customer Care" />
                      <AvatarFallback>CC</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[70%] p-2 rounded-lg text-sm ${msg.role === 'user' ? `bg-orange-500 text-orange-foreground` : 'bg-secondary text-secondary-foreground'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <Separator className="my-2" />
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <Input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-grow"
              />
              <Button type="submit" size="icon" className="text-white"  style={{
            backgroundColor: brandingColor
          }}   disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>

            </TabsContent>
            <TabsContent value="tickets">
              <div className="grid grid-cols-2 gap-4">
                <div>{renderTicketList()}</div>
                <div>{selectedTicket && renderTicketChat()}</div>
              </div>
            </TabsContent>
            <TabsContent value="new-ticket">
              {renderTicketCreation()}
            </TabsContent>
          </Tabs>
          </>
        );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999, // Ensure it's above other elements
      fontFamily: fontStyle,
    }}>
      <Button
        onClick={toggleChat}
        variant="default"
        size="icon"
        className="rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105  text-white"
        style={{ backgroundColor: brandingColor, color: 'white' }}
      >
        {isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {isChatOpen && (
        <Card className="fixed bottom-20 right-4 w-80 flex flex-col"  style={{ 
          position: 'absolute',
          bottom: '60px', // Adjust based on the size of your toggle button
          right: '0px',
          fontFamily: fontStyle,
          maxHeight: '80vh', // Limit the height to 80% of the viewport height
          overflowY: 'auto' // Add scrolling if content exceeds maxHeight
        }} >
          <CardHeader className={`p-2  text-white`} style={{borderTopRightRadius:'5px',borderTopLeftRadius:'5px', backgroundColor: brandingColor, }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
              {avatarurl ? (
                  <img src={avatarurl} alt="Avatar Preview" className="mt-2 w-10 h-10 rounded-full" />
                ) : (
                  <Avatar className="h-10 w-10"  >
                    <AvatarFallback  style={{ backgroundColor: brandingColor, color: 'white' }}  >
                      <MessageCircle className="h-6 w-6"    />
                    </AvatarFallback>
                  </Avatar>
                )}
                <CardTitle className="text-sm font-medium">{botTitle}</CardTitle>

              </div>
              {authState === 'chat' && (
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
              )}
              
            </div>
            <h2 className='text-sm font-medium'>{botDescription}</h2>
          </CardHeader>
          <CardContent className="p-4">
            {renderAuthContent()}
          </CardContent>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Card>
      )}
    </div>
  );
};

export default CustomerCareChat;


