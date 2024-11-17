'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { bulkCreateQuestions } from '@/lib/questions/firebase';
import { ExcelParser, type QuestionInput } from '@/lib/questions/excel-parser';

interface UploadStatus {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

export function BulkQuestionUpload() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<UploadStatus>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [],
  });

  const downloadTemplate = () => {
    // Create template structure
    const template = [
      {
        subject: 'Mathematics',
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        difficulty: 'Medium',
        question: 'Solve for x: 2x + 3 = 7',
        correctAnswer: '2',
        option1: '1',
        option2: '2',
        option3: '3',
        option4: '4',
        explanation: 'Subtract 3 from both sides: 2x = 4, then divide by 2: x = 2',
        tags: 'algebra,equations,linear',
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);

    // Add validation and formatting
    ws['!cols'] = [
      { width: 15 }, // subject
      { width: 15 }, // topic
      { width: 15 }, // subtopic
      { width: 10 }, // difficulty
      { width: 40 }, // question
      { width: 15 }, // correctAnswer
      { width: 15 }, // option1
      { width: 15 }, // option2
      { width: 15 }, // option3
      { width: 15 }, // option4
      { width: 40 }, // explanation
      { width: 20 }, // tags
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Questions Template');

    // Save file
    XLSX.writeFile(wb, 'question_template.xlsx');
  };

  const processExcelFile = async (file: File) => {
    setUploading(true);
    try {
      const parseResult = await ExcelParser.parseExcelFile(file);
      
      const newStatus: UploadStatus = {
        total: parseResult.totalRows,
        processed: parseResult.totalRows,
        successful: parseResult.validQuestions.length,
        failed: parseResult.errors.length,
        errors: parseResult.errors.map(
          (error) => `Row ${error.row}: ${error.errors.join(', ')}`
        ),
      };

      if (parseResult.validQuestions.length > 0) {
        await bulkCreateQuestions(parseResult.validQuestions);
      }

      setStatus(newStatus);
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        errors: [...prev.errors, `File processing error: ${error.message}`],
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      ) {
        processExcelFile(file);
      } else {
        setStatus((prev) => ({
          ...prev,
          errors: ['Please upload an Excel file (.xlsx or .xls)'],
        }));
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Bulk Question Upload</h2>
        
        <div className="space-y-4">
          <div>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button disabled={uploading} className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={(status.processed / status.total) * 100} />
              <p className="text-sm text-gray-500">
                Processing: {status.processed} / {status.total}
              </p>
            </div>
          )}

          {status.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Upload Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {status.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {status.successful > 0 && (
            <Alert>
              <AlertTitle>Upload Complete</AlertTitle>
              <AlertDescription>
                Successfully uploaded {status.successful} questions.
                {status.failed > 0 && ` Failed to upload ${status.failed} questions.`}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}
