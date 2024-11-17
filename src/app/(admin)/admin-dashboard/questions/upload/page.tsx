'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Download, Upload } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { logActivity } from '@/lib/firebase/activity';
import { auth } from '@/lib/firebase/auth';
import Papa from 'papaparse';

export default function BulkUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);

    // Preview the file contents
    Papa.parse(selectedFile, {
      complete: (results) => {
        const headers = results.data[0] as string[];
        const expectedHeaders = [
          'Question',
          'Correct Answer',
          'Incorrect Answer 1',
          'Incorrect Answer 2',
          'Incorrect Answer 3',
          'Difficulty',
          'Status'
        ];

        // Validate headers
        if (!expectedHeaders.every(header => headers.includes(header))) {
          toast.error('Invalid CSV format. Please use the template provided.');
          setFile(null);
          return;
        }

        // Show preview of first 5 rows
        setPreview(results.data.slice(1, 6));
      },
      header: true
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const results = await new Promise<any>((resolve) => {
        Papa.parse(file, {
          complete: (results) => resolve(results.data),
          header: true
        });
      });

      // Filter out empty rows and validate
      const validQuestions = results.filter((row: any) => {
        return (
          row.Question &&
          row['Correct Answer'] &&
          row['Incorrect Answer 1'] &&
          row['Incorrect Answer 2'] &&
          row['Incorrect Answer 3']
        );
      });

      if (validQuestions.length === 0) {
        toast.error('No valid questions found in the file');
        return;
      }

      // Upload questions to Firestore
      const questionsRef = collection(db, 'questions');
      const uploadPromises = validQuestions.map((row: any) => {
        const questionData = {
          question: row.Question,
          correctAnswer: row['Correct Answer'],
          incorrectAnswers: [
            row['Incorrect Answer 1'],
            row['Incorrect Answer 2'],
            row['Incorrect Answer 3']
          ],
          difficulty: (row.Difficulty || 'medium').toLowerCase(),
          status: (row.Status || 'draft').toLowerCase(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid
        };
        return addDoc(questionsRef, questionData);
      });

      await Promise.all(uploadPromises);

      await logActivity({
        type: 'bulk_upload',
        description: `Uploaded ${validQuestions.length} questions`,
        userId: auth.currentUser?.uid || '',
        metadata: { count: validQuestions.length }
      });

      toast.success(`Successfully uploaded ${validQuestions.length} questions`);
      router.push('/admin-dashboard/questions');
    } catch (error) {
      console.error('Error uploading questions:', error);
      toast.error('Failed to upload questions');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/question_template.csv';
    link.download = 'question_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Questions</h1>
        <p className="text-muted-foreground">
          Upload multiple questions using a CSV file
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Template Download */}
          <div>
            <h2 className="text-lg font-semibold mb-2">1. Download Template</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Start by downloading our CSV template. The template includes example questions and the correct format.
            </p>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <h2 className="text-lg font-semibold mb-2">2. Upload Your File</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Fill out the template and upload your CSV file here. Make sure to follow the format exactly.
            </p>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="max-w-md"
              />
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {loading ? 'Uploading...' : 'Upload Questions'}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Question</th>
                      <th className="text-left py-2">Correct Answer</th>
                      <th className="text-left py-2">Difficulty</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{row.Question}</td>
                        <td className="py-2">{row['Correct Answer']}</td>
                        <td className="py-2">{row.Difficulty || 'medium'}</td>
                        <td className="py-2">{row.Status || 'draft'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Showing first 5 questions from your file
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
