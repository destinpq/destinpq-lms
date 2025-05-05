import React, { useState } from 'react';
import SecureTextInput from './SecureTextInput';
import QuizOptionSelector from './QuizOptionSelector';

interface Question {
  id: string;
  question: string;
  questionType: 'single_choice' | 'multiple_choice' | 'matching' | 'descriptive';
  options?: { id: string; text: string }[];
}

interface HomeworkSubmissionProps {
  homeworkId: string;
  title: string;
  questions: Question[];
  onSubmit: (responses: any) => void;
}

/**
 * A component for submitting homework with anti-cheating measures
 */
const HomeworkSubmission: React.FC<HomeworkSubmissionProps> = ({
  homeworkId,
  title,
  questions,
  onSubmit
}) => {
  // Track responses for each question
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  // Track input metadata for plagiarism detection
  const [inputMetadata, setInputMetadata] = useState<Record<string, any>>({});
  
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle text input changes
  const handleTextChange = (questionId: string, value: string, metadata: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    setInputMetadata(prev => ({
      ...prev,
      [questionId]: metadata
    }));
  };

  // Handle option selection changes
  const handleOptionChange = (questionId: string, selected: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: selected
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if all questions are answered
      const unansweredQuestions = questions.filter(q => 
        !responses[q.id] || 
        (Array.isArray(responses[q.id]) && responses[q.id].length === 0) ||
        (typeof responses[q.id] === 'string' && responses[q.id].trim() === '')
      );
      
      if (unansweredQuestions.length > 0) {
        throw new Error(`Please answer all questions before submitting.`);
      }
      
      // Prepare submission data
      const submissionData = {
        homeworkId,
        responses: questions.map(q => ({
          questionId: q.id,
          response: responses[q.id],
          inputMethod: q.questionType === 'descriptive' ? inputMetadata[q.id]?.inputMethod : 'selection',
          timeSpent: inputMetadata[q.id]?.timeSpent || 0
        }))
      };
      
      // Call the onSubmit handler
      await onSubmit(submissionData);
      
      // Show success message
      setSuccess(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your homework.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different question types
  const renderQuestion = (question: Question, index: number) => {
    switch (question.questionType) {
      case 'single_choice':
      case 'multiple_choice':
        return (
          <div className="question-container" key={question.id}>
            <h3 className="question-title">
              {index + 1}. {question.question}
            </h3>
            <QuizOptionSelector
              options={question.options || []}
              selectedOption={responses[question.id]}
              onChange={(value) => handleOptionChange(question.id, value)}
              questionType={question.questionType}
              disabled={isSubmitting || success}
            />
          </div>
        );
        
      case 'descriptive':
        return (
          <div className="question-container" key={question.id}>
            <h3 className="question-title">
              {index + 1}. {question.question}
            </h3>
            <SecureTextInput
              value={responses[question.id] || ''}
              onChange={(value, metadata) => handleTextChange(question.id, value, metadata)}
              placeholder="Type your answer here..."
              rows={6}
              disabled={isSubmitting || success}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="homework-submission">
      <h2 className="homework-title">{title}</h2>
      
      {success ? (
        <div className="success-message">
          <h3>Homework Submitted Successfully!</h3>
          <p>Your responses have been recorded.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.map((question, index) => renderQuestion(question, index))}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting || success}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Homework'}
          </button>
        </form>
      )}
      
      <style jsx>{`
        .homework-submission {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .homework-title {
          margin-bottom: 24px;
          color: #333;
          border-bottom: 2px solid #4CAF50;
          padding-bottom: 10px;
        }
        
        .question-container {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .question-title {
          margin-bottom: 15px;
          font-weight: 500;
        }
        
        .submit-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-button:hover:not(:disabled) {
          background-color: #3e8e41;
        }
        
        .submit-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .success-message {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 20px;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default HomeworkSubmission; 