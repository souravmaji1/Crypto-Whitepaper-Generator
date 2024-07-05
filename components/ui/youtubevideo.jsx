"use client"
import React, { useState, useEffect, useCallback } from 'react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

import {  Plus } from 'lucide-react';

//const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

import { GoogleGenerativeAI,HarmCategory,HarmBlockThreshold } from '@google/generative-ai';

const apiKey = "AIzaSyAmUcYgO4KOVusTdWXc7xEHRY-8l7dKMWc";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  }
];

// Create a chat session
const chatSession = model.startChat({
  generationConfig,
  safetySettings,
});



export default function MockInterview() {
  const [userInput, setUserInput] = useState({ role: '', skills: '' });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimResult, setInterimResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recognition, setRecognition] = useState(null);

  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setInterimResult(interimTranscript);
        if (finalTranscript !== '') {
          setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentQuestionIndex] = finalTranscript;
            return newAnswers;
          });
        }
      };

      setRecognition(recognition);
    } else {
      console.error('Speech recognition not supported');
    }
  }, [currentQuestionIndex]);

  const simulateProgress = useCallback(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const generateQuestions = async () => {
    setIsLoading(true);
    const stopSimulation = simulateProgress();
    try {
      const prompt = `Generate 5 interview questions for a ${userInput.role} position with skills in ${userInput.skills}. Please format each question as a numbered list item, starting with "1." and do not include any introductory text or headings.`;
      const result = await chatSession.sendMessage(prompt);
      const rawQuestions = result.response.text().split('\n');
      const formattedQuestions = rawQuestions
        .filter(q => /^\d+\./.test(q.trim()))
        .map(q => q.replace(/^\d+\.\s*/, '').trim());
      setQuestions(formattedQuestions);
      setAnswers(new Array(formattedQuestions.length).fill(''));
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      stopSimulation();
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  const startAnswering = useCallback(() => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    }
  }, [recognition]);

  const stopAnswering = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      setInterimResult('');
    }
  }, [recognition]);

  const provideFeedback = async () => {
    setIsFeedbackLoading(true);
    const stopSimulation = simulateProgress();
    try {
      const prompt = `Provide feedback on these interview answers for a ${userInput.role} position: ${answers.join(' ')}`;
      const result = await chatSession.sendMessage(prompt);
      setFeedback(result.response.text());
    } catch (error) {
      console.error('Error providing feedback:', error);
    } finally {
      stopSimulation();
      setProgress(100);
      setTimeout(() => {
        setIsFeedbackLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-4">
        <h1
            
          >Start your AI Mock Interview</h1>
        </div>
        {questions.length === 0 ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
           Add New
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={provideFeedback} disabled={isLoading}>
            Finish Interview
          </Button>
        )}
      </header>
      <div className="flex-1 flex flex-col p-6">
        {questions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Start Your Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input 
                  placeholder="Role" 
                  value={userInput.role} 
                  onChange={(e) => setUserInput(prev => ({...prev, role: e.target.value}))}
                />
                <Input 
                  placeholder="Skills" 
                  value={userInput.skills} 
                  onChange={(e) => setUserInput(prev => ({...prev, skills: e.target.value}))}
                />
                <Button onClick={generateQuestions} disabled={isLoading}>
                  {isLoading ? 'Generating Questions...' : 'Start Interview'}
                </Button>
                {isLoading && (
                  <Progress value={progress} className="w-full" />
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8 bg-muted/40 p-6 rounded-lg shadow-md">
              <nav className="flex justify-center gap-4">
                {questions.map((_, index) => (
                  <QuestionNavItem 
                    key={index}
                    number={index + 1}
                    isActive={currentQuestionIndex === index}
                    onClick={() => setCurrentQuestionIndex(index)}
                  />
                ))}
              </nav>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                <CardDescription>{questions[currentQuestionIndex]}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-center h-[100px] bg-muted rounded-md">
                    {!isRecording ? (
                      <Button onClick={startAnswering}>Start Answering</Button>
                    ) : (
                      <Button onClick={stopAnswering} variant="destructive">Stop Answering</Button>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Textarea 
                      value={answers[currentQuestionIndex] || interimResult} 
                      onChange={(e) => setAnswers(prev => {
                        const newAnswers = [...prev];
                        newAnswers[currentQuestionIndex] = e.target.value;
                        return newAnswers;
                      })}
                      placeholder="Your answer will appear here..."
                      rows={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <div className='mt-4'>

        {isFeedbackLoading && (
                  <Progress value={progress} className="w-full" />
                )}

        </div>
      

        {feedback && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{feedback}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function QuestionNavItem({ number, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-lg scale-110'
          : 'bg-muted text-muted-foreground hover:bg-muted hover:text-primary'
      }`}
    >
      <span className={`text-sm font-medium`}>
        {number}
      </span>
    </button>
  )
}

