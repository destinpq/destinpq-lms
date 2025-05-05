'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import HomeworkSubmission from '@/components/HomeworkSubmission';

// Example homework data - in a real app, you would fetch this from API
const exampleHomework = {
  id: "1",
  title: "Psychology Concepts Quiz",
  questions: [
    {
      id: "q1",
      question: "Who is considered the founder of psychoanalysis?",
      questionType: "single_choice",
      options: [
        { id: "opt1", text: "Sigmund Freud" },
        { id: "opt2", text: "Carl Jung" },
        { id: "opt3", text: "B.F. Skinner" },
        { id: "opt4", text: "Ivan Pavlov" }
      ]
    },
    {
      id: "q2",
      question: "Which of the following are branches of psychology? (Select all that apply)",
      questionType: "multiple_choice",
      options: [
        { id: "opt1", text: "Clinical Psychology" },
        { id: "opt2", text: "Cognitive Psychology" },
        { id: "opt3", text: "Medieval Psychology" },
        { id: "opt4", text: "Developmental Psychology" }
      ]
    },
    {
      id: "q3",
      question: "Explain how working memory differs from long-term memory, and describe one experiment that demonstrates this difference.",
      questionType: "descriptive"
    }
  ]
};

export default function HomeworkPage() {
  const params = useParams();
  const homeworkId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [homework, setHomework] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulate API fetch
  useEffect(() => {
    // In a real app, you would fetch from API with the ID
    setHomework(exampleHomework);
    setIsLoading(false);
  }, [homeworkId]);

  // Handle homework submission
  const handleSubmit = async (data: any) => {
    console.log('Submitting homework data:', data);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful submission
        console.log('Homework submitted successfully');
        resolve(true);
      }, 1500);
    });
  };

  if (isLoading) {
    return <div className="loading">Loading homework...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!homework) {
    return <div className="not-found">Homework not found</div>;
  }

  return (
    <div className="homework-page">
      <div className="back-link">
        <a href="/student/dashboard">← Back to Dashboard</a>
      </div>
      <HomeworkSubmission
        homeworkId={homework.id}
        title={homework.title}
        questions={homework.questions}
        onSubmit={handleSubmit}
      />
      <div className="warning-notice">
        <p><strong>Important:</strong> Plagiarism detection is enabled for this homework. 
        All submissions are checked for originality. Copy-pasting is prohibited.</p>
      </div>
    
      <style jsx>{`
        .homework-page {
          padding: 20px;
        }
        
        .back-link {
          margin-bottom: 20px;
        }
        
        .back-link a {
          color: #4CAF50;
          text-decoration: none;
        }
        
        .back-link a:hover {
          text-decoration: underline;
        }
        
        .loading, .error, .not-found {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }
        
        .error {
          color: #c62828;
        }
        
        .warning-notice {
          background-color: #fff8e1;
          border-left: 4px solid #ffc107;
          padding: 16px;
          margin-top: 30px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
} 