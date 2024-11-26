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
import { BulkEditQuestions } from '@/components/questions/bulk-edit';

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
        if (!results.data || results.data.length === 0) {
          toast.error('The CSV file appears to be empty');
          setFile(null);
          return;
        }

        // Get headers from the first row
        const rawHeaders = results.data[0];
        if (!Array.isArray(rawHeaders)) {
          toast.error('Could not read CSV headers');
          setFile(null);
          return;
        }

        // Convert headers to strings and clean them
        const headers = rawHeaders.map(h => String(h).trim());
        console.log('Found headers:', headers); // Debug log

        const requiredHeaders = [
          'Question',
          'Correct Answer',
          'Incorrect Answer 1',
          'Incorrect Answer 2',
          'Incorrect Answer 3',
          'Difficulty',
          'Status',
          'form',
          'subject'
        ];

        // Case-insensitive header check
        const headerMap = headers.reduce((acc: Record<string, number>, header: string, index: number) => {
          acc[header.toLowerCase()] = index;
          return acc;
        }, {});

        const missingHeaders = requiredHeaders.filter(
          header => !headers.some(h => h.toLowerCase() === header.toLowerCase())
        );

        if (missingHeaders.length > 0) {
          toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
          setFile(null);
          return;
        }

        // Filter out empty rows and get preview data
        const previewData = results.data
          .slice(1, 6)
          .filter((row: any[]) => row.some(cell => cell && cell.trim()));

        setPreview(previewData);
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        toast.error(`Error reading CSV file: ${error.message}`);
        setFile(null);
      },
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const results = await new Promise<any>((resolve, reject) => {
        Papa.parse(file, {
          complete: (results) => {
            if (!results.data || results.data.length < 2) {
              reject(new Error('No data found in CSV file'));
              return;
            }
            resolve(results);
          },
          error: (error) => reject(error),
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (header) => header.trim(),
        });
      });

      // Convert the data array to an array of objects with the correct structure
      const validQuestions = results.data
        .filter((row: any) => {
          return (
            row.Question?.trim() &&
            row['Correct Answer']?.trim() &&
            row['Incorrect Answer 1']?.trim() &&
            row['Incorrect Answer 2']?.trim() &&
            row['Incorrect Answer 3']?.trim()
          );
        })
        .map((row: any) => ({
          question: row.Question.trim(),
          correctAnswer: row['Correct Answer'].trim(),
          incorrectAnswers: [
            row['Incorrect Answer 1'].trim(),
            row['Incorrect Answer 2'].trim(),
            row['Incorrect Answer 3'].trim()
          ],
          difficulty: (row.Difficulty || 'medium').toLowerCase(),
          status: (row.Status || 'draft').toLowerCase(),
          form: (row.form || 'form1').toLowerCase(),
          subject: (row.subject || 'general').toLowerCase(),
        }));

      if (validQuestions.length === 0) {
        toast.error('No valid questions found in the file');
        setLoading(false);
        return;
      }

      // Upload questions to Firestore
      const questionsRef = collection(db, 'questions');
      const uploadPromises = validQuestions.map((questionData) => {
        return addDoc(questionsRef, {
          ...questionData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid
        });
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
      toast.error(error instanceof Error ? error.message : 'Failed to upload questions');
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
    <div className="container py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Upload Questions</h2>
        <p className="text-muted-foreground">
          Upload questions in bulk using CSV files.
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload New Questions</CardTitle>
            <CardDescription>
              Upload new questions using our CSV template.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                              <th className="text-left py-2">Form</th>
                              <th className="text-left py-2">Subject</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preview.map((row, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2">{row.Question}</td>
                                <td className="py-2">{row['Correct Answer']}</td>
                                <td className="py-2">{row.Difficulty || 'medium'}</td>
                                <td className="py-2">{row.Status || 'draft'}</td>
                                <td className="py-2">{row.form || 'form1'}</td>
                                <td className="py-2">{row.subject || 'general'}</td>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Edit Existing Questions</CardTitle>
            <CardDescription>
              Download, modify, and re-upload existing questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BulkEditQuestions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
