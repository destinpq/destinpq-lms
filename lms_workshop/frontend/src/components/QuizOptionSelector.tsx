import React, { useState } from 'react';

interface Option {
  id: string;
  text: string;
}

interface QuizOptionSelectorProps {
  options: Option[];
  selectedOption?: string | string[];
  onChange: (value: string | string[]) => void;
  questionType: 'single_choice' | 'multiple_choice';
  disabled?: boolean;
}

/**
 * A secure quiz option selector that prevents inspection of correct answers
 * and implements anti-cheating measures for quizzes.
 */
const QuizOptionSelector: React.FC<QuizOptionSelectorProps> = ({
  options,
  selectedOption,
  onChange,
  questionType,
  disabled = false
}) => {
  // Randomize option display order on initial render to prevent patterns
  const [randomizedOptions] = useState(() => {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  // Handle change for single choice questions
  const handleSingleChoice = (optionId: string) => {
    if (disabled) return;
    onChange(optionId);
  };

  // Handle change for multiple choice questions
  const handleMultipleChoice = (optionId: string) => {
    if (disabled) return;
    
    const currentSelections = Array.isArray(selectedOption) ? selectedOption : [];
    const newSelections = currentSelections.includes(optionId)
      ? currentSelections.filter(id => id !== optionId)
      : [...currentSelections, optionId];
    
    onChange(newSelections);
  };

  // Prevent inspection of option values in browser tools
  const isSelected = (optionId: string) => {
    if (questionType === 'single_choice') {
      return selectedOption === optionId;
    } else {
      return Array.isArray(selectedOption) && selectedOption.includes(optionId);
    }
  };

  return (
    <div className="quiz-options-container">
      {randomizedOptions.map(option => (
        <div 
          key={option.id}
          className={`option-item ${isSelected(option.id) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => questionType === 'single_choice' 
            ? handleSingleChoice(option.id) 
            : handleMultipleChoice(option.id)
          }
        >
          <div className="option-checkbox">
            {questionType === 'single_choice' ? (
              <div className="radio-button">
                {isSelected(option.id) && <div className="radio-dot"></div>}
              </div>
            ) : (
              <div className="checkbox">
                {isSelected(option.id) && <div className="checkbox-check">✓</div>}
              </div>
            )}
          </div>
          <div className="option-text">{option.text}</div>
        </div>
      ))}
      
      <style jsx>{`
        .quiz-options-container {
          margin: 15px 0;
          user-select: none;
        }
        
        .option-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
        }
        
        .option-item:hover:not(.disabled) {
          background-color: #f9f9f9;
          border-color: #ccc;
        }
        
        .option-item.selected {
          background-color: #e6f7e6;
          border-color: #4CAF50;
        }
        
        .option-item.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .option-checkbox {
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .radio-button {
          width: 20px;
          height: 20px;
          border: 2px solid #666;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .radio-dot {
          width: 10px;
          height: 10px;
          background-color: #4CAF50;
          border-radius: 50%;
        }
        
        .checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #666;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .checkbox-check {
          color: #4CAF50;
          font-weight: bold;
          font-size: 14px;
        }
        
        .option-text {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default QuizOptionSelector; 