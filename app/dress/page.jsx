"use client"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { Bricolage_Grotesque } from 'next/font/google'
import { Space_Mono } from 'next/font/google'
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { createClient } from "@supabase/supabase-js"
import { useUser } from "@clerk/nextjs"
import { loadStripe } from "@stripe/stripe-js";
import checkoutCredits from '@/utils/actions/checkout.actions'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ShoppingBag } from "lucide-react"
import Link from "next/link"


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);



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
    const [backgroundFile, setBackgroundFile] = useState(null);
    const [garmentFile, setGarmentFile] = useState(null);
    const [backgroundPreview, setBackgroundPreview] = useState(null);
    const [garmentPreview, setGarmentPreview] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [alertInfo, setAlertInfo] = useState(null);

    const { user } = useUser("");
    const [credits, setCredits] = useState("");

    const [zoomLevel, setZoomLevel] = useState(1);
    const [rotation, setRotation] = useState(0);

    const [selectedBodyType, setSelectedBodyType] = useState(null);

    const [selectedGarmentStyle, setSelectedGarmentStyle] = useState(null);

    useEffect(() => {
      loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    
      async function fetchUserCredits() {
        if (user) {
          const { data, error } = await supabase
            .from('dressmeup')
            .select('credits')
            .eq('userid', user.id)
            .single();
  
          if (error) {
            console.error('Error fetching user credits:', error);
          } else {
            setCredits(data?.credits || 0);
          }
        }
      }

      async function initializeUser() {
        if (!user) return;
  
        try {
          // Check if user exists in Supabase
          const { data, error } = await supabase
            .from('dressmeup')
            .select('id, credits')
            .eq('userid', user.id)
            .single();
  
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
  
          if (!data) {
            // New user: Insert into Supabase with initial credits
            const { data: newUser, error: insertError } = await supabase
              .from('dressmeup')
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
      fetchUserCredits();
    }, [user]);

    const onCheckout = async () => {
      await checkoutCredits();
    };


    const predefinedGarments = [
        { name: 'Maxi Dress', src: '/maxis.jfif' },
        { name: 'Shirt Dress', src: '/shirt.jpg' },
        { name: 'Tshirt Dress', src: '/tshirt.jfif' }
    ];
  
    const handleFileChange = (event, setFile, setPreview) => {
      const file = event.target.files[0];
      if (file) {
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        console.log(`File selected: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
        // Clear selected dress style when uploading a garment image
        if (setFile === setGarmentFile) {
          setSelectedGarmentStyle(null);
      }
      }
    };

    const handleGarmentStyleSelect = async (style) => {
      setSelectedGarmentStyle(style);
      setGarmentPreview(style.src);
      try {
          const response = await fetch(style.src);
          const blob = await response.blob();
          const file = new File([blob], `${style.name}.jpg`, { type: 'image/jpeg' });
          setGarmentFile(file);
      } catch (error) {
          console.error("Error converting preset image to file:", error);
          setError("Failed to load preset garment image. Please try again or upload your own image.");
      }
  };

  const deductCredit = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('dressmeup')
      .update({ credits: credits - 1 })
      .eq('userid', user.id)
      .select();

    if (error) {
      console.error('Error deducting credit:', error);
      setError('Failed to deduct credit. Please try again.');
    } else {
      setCredits(prevCredits => prevCredits - 1);
    }
  };
  
    const runApi = async () => {
      setError(null);
      setResults(null);
      setDebugInfo(null);
      setIsLoading(true);
      setAlertInfo(null);
  
      if (credits <= 0) {
        setError('You do not have enough credits to perform this action.');
        setAlertInfo({
          title: "Insufficient Credits",
          description: "You do not have enough credits to perform this action. Please purchase more credits."
        });
        setIsLoading(false);
        return;
      }
  
      const formData = new FormData();
      formData.append('background', backgroundFile);

      if (garmentFile) {
        formData.append('garment', garmentFile);
    } else if (selectedGarmentStyle) {
        // Here we're using the src of the selected garment style
        // You might need to adjust this based on how your API expects to receive predefined garments
        formData.append('garment', selectedGarmentStyle.src);
    }
  
      try {
        console.log("Sending request to /api/tryon");
        const response = await fetch(`/api/tryon`, {
          method: 'POST',
          body: formData,
        });
  
        console.log("Response received:", response);
  
        const data = await response.json();
        console.log("Response data:", data);
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, message: ${data.error || 'Unknown error'}`);
        }
  
        if (data.error) {
          setDebugInfo(JSON.stringify(data.data, null, 2));
          throw new Error(data.error);
        }
  
        if (data.backgroundUrl && data.garmentUrl) {
          setResults({
            backgroundUrl: data.backgroundUrl,
            garmentUrl: data.garmentUrl
          });

          await deductCredit();

        } else {
          console.log('Unexpected result format:', data);
          setError('Received an unexpected result format from the server.');
          setDebugInfo(JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.error("An error occurred:", error);
        setError(error.message);
        setAlertInfo({
          title: "API Error",
          description: "The line is busy. Please wait for a couple of hours and try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleZoom = () => {
      setZoomLevel(prevZoom => prevZoom + 0.1);
    };

    const handleRotate = () => {
      setRotation(prevRotation => prevRotation + 90);
    };


  return (
    <div className="flex flex-col min-h-screen">
       <header className="text-primary-foreground py-2 sm:py-4 px-2 sm:px-6" style={{ background: "#265973" }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <Link href="/">
        <div className="flex items-center mb-2 sm:mb-0">
          <img src="/logo.png" alt="Logo" className="h-6 sm:h-8 w-auto mr-2" />
          <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold ${fontBold.className}`}>DressMeUp</h1>
        </div>
        </Link>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <UserButton />
          {credits !== null && (
            credits > 0 ? (
              <Button variant="outline" size="sm" className={`flex items-center gap-1 text-xs sm:text-sm ${fontBody.className}`}>
                <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-primary font-medium">{credits}</span>
                <span className="font-medium hidden sm:inline">Credits</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className={`flex items-center gap-1 text-xs sm:text-sm ${fontBody.className}`} onClick={onCheckout}>
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Buy Credits</span>
              </Button>
            )
          )}
          <Button 
            variant="outline" 
            size="sm"
            className={`px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm ${fontBody.className}`}
            onClick={() => credits > 0 ? runApi() : setAlertInfo({
              title: "Insufficient Credits",
              description: "You do not have enough credits to perform this action. Please purchase more credits."
            })} 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Run Try-On'}
          </Button>
        </div>
      </div>
    </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-8">
        <div className="bg-background rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg sm:text-xl font-bold ${fontBold.className}`}>Select Your Body</h2>
            <Button variant="outline" className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm ${fontBody.className}`}>
              <GalleryThumbnailsIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Gallery
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center h-40 sm:h-64 bg-muted rounded-md">
            <Input
              id="background"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setBackgroundFile, setBackgroundPreview)}
              className="hidden"
            />
            <label htmlFor="background" className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm ${fontBody.className} text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center`} style={{background:"#000F1F"}}>
              <UploadIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Upload Background Image
            </label>
            <p className={`text-muted-foreground text-xs sm:text-sm mt-2 ${fontBody.className}`}>Or select from gallery</p>
          </div>
          <div className="mt-4">
            <h3 className={`text-base sm:text-lg font-bold mb-2 ${fontBold.className}`}>Body Types</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {['Slim', 'Average', 'Curvy'].map((type) => (
                <div
                  key={type}
                  className={`rounded-md p-2 sm:p-4 text-center text-xs sm:text-sm cursor-pointer transition-colors ${
                    selectedBodyType === type 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setSelectedBodyType(type)}
                >
                  <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                  <p>{type}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 sm:mt-8">
            <h2 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-4 ${fontBold.className}`}>Selected Body</h2>
            <div className="flex items-center justify-center h-40 sm:h-64 bg-muted rounded-md">
              <img
                src={backgroundPreview ? backgroundPreview : "/Example.png"}
                alt="Selected Body"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
        <div className="bg-background rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg sm:text-xl font-bold ${fontBold.className}`}>Select a Dress</h2>
            <Button variant="outline" className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm ${fontBody.className}`}>
              <GalleryThumbnailsIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Gallery
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center h-40 sm:h-64 bg-muted rounded-md">
            <Input
              id="garment"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setGarmentFile, setGarmentPreview)}
              className="hidden"
            />
            <label htmlFor="garment" className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm ${fontBody.className} text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center`} style={{background:"#000F1F"}}>
              <UploadIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Upload Garment Image
            </label>
            <p className={`text-muted-foreground text-xs sm:text-sm mt-2 ${fontBody.className}`}>Or select from gallery</p>
          </div>
          <div className="mt-4">
            <h3 className={`text-base sm:text-lg font-bold mb-2 ${fontBold.className}`}>Our Dress Styles</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {predefinedGarments.map((style) => (
                <div
                  key={style.name}
                  className={`bg-muted rounded-md p-2 sm:p-4 text-center text-xs sm:text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${
                    selectedGarmentStyle === style ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleGarmentStyleSelect(style)}
                >
                  <img 
                    src={style.src} 
                    alt={style.name} 
                    className="w-full h-20 sm:h-32 object-cover mb-1 sm:mb-2 rounded-md" 
                  />
                  <p>{style.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 sm:mt-8">
            <h2 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-4 ${fontBold.className}`}>Selected Dress</h2>
            <div className="flex items-center justify-center h-40 sm:h-64 bg-muted rounded-md">
              <img
                src={garmentPreview ? garmentPreview : "/sam.png"}
                alt="Selected Dress"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </main>
      <div className="bg-background rounded-lg shadow-lg p-4 sm:p-6 mx-4 sm:mx-8 mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h2 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-0 ${fontBold.className}`}>Your Virtual Outfit</h2>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm ${fontBody.className}`} onClick={handleRotate}>
              <Rotate3dIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Rotate
            </Button>
            <Button variant="outline" className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm ${fontBody.className}`} onClick={handleZoom}>
              <ZoomInIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Zoom
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 sm:h-96 bg-muted rounded-md">
          <img
            src={results && results.backgroundUrl ? results.backgroundUrl : "/result.png"}
            alt="Virtual Outfit"
            className="max-w-full max-h-full object-contain"
            style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }}
          />
        </div>
      </div>
      {alertInfo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <Alert variant="destructive" className="max-w-xs sm:max-w-md w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">{alertInfo.title}</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">{alertInfo.description}</AlertDescription>
            <Button 
              className="mt-4 text-xs sm:text-sm" 
              onClick={() => setAlertInfo(null)}
              variant="outline"
            >
              Close
            </Button>
          </Alert>
        </div>
      )}
    </div>
  )
}

function GalleryThumbnailsIcon(props) {
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
      <rect width="18" height="14" x="3" y="3" rx="2" />
      <path d="M4 21h1" />
      <path d="M9 21h1" />
      <path d="M14 21h1" />
      <path d="M19 21h1" />
    </svg>
  )
}


function Rotate3dIcon(props) {
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
      <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2" />
      <path d="m15.194 13.707 3.814 1.86-1.86 3.814" />
      <path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4" />
    </svg>
  )
}


function SaveIcon(props) {
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
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  )
}

function DressmeUpIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Dress outline */}
      <path d="M6 3h12l-4 6h-4l-4-6z" />
      <path d="M4 9l8 13l8-13" />
      
      {/* Text (you might need to adjust positioning) */}
      <text x="12" y="22" fontSize="4" textAnchor="middle">DressmeUp</text>
    </svg>
  )
}


function UploadIcon(props) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

function ClockIcon(props) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}


function ZoomInIcon(props) {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="11" x2="11" y1="8" y2="14" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </svg>
  )
}

function UserIcon(props) {
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
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }