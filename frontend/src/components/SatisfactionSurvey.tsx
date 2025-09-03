import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Typography,
  Box,
  Paper,
  Alert,
  Snackbar,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Star,
  ThumbUp,
  ThumbDown,
  Send,
  Close,
  EmojiEmotions,
  Speed,
  Security,
  Support,
  Design,
  ContentPaste
} from '@mui/icons-material';

interface SatisfactionSurveyProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: SurveyData) => void;
}

interface SurveyData {
  overallSatisfaction: number;
  easeOfUse: number;
  responseSpeed: number;
  accuracy: number;
  helpfulness: number;
  userInterface: number;
  features: string[];
  improvements: string;
  recommendToOthers: string;
  additionalComments: string;
  timestamp: Date;
}

const SatisfactionSurvey: React.FC<SatisfactionSurveyProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    overallSatisfaction: 0,
    easeOfUse: 0,
    responseSpeed: 0,
    accuracy: 0,
    helpfulness: 0,
    userInterface: 0,
    features: [],
    improvements: '',
    recommendToOthers: '',
    additionalComments: '',
    timestamp: new Date()
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const featureOptions = [
    { value: 'chat_interface', label: 'ส่วนติดต่อผู้ใช้แชท', icon: <Design /> },
    { value: 'response_speed', label: 'ความเร็วในการตอบสนอง', icon: <Speed /> },
    { value: 'accuracy', label: 'ความแม่นยำของข้อมูล', icon: <ContentPaste /> },
    { value: 'security', label: 'ความปลอดภัย', icon: <Security /> },
    { value: 'support', label: 'การสนับสนุน', icon: <Support /> },
    { value: 'user_experience', label: 'ประสบการณ์การใช้งาน', icon: <EmojiEmotions /> }
  ];

  const handleRatingChange = (field: keyof SurveyData, value: number) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (feature: string) => {
    setSurveyData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleTextChange = (field: keyof SurveyData, value: string) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (surveyData.overallSatisfaction === 0) {
        setShowError(true);
        return;
      }

      // Here you would typically send the data to your backend
      console.log('Survey Data:', surveyData);
      
      if (onSubmit) {
        onSubmit(surveyData);
      }

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setSurveyData({
          overallSatisfaction: 0,
          easeOfUse: 0,
          responseSpeed: 0,
          accuracy: 0,
          helpfulness: 0,
          userInterface: 0,
          features: [],
          improvements: '',
          recommendToOthers: '',
          additionalComments: '',
          timestamp: new Date()
        });
      }, 2000);
    } catch (error) {
      setShowError(true);
    }
  };

  const getRatingLabel = (value: number) => {
    const labels = {
      1: 'ไม่พอใจเลย',
      2: 'ไม่พอใจ',
      3: 'พอใจปานกลาง',
      4: 'พอใจ',
      5: 'พอใจมาก'
    };
    return labels[value as keyof typeof labels] || '';
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }
        }}
      >
        <DialogTitle className="text-white text-center">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" className="font-bold">
              แบบประเมินความพึงพอใจ LannaFinChat
            </Typography>
            <IconButton onClick={onClose} className="text-white">
              <Close />
            </IconButton>
          </Box>
          <Typography variant="body2" className="mt-2 opacity-90">
            กรุณาให้คะแนนและความคิดเห็นเพื่อปรับปรุงบริการของเรา
          </Typography>
        </DialogTitle>

        <DialogContent className="bg-white">
          <Box className="space-y-6 p-4">
            {/* Overall Satisfaction */}
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h6" className="mb-4 text-gray-800 font-semibold">
                <Star className="mr-2 text-yellow-500" />
                ความพึงพอใจโดยรวม
              </Typography>
              <Box className="flex items-center justify-center mb-2">
                <Rating
                  value={surveyData.overallSatisfaction}
                  onChange={(_, value) => handleRatingChange('overallSatisfaction', value || 0)}
                  size="large"
                  className="text-3xl"
                />
              </Box>
              {surveyData.overallSatisfaction > 0 && (
                <Typography variant="body2" className="text-center text-gray-600">
                  {getRatingLabel(surveyData.overallSatisfaction)}
                </Typography>
              )}
            </Paper>

            {/* Detailed Ratings */}
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h6" className="mb-4 text-gray-800 font-semibold">
                การประเมินรายละเอียด
              </Typography>
              <Box className="space-y-4">
                {[
                  { field: 'easeOfUse', label: 'ความง่ายในการใช้งาน', icon: <EmojiEmotions /> },
                  { field: 'responseSpeed', label: 'ความเร็วในการตอบสนอง', icon: <Speed /> },
                  { field: 'accuracy', label: 'ความแม่นยำของข้อมูล', icon: <ContentPaste /> },
                  { field: 'helpfulness', label: 'ประโยชน์ที่ได้รับ', icon: <Support /> },
                  { field: 'userInterface', label: 'การออกแบบส่วนติดต่อผู้ใช้', icon: <Design /> }
                ].map(({ field, label, icon }) => (
                  <Box key={field} className="flex items-center justify-between">
                    <Box className="flex items-center">
                      <span className="mr-2 text-gray-600">{icon}</span>
                      <Typography variant="body1" className="text-gray-700">
                        {label}
                      </Typography>
                    </Box>
                    <Rating
                      value={surveyData[field as keyof SurveyData] as number}
                      onChange={(_, value) => handleRatingChange(field as keyof SurveyData, value || 0)}
                      size="small"
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Features */}
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h6" className="mb-4 text-gray-800 font-semibold">
                คุณสมบัติที่ประทับใจ (เลือกได้หลายข้อ)
              </Typography>
              <FormGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featureOptions.map((feature) => (
                  <FormControlLabel
                    key={feature.value}
                    control={
                      <Checkbox
                        checked={surveyData.features.includes(feature.value)}
                        onChange={() => handleFeatureChange(feature.value)}
                        className="text-blue-600"
                      />
                    }
                    label={
                      <Box className="flex items-center">
                        <span className="mr-2 text-gray-600">{feature.icon}</span>
                        <Typography variant="body2">{feature.label}</Typography>
                      </Box>
                    }
                    className="m-0"
                  />
                ))}
              </FormGroup>
            </Paper>

            {/* Improvements */}
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h6" className="mb-4 text-gray-800 font-semibold">
                ข้อเสนอแนะเพื่อการปรับปรุง
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="กรุณาแจ้งข้อเสนอแนะหรือความคิดเห็นเพื่อปรับปรุงบริการ..."
                value={surveyData.improvements}
                onChange={(e) => handleTextChange('improvements', e.target.value)}
                className="mb-4"
              />
            </Paper>

            {/* Recommend to Others */}
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h6" className="mb-4 text-gray-800 font-semibold">
                คุณจะแนะนำ LannaFinChat ให้ผู้อื่นหรือไม่?
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={surveyData.recommendToOthers}
                  onChange={(e) => handleTextChange('recommendToOthers', e.target.value)}
                  className="flex flex-row space-x-4"
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio className="text-green-600" />}
                    label={
                      <Box className="flex items-center">
                        <ThumbUp className="mr-1 text-green-600" />
                        <Typography>จะแนะนำ</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="maybe"
                    control={<Radio className="text-yellow-600" />}
                    label={
                      <Box className="flex items-center">
                        <Typography>อาจจะแนะนำ</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio className="text-red-600" />}
                    label={
                      <Box className="flex items-center">
                        <ThumbDown className="mr-1 text-red-600" />
                        <Typography>ไม่แนะนำ</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* Additional Comments */}
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h6" className="mb-4 text-gray-800 font-semibold">
                ความคิดเห็นเพิ่มเติม
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="ความคิดเห็นหรือข้อเสนอแนะอื่นๆ..."
                value={surveyData.additionalComments}
                onChange={(e) => handleTextChange('additionalComments', e.target.value)}
              />
            </Paper>

            {/* Selected Features Display */}
            {surveyData.features.length > 0 && (
              <Paper elevation={1} className="p-4 rounded-lg bg-blue-50">
                <Typography variant="subtitle2" className="mb-2 text-gray-700">
                  คุณสมบัติที่เลือก:
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {surveyData.features.map((feature) => {
                    const featureInfo = featureOptions.find(f => f.value === feature);
                    return (
                      <Chip
                        key={feature}
                        label={featureInfo?.label}
                        icon={featureInfo?.icon}
                        className="bg-blue-100 text-blue-800"
                        size="small"
                      />
                    );
                  })}
                </Box>
              </Paper>
            )}
          </Box>
        </DialogContent>

        <DialogActions className="bg-gray-50 p-4">
          <Button onClick={onClose} className="text-gray-600">
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700"
            startIcon={<Send />}
            disabled={surveyData.overallSatisfaction === 0}
          >
            ส่งแบบประเมิน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" className="w-full">
          ขอบคุณสำหรับการประเมิน! ข้อมูลของคุณจะถูกนำไปใช้ในการปรับปรุงบริการ
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={3000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" className="w-full">
          กรุณาให้คะแนนความพึงพอใจโดยรวมก่อนส่งแบบประเมิน
        </Alert>
      </Snackbar>
    </>
  );
};

export default SatisfactionSurvey;
