import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs"
import { Bricolage_Grotesque } from 'next/font/google'
import { Space_Mono } from 'next/font/google'

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
  

export default function VirtualTryOn() {
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [garmentFile, setGarmentFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [garmentPreview, setGarmentPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    }
  };

  const runApi = async () => {
    setError(null);
    setResults(null);
    setDebugInfo(null);
    setIsLoading(true);

    if (!backgroundFile || !garmentFile) {
      setError("Please select both background and garment images.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('background', backgroundFile);
    formData.append('garment', garmentFile);

    try {
      console.log("Sending request to /api/tryon");
      const response = await fetch('/api/tryon', {
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
      } else {
        console.log('Unexpected result format:', data);
        setError('Received an unexpected result format from the server.');
        setDebugInfo(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
    <header className="text-primary-foreground py-4 px-6 flex items-center justify-between" style={{background:"#265973"}}>
      <h1 className={`text-2xl ${fontBold}`}>Virtual Try-On</h1>
      <div className="flex items-center gap-4">
        <UserButton />
        <Button variant="outline" className={`px-4 py-2 rounded-md ${fontBody}`} onClick={runApi} disabled={isLoading}>
        
          {isLoading ? 'Processing...' : 'Run Virtual Try-On'}
        </Button>
      </div>
    </header>

    <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <Card className="bg-background rounded-lg shadow-lg p-6">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className={`text-xl ${fontBold}`}>Select Your Body</CardTitle>
            <Button variant="outline" className={`px-4 py-2 rounded-md ${fontBody}`}>
             
              Gallery
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-md">
            <Input
              id="background"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setBackgroundFile, setBackgroundPreview)}
              className="hidden"
            />
            <label htmlFor="background" className={`px-4 py-2 rounded-md ${fontBody} cursor-pointer flex items-center`}>
             
              Upload Image
            </label>
            <p className={`text-muted-foreground text-sm mt-2 ${fontBody}`}>Or select from gallery</p>
          </div>
          {backgroundPreview && (
            <div className="mt-4">
              <img src={backgroundPreview} alt="Background Preview" className="max-w-full h-auto rounded-md" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-background rounded-lg shadow-lg p-6">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className={`text-xl ${fontBold}`}>Select a Dress</CardTitle>
            <Button variant="outline" className={`px-4 py-2 rounded-md ${fontBody}`}>
              
              Gallery
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-md">
            <Input
              id="garment"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setGarmentFile, setGarmentPreview)}
              className="hidden"
            />
            <label htmlFor="garment" className={`px-4 py-2 rounded-md ${fontBody} cursor-pointer flex items-center`}>
             
              Upload Image
            </label>
            <p className={`text-muted-foreground text-sm mt-2 ${fontBody}`}>Or select from gallery</p>
          </div>
          {garmentPreview && (
            <div className="mt-4">
              <img src={garmentPreview} alt="Garment Preview" className="max-w-full h-auto rounded-md" />
            </div>
          )}
        </CardContent>
      </Card>
    </main>

    {error && (
      <Alert variant="destructive" className="mx-8 mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    {debugInfo && (
      <Alert className="mx-8 mb-4">
        <AlertTitle>Debug Information</AlertTitle>
        <AlertDescription>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </AlertDescription>
      </Alert>
    )}

    {results && (
      <Card className="bg-background rounded-lg shadow-lg p-6 mx-8 mb-8">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className={`text-xl ${fontBold}`}>Your Virtual Outfit</CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="outline" className={`px-4 py-2 rounded-md ${fontBody}`}>
                
                Rotate
              </Button>
              <Button variant="outline" className={`px-4 py-2 rounded-md ${fontBody}`}>
                
                Zoom
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 bg-muted rounded-md">
            <img src={results.backgroundUrl} alt="Virtual Outfit" className="max-w-full max-h-full object-contain" />
          </div>
        </CardContent>
      </Card>
    )}

    {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    )}
  </div>
  );
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


function SettingsIcon(props) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
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