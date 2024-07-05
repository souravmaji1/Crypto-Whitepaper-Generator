import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { chatSession } from '@/utils/GeminiAIModal'; // Adjust the import path as needed
import { Printer } from 'lucide-react';

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

      Please format the whitepaper with the following sections:
      1. Executive Summary
      2. Introduction
      3. Problem Statement
      4. Solution
      5. Technology
      6. Token Utility
      7. Tokenomics
      8. Roadmap
      9. Team
      10. Conclusion

      The whitepaper should be comprehensive and ready for presentation to potential investors.`;

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
    const printContent = `
      <html>
        <head>
          <title>${projectName} Whitepaper</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
            
            body {
              font-family: 'Roboto', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              background-color: #f9f9f9;
            }
            
            .whitepaper {
              background-color: white;
              padding: 60px;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            
            h1 {
              color: #2c3e50;
              font-size: 28px;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 10px;
            }
            
            .whitepaper-info {
              font-size: 14px;
              color: #7f8c8d;
            }
            
            .whitepaper-content {
              white-space: pre-wrap;
              text-align: justify;
            }
            
            @media print {
              body {
                background-color: white;
              }
              .whitepaper {
                box-shadow: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="whitepaper">
            <div class="header">
              <h1>${projectName} Whitepaper</h1>
              <div class="whitepaper-info">
                Date: ${new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div class="whitepaper-content">${generatedWhitepaper}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cryptocurrency Whitepaper Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter your project name" />
        </div>
        <div>
          <Label htmlFor="tokenSymbol">Token Symbol</Label>
          <Input id="tokenSymbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} placeholder="Enter token symbol" />
        </div>
        <div>
          <Label htmlFor="blockchain">Blockchain</Label>
          <Input id="blockchain" value={blockchain} onChange={(e) => setBlockchain(e.target.value)} placeholder="Enter blockchain (e.g., Ethereum, Binance Smart Chain)" />
        </div>
        <div>
          <Label htmlFor="problemStatement">Problem Statement</Label>
          <Textarea id="problemStatement" value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="Describe the problem your project aims to solve" />
        </div>
        <div>
          <Label htmlFor="solution">Solution</Label>
          <Textarea id="solution" value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Explain how your project solves the problem" />
        </div>
        <div>
          <Label htmlFor="tokenomics">Tokenomics</Label>
          <Textarea id="tokenomics" value={tokenomics} onChange={(e) => setTokenomics(e.target.value)} placeholder="Describe your token distribution and economics" />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Whitepaper'}
        </Button>
      </form>
      {generatedWhitepaper && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Generated Whitepaper:</h2>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer size={16} />
              Print Whitepaper
            </Button>
          </div>
          <div className="border p-4 rounded-md whitespace-pre-wrap font-serif">{generatedWhitepaper}</div>
        </div>
      )}
    </div>
  );
}