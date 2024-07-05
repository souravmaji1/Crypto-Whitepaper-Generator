"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Bricolage_Grotesque } from 'next/font/google'
import { Space_Mono } from 'next/font/google'
import { useState } from "react"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { createClient } from '@supabase/supabase-js'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserButton } from "@clerk/nextjs"
import React, {  useEffect, useCallback } from 'react';
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { GoogleGenerativeAI,HarmCategory,HarmBlockThreshold } from '@google/generative-ai';
import { useUser } from "@clerk/nextjs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


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




const fontBodyBold = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: '700',
  variable: '--font-body',
})

const fontBold = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  weight: '700',
  variable: '--font-heading',
})

const fontBody = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-body',
})



export default function Component() {
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
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
    const { user } = useUser("");
    const [credits, setCredits] = useState("");
    const [ error,setError] = useState("");



    useEffect(() => {
    

      async function initializeUser() {
        if (!user) return;
  
        try {
          // Check if user exists in Supabase
          const { data, error } = await supabase
            .from('prepmasterai')
            .select('id, credits')
            .eq('userid', user.id)
            .single();
  
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
  
          if (!data) {
            // New user: Insert into Supabase with initial credits
            const { data: newUser, error: insertError } = await supabase
              .from('prepmasterai')
              .insert({
                userid: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                credits: 100
              })
              .single();
  
            if (insertError) throw insertError;
  
            setCredits(100);
          } else {
            setCredits(data.credits);
          }
        } catch (err) {
          console.error('Error initializing user:', err);
          setError('Failed to initialize user data');
        } 
      }
  
      initializeUser();
    }, [user]);


    useEffect(() => {
      if (questions.length > 0 && answers.length === questions.length) {
        const allAnswered = answers.every(answer => answer.trim() !== '');
        setAllQuestionsAnswered(allAnswered);
      } else {
        setAllQuestionsAnswered(false);
      }
    }, [questions, answers]);

  
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
    <div className="flex flex-col min-h-[100dvh]">
     <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
      <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
        <span className="sr-only">Acme SaaS Platform</span>
      </Link>
      <nav className="ml-auto hidden lg:flex gap-4">
        <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
          Features
        </Link>
        <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
          Pricing
        </Link>
        <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
          About
        </Link>
        <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
          Contact
        </Link>
      </nav>
      <div className="ml-auto hidden lg:flex gap-4">
      <UserButton />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="ml-auto lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <nav className="flex flex-col gap-4">
            <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
              Features
            </Link>
            <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
              Pricing
            </Link>
            <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
              About
            </Link>
            <Link href="#" className={`text-sm font-medium ${fontBody.className}`} prefetch={false}>
              Contact
            </Link>
            <Link href="/dress">
            <Button variant="outline" className={`w-full ${fontBody.className}`}>Sign in</Button>
            </Link>
            <Link href="/dress">
            <Button className={`w-full ${fontBody.className}`} style={{background:"#d5b990"}}>Sign Up</Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
    <main className="flex-1 py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h1 className={`text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl ${fontBold.className}`}>Interview with PrepMasterAI</h1>
            <p className={`text-muted-foreground md:text-xl ${fontBody.className}`}>
              We're excited to start your Mock Interview! Please fill out the form below to get started Now.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <StarIcon className="w-4 h-4 fill-secondary"  />
              <StarIcon className="w-4 h-4 fill-secondary"  />
              <StarIcon className="w-4 h-4 fill-secondary"  />
              <StarIcon className="w-4 h-4 fill-secondary"  />
              <StarIcon className="w-4 h-4 fill-secondary" />
              <span className={`${fontBody.className}`}>100+ users have used this</span>
            </div>
            {questions.length > 0 && (
  <Button size="sm" variant="outline" className={`${fontBold.className}`}  onClick={provideFeedback}  disabled={isLoading || !allQuestionsAnswered}>
     {allQuestionsAnswered ? 'Finish Interview' : 'Answer all questions to finish'}
  </Button>
)}

            {questions.length === 0 ? (
            <div className="bg-card rounded-lg shadow-sm p-6 md:p-8 space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className={`${fontBold.className}`}>Role</Label>
                <Input 
                  placeholder="Ex: Software engineer" 
                  value={userInput.role} 
                  onChange={(e) => setUserInput(prev => ({...prev, role: e.target.value}))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skills" className={`${fontBold.className}`}  >Skills</Label>
                <Input 
                  placeholder="Ex: Reactjs, Nodejs" 
                  value={userInput.skills} 
                  onChange={(e) => setUserInput(prev => ({...prev, skills: e.target.value}))}
                />
              </div>
              
              <Button className={`w-full bg-customBg ${fontBody.className}`} onClick={generateQuestions} disabled={isLoading}   >
              {isLoading ? 'Generating Questions...' : 'Start Interview'}
              </Button>
              {isLoading && (
                  <Progress value={progress} className="w-full" />
                )}
            </div>
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
                <CardTitle className={`${fontBold.className}`}>Question {currentQuestionIndex + 1}</CardTitle>
                <CardDescription className={`${fontBody.className}`}>{questions[currentQuestionIndex]}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-center h-[100px] bg-muted rounded-md">
                    {!isRecording ? (
                      <Button onClick={startAnswering} className={`${fontBody.className} bg-customBg`} >Start Answering</Button>
                    ) : (
                      <Button onClick={stopAnswering} variant="destructive" className={`${fontBody.className}`}  >Stop Answering</Button>
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

{isFeedbackLoading && (
                  <Progress value={progress} className="w-full" />
                )}




{feedback && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className={`${fontBold.className}`}>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`${fontBody.className}`}>{feedback}</p>
            </CardContent>
          </Card>
        )}

          </div>

          
        </div>

      


      </main>


      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className={`text-xs text-muted-foreground ${fontBodyBold.className}  `}>&copy; 2024 PrepMasterAI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className={`text-xs hover:underline underline-offset-4 ${fontBody.className}  `} prefetch={false}>
            Pricing
          </Link>
          <Link href="#" className={`text-xs hover:underline underline-offset-4 ${fontBody.className}  `} prefetch={false}>
            About
          </Link>
          <Link href="#" className={`text-xs hover:underline underline-offset-4 ${fontBody.className}  `} prefetch={false}>
            Contact
          </Link>
          <Link href="#" className={`text-xs hover:underline underline-offset-4 ${fontBody.className}  `} prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}



function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function StarIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  }


  function QuestionNavItem({ number, isActive, onClick }) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          isActive
            ? 'bg-customBg text-primary-foreground shadow-lg scale-110'
            : 'bg-muted text-muted-foreground hover:bg-muted hover:text-primary'
        }`}
      >
        <span className={`text-sm font-medium ${fontBold.className}`}>
          {number}
        </span>
      </button>
    )
  }
  
  