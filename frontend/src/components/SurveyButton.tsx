import React, { useState } from 'react';
import { Button, Fab, Tooltip } from '@mui/material';
import { RateReview, Feedback } from '@mui/icons-material';
import SatisfactionSurvey from './SatisfactionSurvey';

interface SurveyButtonProps {
  variant?: 'button' | 'fab';
  position?: 'fixed' | 'inline';
  className?: string;
}

const SurveyButton: React.FC<SurveyButtonProps> = ({
  variant = 'button',
  position = 'inline',
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (data: any) => {
    // Here you can send the survey data to your backend
    console.log('Survey submitted:', data);

    // Example: Send to API
    // fetch('/api/survey', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
  };

  if (variant === 'fab') {
    return (
      <>
        <Tooltip title="แบบประเมินความพึงพอใจ" placement="left">
          <Fab
            color="primary"
            aria-label="แบบประเมิน"
            onClick={handleOpen}
            className={`${position === 'fixed' ? 'fixed bottom-4 right-4' : ''} ${className}`}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            }}
          >
            <Feedback />
          </Fab>
        </Tooltip>

        <SatisfactionSurvey
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<RateReview />}
        onClick={handleOpen}
        className={`${className}`}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        }}
      >
        แบบประเมินความพึงพอใจ
      </Button>

      <SatisfactionSurvey
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default SurveyButton;
