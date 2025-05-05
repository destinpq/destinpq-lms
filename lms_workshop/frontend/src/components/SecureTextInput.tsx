import React, { useState, useRef, useEffect } from 'react';

interface SecureTextInputProps {
  value: string;
  onChange: (value: string, metadata: { inputMethod: string, timeSpent: number }) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * A secure text input component that prevents copy-paste and tracks typing metrics
 * to prevent plagiarism in homework submissions.
 */
const SecureTextInput: React.FC<SecureTextInputProps> = ({
  value,
  onChange,
  placeholder = 'Type your answer here...',
  rows = 5,
  className = '',
  disabled = false
}) => {
  const [startTime] = useState<number>(Date.now());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Disable paste functionality
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    alert('Pasting text is not allowed for this assignment. Please type your answer manually.');
  };

  // Track text changes with input method
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
    
    onChange(newValue, { 
      inputMethod: 'keyboard', 
      timeSpent 
    });
  };

  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Disable keyboard shortcuts for paste (Ctrl+V, Command+V)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      alert('Keyboard shortcuts for pasting are disabled for this assignment.');
    }
  };

  // Apply focus styles for better UX
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const handleFocus = () => {
        textarea.classList.add('focused');
      };
      
      const handleBlur = () => {
        textarea.classList.remove('focused');
      };
      
      textarea.addEventListener('focus', handleFocus);
      textarea.addEventListener('blur', handleBlur);
      
      return () => {
        textarea.removeEventListener('focus', handleFocus);
        textarea.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  return (
    <div className="secure-input-container">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`secure-textarea ${className}`}
        disabled={disabled}
      />
      <style jsx>{`
        .secure-input-container {
          position: relative;
          width: 100%;
        }
        
        .secure-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #ccc;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
          font-size: inherit;
          line-height: 1.5;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .secure-textarea:focus, .secure-textarea.focused {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
        }
        
        .secure-textarea:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SecureTextInput; 