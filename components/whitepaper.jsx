import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { chatSession } from '@/utils/GeminiAIModal';
import { Printer, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function WhitepaperGenerator() {
  const [projectName, setProjectName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [blockchain, setBlockchain] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solution, setSolution] = useState('');
  const [tokenomics, setTokenomics] = useState('');
  const [generatedWhitepaper, setGeneratedWhitepaper] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const prompt = `Generate a professional cryptocurrency whitepaper for ${projectName} with the following details:
      - Project Name: ${projectName}
      - Token Symbol: ${tokenSymbol}
      - Blockchain: ${blockchain}
      - Problem Statement: ${problemStatement}
      - Solution: ${solution}
      - Tokenomics: ${tokenomics}

      Please format the whitepaper with the following sections, using Markdown syntax for proper formatting:
      # ${projectName.toUpperCase()} WHITEPAPER
      
      Date: ${new Date().toLocaleDateString()}

      ## Executive Summary

      ## Introduction

      ## Problem Statement

      ## Solution

      ## Technology

      ## Token Utility

      ## Tokenomics

      ## Roadmap

      ## Team

      ## Conclusion

      Ensure all section headings are properly formatted as Markdown headings (##). The whitepaper should be comprehensive and ready for presentation to potential investors.`;

      const result = await chatSession.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      setGeneratedWhitepaper(text);
    } catch (error) {
      console.error('Error generating whitepaper:', error);
      setGeneratedWhitepaper('An error occurred while generating the whitepaper. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${projectName} Whitepaper</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
            }
            h1 { font-size: 28px; color: #2c3e50; font-weight: 700; }
            h2 { font-size: 22px; color: #34495e; font-weight: 600; }
            p { text-align: justify; }
          </style>
        </head>
        <body>
          ${generatedWhitepaper}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container mx-auto p-8 bg-gradient-to-br from-blue-50 to-teal-50 min-h-screen">
      <h1 className="text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-600 to-teal-400 text-transparent bg-clip-text">
        Cryptocurrency Whitepaper Generator
      </h1>
      <div className="bg-white rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="projectName" className="text-lg font-semibold text-gray-700">Project Name</Label>
              <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter your project name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="tokenSymbol" className="text-lg font-semibold text-gray-700">Token Symbol</Label>
              <Input id="tokenSymbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} placeholder="Enter token symbol" className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="blockchain" className="text-lg font-semibold text-gray-700">Blockchain</Label>
            <Input id="blockchain" value={blockchain} onChange={(e) => setBlockchain(e.target.value)} placeholder="Enter blockchain (e.g., Ethereum, Binance Smart Chain)" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="problemStatement" className="text-lg font-semibold text-gray-700">Problem Statement</Label>
            <Textarea id="problemStatement" value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="Describe the problem your project aims to solve" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="solution" className="text-lg font-semibold text-gray-700">Solution</Label>
            <Textarea id="solution" value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Explain how your project solves the problem" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="tokenomics" className="text-lg font-semibold text-gray-700">Tokenomics</Label>
            <Textarea id="tokenomics" value={tokenomics} onChange={(e) => setTokenomics(e.target.value)} placeholder="Describe your token distribution and economics" className="mt-1" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-bold py-3 rounded-lg transition duration-300">
            {isLoading ? 'Generating...' : 'Generate Whitepaper'}
          </Button>
        </form>
      </div>
      {generatedWhitepaper && (
        <div className="mt-12 bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Generated Whitepaper</h2>
            <Button onClick={handlePrint} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">
              <Printer size={20} />
              Print Whitepaper
            </Button>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown>{generatedWhitepaper}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}