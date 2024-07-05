import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { chatSession } from '@/utils/GeminiAIModal'; // Adjust the import path as needed
import { Printer } from 'lucide-react';

export default function DocumentGenerator() {
  const [documentType, setDocumentType] = useState('');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customDocumentType, setCustomDocumentType] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const prompt = `Generate a professional ${documentType} with the following details:
      - Party A: ${partyA}
      - Party B: ${partyB}
      - Effective Date: ${effectiveDate}
      - Purpose: ${purpose}
      - Additional Terms: ${additionalTerms}

      Please format the document with the following sections:
      1. Introduction (including parties and effective date)
      2. Definitions
      3. Confidentiality Obligations
      4. Permitted Use
      5. Term and Termination
      6. Return of Confidential Information
      7. Remedies
      8. Governing Law
      9. Entire Agreement
      10. Signatures

      The document should be complete and ready for signing.`;

      const result = await chatSession.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      setGeneratedDocument(text);
    } catch (error) {
      console.error('Error generating document:', error);
      setGeneratedDocument('An error occurred while generating the document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
<head>
    <title>${documentType.replace('-', ' ').toUpperCase()}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap');
        
        body {
            font-family: 'Merriweather', serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background-color: #f9f9f9;
        }
        
        .document {
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
            font-size: 24px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        
        .document-info {
            font-size: 14px;
            color: #7f8c8d;
        }
        
        .document-content {
            white-space: pre-wrap;
            text-align: justify;
        }
        
        .signature-section {
            margin-top: 60px;
        }
        
        .signature-line {
            border-top: 1px solid #bdc3c7;
            width: 50%;
            margin: 20px 0;
        }
        
        .signature-text {
            font-size: 14px;
            margin-top: 5px;
        }
        
        @media print {
            body {
                background-color: white;
            }
            .document {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <h1>${documentType.replace('-', ' ').toUpperCase()}</h1>
            <div class="document-info">
                Date: ${new Date().toLocaleDateString()}
            </div>
        </div>
        
        <div class="document-content">${generatedDocument}</div>
        
        <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-text">Signature: ________________________</div>
            <div class="signature-text">Name: ___________________________</div>
            <div class="signature-text">Date: ____________________________</div>
        </div>
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
      <h1 className="text-2xl font-bold mb-4">Professional Document Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="documentType">Document Type</Label>
          <Select onValueChange={(value) => setDocumentType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non-disclosure-agreement">Non-Disclosure Agreement (NDA)</SelectItem>
              <SelectItem value="freelancer-agreement">Freelancer Agreement</SelectItem>
              <SelectItem value="employment-contract">Employment Contract</SelectItem>
              <SelectItem value="custom">Custom Document</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {documentType === 'custom' && (
          <div>
            <Label htmlFor="customDocumentType">Custom Document Type</Label>
            <Input 
              id="customDocumentType" 
              value={customDocumentType} 
              onChange={(e) => setCustomDocumentType(e.target.value)} 
              placeholder="Enter custom document type"
            />
          </div>
        )}
        <div>
          <Label htmlFor="partyA">Party A (Your Company)</Label>
          <Input id="partyA" value={partyA} onChange={(e) => setPartyA(e.target.value)} placeholder="Enter your company name" />
        </div>
        <div>
          <Label htmlFor="partyB">Party B (Other Party)</Label>
          <Input id="partyB" value={partyB} onChange={(e) => setPartyB(e.target.value)} placeholder="Enter other party's name" />
        </div>
        <div>
          <Label htmlFor="effectiveDate">Effective Date</Label>
          <Input id="effectiveDate" type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="purpose">Purpose of Agreement</Label>
          <Textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Enter the purpose of this agreement" />
        </div>
        <div>
          <Label htmlFor="additionalTerms">Additional Terms (Optional)</Label>
          <Textarea id="additionalTerms" value={additionalTerms} onChange={(e) => setAdditionalTerms(e.target.value)} placeholder="Enter any additional terms or special clauses" />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Document'}
        </Button>
      </form>
      {generatedDocument && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Generated Document:</h2>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer size={16} />
              Print Document
            </Button>
          </div>
          <div className="border p-4 rounded-md whitespace-pre-wrap font-serif">{generatedDocument}</div>
        </div>
      )}
    </div>
  );
}