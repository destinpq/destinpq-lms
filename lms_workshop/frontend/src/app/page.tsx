'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  ConfigProvider
} from 'antd';
import { 
  RocketOutlined, 
  BulbOutlined, 
  SmileOutlined,
  ArrowRightOutlined,
  ExperimentOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Update theme to more refined, professional colors
const theme = {
  token: {
    colorPrimary: '#3d4c80', // Deeper blue instead of purple
    colorSuccess: '#6b7eaf',
    colorWarning: '#d6a559',
    colorError: '#b86a6a',
    colorInfo: '#6c7db8',
    colorTextBase: '#333645',
    colorBgBase: '#f7f9fc',
    borderRadius: 8,
  },
};

export default function Home() {
  const router = useRouter();

  // Simplify the background pattern
  const backgroundPattern = (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `
        linear-gradient(to bottom, rgba(61, 76, 128, 0.02) 0%, rgba(61, 76, 128, 0.01) 100%)
      `,
      zIndex: 0,
      pointerEvents: 'none',
    }}
    />
  );

  return (
    <ConfigProvider theme={theme}>
      <div className="min-h-screen" style={{ 
        backgroundColor: '#f7f9fc',
        position: 'relative'
      }}>
        {backgroundPattern}
        <div style={{ padding: '30px 0', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            maxWidth: '1200px', 
            width: '90%',
            margin: '0 auto',
            padding: '0'
          }}>
            {/* Clean up logo section */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
              <div style={{ position: 'relative', width: '220px', height: '160px' }}>
                <Image 
                  src="/logo.png" 
                  alt="Dr. Akanksha Agarwal's Mental Healthcare Clinic"
                  width={220}
                  height={160}
                  style={{
                    objectFit: 'contain'
                  }}
                  priority
                />
              </div>
            </div>

            {/* Simplified Hero Section */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
              style={{ width: '100%' }}
            >
              <div 
                style={{ 
                backgroundColor: '#3d4c80', 
                padding: '50px 30px', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text style={{ 
                      color: 'white', 
                      fontWeight: '700', 
                      fontSize: '4rem', 
                      lineHeight: '1.1',
                      letterSpacing: '-0.5px',
                      display: 'block'
                    }}>
                      Psychology
                    </Text>
                  </div>
                  <Text style={{ 
                    color: 'rgba(255, 255, 255, 0.85)', 
                    fontWeight: '400', 
                    fontSize: '2rem',
                    display: 'block'
                  }}>
                    Learning Platform
                  </Text>
                </div>
                <Paragraph style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 24px', color: 'rgba(255, 255, 255, 0.85)' }}>
                  Access high-quality psychology workshops, interactive content, and assessments to enhance your learning experience.
                </Paragraph>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '16px', 
                  marginTop: '32px', 
                  flexWrap: 'wrap',
                  width: '100%'
                }}>
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.98 }}
                    style={{ margin: '8px' }}
                  >
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={() => router.push('/direct-login')}
                      icon={<ArrowRightOutlined />}
                      style={{ 
                        backgroundColor: 'white', 
                        color: '#3d4c80', 
                        borderColor: 'white', 
                        height: '56px', 
                        padding: '0 32px', 
                        fontSize: '18px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                        minWidth: '180px'
                      }}
                    >
                      Get Started
                    </Button>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.98 }}
                    style={{ margin: '8px' }}
                  >
                    <Button 
                      size="large"
                      onClick={() => router.push('/signup')}
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'white', 
                        color: 'white', 
                        height: '56px', 
                        padding: '0 32px', 
                        fontSize: '18px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        minWidth: '180px'
                      }}
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Simplified tagline */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ color: '#3d4c80', fontSize: '24px', fontWeight: 500 }}>
                Healing Through Understanding
              </h2>
            </div>

            {/* Featured Workshops - Cleaner design */}
            <div style={{ marginBottom: '70px', width: '100%' }}>
              <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', color: '#3d4c80', fontSize: '28px', fontWeight: 600 }}>
                Featured Workshops
              </Title>
              
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card 
                    hoverable 
                    style={{ 
                      borderRadius: '10px', 
                      height: '100%', 
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                    cover={
                      <div style={{ 
                        height: 180, 
                        background: 'linear-gradient(135deg, #eaeef6 0%, #3d4c80 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BulbOutlined style={{ fontSize: 48, color: 'white' }} />
                      </div>
                    }
                  >
                    <Card.Meta
                      title={<span style={{ fontSize: '1.2rem', color: '#3d4c80', fontWeight: 500 }}>Cognitive Behavioral Techniques</span>}
                      description={<span style={{ color: '#555', fontSize: '15px' }}>Learn practical CBT methods to identify, challenge, and overcome negative thought patterns.</span>}
                    />
                    <Button type="link" style={{ paddingLeft: 0, marginTop: '16px', color: '#3d4c80', fontSize: '15px' }}>Learn more →</Button>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card 
                    hoverable 
                    style={{ 
                      borderRadius: '10px', 
                      height: '100%', 
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                    cover={
                      <div style={{ 
                        height: 180, 
                        background: 'linear-gradient(135deg, #e8edf6 0%, #4e5b8c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ExperimentOutlined style={{ fontSize: 48, color: 'white' }} />
                      </div>
                    }
                  >
                    <Card.Meta
                      title={<span style={{ fontSize: '1.2rem', color: '#3d4c80', fontWeight: 500 }}>Neuroscience Fundamentals</span>}
                      description={<span style={{ color: '#555', fontSize: '15px' }}>Explore brain-behavior connections and understand how neural processes influence our psychology.</span>}
                    />
                    <Button type="link" style={{ paddingLeft: 0, marginTop: '16px', color: '#3d4c80', fontSize: '15px' }}>Learn more →</Button>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card 
                    hoverable 
                    style={{ 
                      borderRadius: '10px', 
                      height: '100%', 
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                    cover={
                      <div style={{ 
                        height: 180, 
                        background: 'linear-gradient(135deg, #e6eaf3 0%, #475785 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <SmileOutlined style={{ fontSize: 48, color: 'white' }} />
                      </div>
                    }
                  >
                    <Card.Meta
                      title={<span style={{ fontSize: '1.2rem', color: '#3d4c80', fontWeight: 500 }}>Positive Psychology</span>}
                      description={<span style={{ color: '#555', fontSize: '15px' }}>Discover the science of wellbeing and happiness through evidence-based approaches to positive mental health.</span>}
                    />
                    <Button type="link" style={{ paddingLeft: 0, marginTop: '16px', color: '#3d4c80', fontSize: '15px' }}>Learn more →</Button>
                  </Card>
                </Col>
              </Row>
            </div>
            
            {/* Why Choose Us - Simplified */}
            <div style={{ 
              marginBottom: '70px', 
              backgroundColor: 'white', 
              padding: '50px 30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              width: '100%'
            }}>
              <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', color: '#3d4c80', fontSize: '28px', fontWeight: 600 }}>
                Why Choose Our Platform
              </Title>
              <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(61, 76, 128, 0.1)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <RocketOutlined style={{ fontSize: 32, color: '#3d4c80' }} />
                      </div>
                    </div>
                    <Title level={3} style={{ color: '#3d4c80', fontSize: '20px', fontWeight: 600 }}>Interactive Learning</Title>
                    <Paragraph style={{ color: '#555', fontSize: '15px' }}>Engage with dynamic content designed to enhance understanding and retention.</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(61, 76, 128, 0.1)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <BulbOutlined style={{ fontSize: 32, color: '#3d4c80' }} />
                      </div>
                    </div>
                    <Title level={3} style={{ color: '#3d4c80', fontSize: '20px', fontWeight: 600 }}>Expert Instructors</Title>
                    <Paragraph style={{ color: '#555', fontSize: '15px' }}>Learn from leading professionals in the field of psychology.</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(61, 76, 128, 0.1)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <HeartOutlined style={{ fontSize: 32, color: '#3d4c80' }} />
                      </div>
                    </div>
                    <Title level={3} style={{ color: '#3d4c80', fontSize: '20px', fontWeight: 600 }}>Practical Skills</Title>
                    <Paragraph style={{ color: '#555', fontSize: '15px' }}>Develop applicable techniques that translate to real-world scenarios.</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
            
            {/* Simplified Call to Action */}
            <div style={{ 
              marginBottom: '50px',
              padding: '50px 30px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3d4c80 0%, #4e5b8c 100%)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              width: '100%'
            }}>
              <Title level={2} style={{ color: 'white', marginBottom: '20px', fontSize: '28px', fontWeight: 600 }}>
                Begin Your Journey To Better Mental Health
              </Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '17px', maxWidth: '700px', margin: '0 auto 30px' }}>
                Join our community of learners and practitioners dedicated to psychological wellbeing and growth.
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={() => router.push('/signup')}
                style={{ 
                  backgroundColor: 'white', 
                  color: '#3d4c80', 
                  height: '48px', 
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderColor: 'white',
                  marginRight: '16px'
                }}
              >
                Start Your Free Trial
              </Button>
              <Button 
                size="large"
                onClick={() => router.push('/jitsi-demo-landing')}
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white', 
                  height: '48px', 
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderColor: 'white'
                }}
              >
                Try Jitsi Integration
              </Button>
            </div>
            
            {/* Footer */}
            <div style={{ 
              textAlign: 'center', 
              padding: '20px 0', 
              borderTop: '1px solid rgba(61, 76, 128, 0.15)', 
              marginTop: '20px' 
            }}>
              <Paragraph style={{ color: '#555', fontSize: '14px' }}>
                © {new Date().getFullYear()} Dr. Akanksha Agarwal&apos;s Mental Healthcare Clinic. All rights reserved.
              </Paragraph>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
