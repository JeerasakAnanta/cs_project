import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Star,
  ThumbUp,
  Speed,
  Security,
  Support,
  EmojiEmotions,
  CheckCircle,
  Info
} from '@mui/icons-material';
import SurveyButton from './SurveyButton';

const SurveyDemo: React.FC = () => {
  const features = [
    {
      icon: <Star className="text-yellow-500" />,
      title: 'การประเมินแบบดาว',
      description: 'ให้คะแนนความพึงพอใจ 1-5 ดาว'
    },
    {
      icon: <Speed className="text-blue-500" />,
      title: 'ประเมินรายละเอียด',
      description: 'ประเมินแต่ละด้านแยกกัน'
    },
    {
      icon: <ThumbUp className="text-green-500" />,
      title: 'คำถามแนะนำ',
      description: 'ถามความตั้งใจในการแนะนำ'
    },
    {
      icon: <EmojiEmotions className="text-purple-500" />,
      title: 'เลือกคุณสมบัติ',
      description: 'เลือกคุณสมบัติที่ประทับใจ'
    },
    {
      icon: <Support className="text-orange-500" />,
      title: 'ข้อเสนอแนะ',
      description: 'รับข้อเสนอแนะเพื่อปรับปรุง'
    },
    {
      icon: <Security className="text-red-500" />,
      title: 'ข้อมูลปลอดภัย',
      description: 'ข้อมูลจะถูกเก็บรักษาอย่างปลอดภัย'
    }
  ];

  const surveyBenefits = [
    'ช่วยปรับปรุงคุณภาพบริการ',
    'เข้าใจความต้องการของผู้ใช้',
    'พัฒนาคุณสมบัติใหม่',
    'เพิ่มความพึงพอใจของผู้ใช้',
    'สร้างความไว้วางใจ'
  ];

  return (
    <Container maxWidth="lg" className="py-8">
      {/* Header */}
      <Box className="text-center mb-8">
        <Typography variant="h3" className="font-bold text-gray-800 mb-4">
          แบบประเมินความพึงพอใจ LannaFinChat
        </Typography>
        <Typography variant="h6" className="text-gray-600 mb-6">
          ช่วยเราในการปรับปรุงบริการให้ดียิ่งขึ้น
        </Typography>
        
        <Box className="flex justify-center gap-4 mb-8">
          <SurveyButton variant="button" />
          <SurveyButton variant="fab" position="inline" />
        </Box>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} className="mb-8">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardContent className="text-center">
                <Box className="mb-3">
                  {feature.icon}
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  {feature.title}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Benefits Section */}
      <Paper elevation={3} className="p-6 mb-8">
        <Typography variant="h5" className="font-bold text-gray-800 mb-4">
          <Info className="mr-2 text-blue-600" />
          ประโยชน์ของการประเมิน
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List>
              {surveyBenefits.slice(0, 3).map((benefit, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle className="text-green-500" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              {surveyBenefits.slice(3).map((benefit, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle className="text-green-500" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Survey Types */}
      <Grid container spacing={4} className="mb-8">
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="p-6 h-full">
            <Typography variant="h6" className="font-bold text-gray-800 mb-4">
              ปุ่มแบบประเมิน
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              ปุ่มที่สามารถวางไว้ในตำแหน่งต่างๆ ของหน้าเว็บ
            </Typography>
            <Box className="flex gap-2">
              <SurveyButton variant="button" />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="p-6 h-full">
            <Typography variant="h6" className="font-bold text-gray-800 mb-4">
              ปุ่มลอย (Floating Button)
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              ปุ่มลอยที่สามารถวางไว้มุมขวาล่างของหน้าจอ
            </Typography>
            <Box className="relative h-20">
              <SurveyButton variant="fab" position="inline" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Usage Instructions */}
      <Paper elevation={3} className="p-6">
        <Typography variant="h5" className="font-bold text-gray-800 mb-4">
          วิธีการใช้งาน
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-2">
                  1. เปิดแบบประเมิน
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  คลิกที่ปุ่ม "แบบประเมินความพึงพอใจ" เพื่อเปิดแบบประเมิน
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-2">
                  2. กรอกข้อมูล
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  ให้คะแนนและตอบคำถามต่างๆ ตามความจริง
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-2">
                  3. ส่งแบบประเมิน
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  คลิก "ส่งแบบประเมิน" เพื่อส่งข้อมูลไปยังระบบ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Footer */}
      <Box className="text-center mt-8 pt-8 border-t">
        <Typography variant="body2" className="text-gray-500">
          ขอบคุณที่ใช้บริการ LannaFinChat และให้ความสำคัญกับการปรับปรุงบริการของเรา
        </Typography>
      </Box>
    </Container>
  );
};

export default SurveyDemo;
