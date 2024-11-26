import { useState } from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export function BulkEditQuestions() {
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Download current questions as CSV
  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      // Get all questions from Firestore
      const questionsRef = collection(db, 'questions');
      const querySnapshot = await getDocs(query(questionsRef));
      
      // Transform questions to CSV format
      const questions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Include document ID for updating later
          Question: data.question,
          'Correct Answer': data.correctAnswer,
          'Incorrect Answer 1': data.incorrectAnswers[0],
          'Incorrect Answer 2': data.incorrectAnswers[1],
          'Incorrect Answer 3': data.incorrectAnswers[2],
          Difficulty: data.difficulty,
          Status: data.status,
          form: data.form,
          subject: data.subject
        };
      });

      // Convert to CSV
      const csv = Papa.unparse(questions);
      
      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'questions_for_edit.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success('Questions downloaded successfully');
    } catch (error) {
      console.error('Error downloading questions:', error);
      toast.error('Failed to download questions');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Handle file upload and update questions
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setLoading(true);
    try {
      const results = await new Promise<any>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: 'greedy',
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        });
      });

      // Validate the CSV structure
      const requiredFields = ['id', 'Question', 'Correct Answer', 'Incorrect Answer 1', 
        'Incorrect Answer 2', 'Incorrect Answer 3', 'Difficulty', 'Status', 'form', 'subject'];
      
      const missingFields = requiredFields.filter(field => 
        !Object.keys(results[0] || {}).includes(field)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Update questions in Firestore
      const updatePromises = results.map(async (row: any) => {
        if (!row.id) return; // Skip if no ID

        const questionRef = doc(db, 'questions', row.id);
        return updateDoc(questionRef, {
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
          updatedAt: new Date()
        });
      });

      await Promise.all(updatePromises);
      toast.success(`Successfully updated ${results.length} questions`);
    } catch (error) {
      console.error('Error updating questions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update questions');
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold">Bulk Edit Questions</h3>
        <p className="text-sm text-gray-600">
          Download existing questions, modify them in a spreadsheet, and upload the changes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleDownload} 
          disabled={downloadLoading}
          variant="outline"
        >
          {downloadLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            'Download Questions'
          )}
        </Button>

        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button disabled={loading} variant="default">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Upload Changes'
            )}
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Click "Download Questions" to get the current questions</li>
          <li>Open the CSV file in your preferred spreadsheet software</li>
          <li>Make your changes (do not modify the ID column)</li>
          <li>Save as CSV and upload using the "Upload Changes" button</li>
        </ol>
      </div>
    </div>
  );
}
