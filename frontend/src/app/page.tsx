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
  HeartOutlined,
  UserOutlined,
  StarFilled
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Purple color theme
const theme = {
  token: {
    colorPrimary: '#4a2c82', // Dark purple
    colorSuccess: '#8D9DE6',
    colorWarning: '#D1A76E',
    colorError: '#C67B7B',
    colorInfo: '#9e9fe2',
    colorTextBase: '#3E3E5C',
    colorBgBase: '#f8f9ff',
    borderRadius: 8,
  },
};

export default function Home() {
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.4, 
        ease: "easeOut"
      }
    },
    hover: { 
      y: -5,
      boxShadow: "0 12px 24px rgba(74, 44, 130, 0.2)",
      transition: { duration: 0.2 }
    }
  };

  // Brain animation for psychology
  const brainPathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { 
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop" as const,
        repeatDelay: 1
      }
    }
  };

  const pulseVariants = {
    hidden: { scale: 1, opacity: 0.7 },
    visible: {
      scale: 1.05,
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  // Background pattern
  const backgroundPattern = (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(74, 44, 130, 0.05) 0%, transparent 20%),
        radial-gradient(circle at 80% 40%, rgba(74, 44, 130, 0.07) 0%, transparent 20%),
        radial-gradient(circle at 30% 70%, rgba(74, 44, 130, 0.06) 0%, transparent 25%),
        radial-gradient(circle at 90% 90%, rgba(74, 44, 130, 0.05) 0%, transparent 15%)
      `,
      zIndex: 0,
      pointerEvents: 'none',
    }}
    />
  );

  return (
    <ConfigProvider theme={theme}>
      <div className="min-h-screen" style={{ 
        backgroundColor: '#f8f9ff',
        position: 'relative',
        overflow: 'hidden' 
      }}>
        {backgroundPattern}
        <div style={{ padding: '40px 0', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            maxWidth: '1600px', 
            width: '95%',
            margin: '0 auto',
            padding: '0'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
              <div style={{ position: 'relative', width: '300px', height: '220px' }}>
                <Image 
                  src="/logo.png" 
                  alt="Dr. Akanksha Agarwal's Mental Healthcare Clinic"
                  width={300}
                  height={220}
                  style={{
                    objectFit: 'contain'
                  }}
                  priority
                />
              </div>
            </div>

            {/* Hero Section - Expanded to full width */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={containerVariants}
              className="text-center mb-16"
              style={{ width: '100%' }}
            >
              <motion.div 
                variants={pulseVariants}
                style={{ 
                backgroundColor: '#4a2c82', 
                padding: '60px 20px', 
                borderRadius: '16px',
                boxShadow: '0 8px 20px rgba(74, 44, 130, 0.2)'
              }}>
                <Title level={1} style={{ fontSize: '3.2rem', marginBottom: '16px', color: 'white' }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Psychology </Text>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Workshop LMS</Text>
                </Title>
                <Paragraph style={{ fontSize: '1.4rem', marginBottom: '2rem', maxWidth: '900px', margin: '0 auto', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Access high-quality psychology workshops, interactive content, and assessments to enhance your learning experience.
                </Paragraph>
                
                {/* Brain waves animation SVG */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <motion.svg 
                    width="120" 
                    height="60" 
                    viewBox="0 0 120 60"
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.path
                      d="M10,30 Q20,10 30,30 Q40,50 50,30 Q60,10 70,30 Q80,50 90,30 Q100,10 110,30"
                      fill="transparent"
                      stroke="rgba(255, 255, 255, 0.8)"
                      strokeWidth="2"
                      variants={brainPathVariants}
                    />
                  </motion.svg>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={() => router.push('/login')}
                      icon={<ArrowRightOutlined />}
                      style={{ backgroundColor: 'white', color: '#4a2c82', borderColor: 'white', height: '50px', padding: '0 30px', fontSize: '16px' }}
                    >
                      Get Started
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="large"
                      onClick={() => router.push('/signup')}
                      style={{ borderColor: 'white', color: 'white', height: '50px', padding: '0 30px', fontSize: '16px' }}
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Healing Animation - Full Width */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              style={{ marginBottom: '60px', textAlign: 'center', width: '100%' }}
            >
              <svg width="200" height="200" viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
                <motion.circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="none"
                  stroke="#4a2c82"
                  strokeWidth="2"
                  initial={{ opacity: 0.2, scale: 0.8 }}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="#6440a4"
                  strokeWidth="1.5"
                  initial={{ opacity: 0.2, scale: 0.8 }}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#9984c7"
                  strokeWidth="1"
                  initial={{ opacity: 0.2, scale: 0.8 }}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                <motion.path
                  d="M50,30 Q60,45 50,60 Q40,45 50,30"
                  fill="#4a2c82"
                  initial={{ opacity: 0.5 }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </svg>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                style={{ color: '#4a2c82', marginTop: '15px', fontSize: '24px' }}
              >
                Healing Through Understanding
              </motion.h3>
            </motion.div>

            {/* Featured Workshops - Grid with larger cards */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={containerVariants}
              style={{ marginBottom: '80px', width: '100%' }}
            >
              <Title level={2} style={{ textAlign: 'center', marginBottom: '50px', color: '#4a2c82', fontSize: '36px' }}>
                Featured Workshops
              </Title>
              
              <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                  <motion.div 
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card 
                      hoverable 
                      style={{ 
                        borderRadius: '12px', 
                        height: '100%', 
                        overflow: 'hidden',
                        border: 'none',
                        boxShadow: '0 6px 16px rgba(74, 44, 130, 0.12)'
                      }}
                      cover={
                        <div style={{ 
                          height: 240, 
                          background: 'linear-gradient(135deg, #e0d8f0 0%, #4a2c82 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <BulbOutlined style={{ fontSize: 64, color: 'white' }} />
                        </div>
                      }
                    >
                      <Card.Meta
                        title={<span style={{ fontSize: '1.4rem', color: '#4a2c82', fontWeight: 500 }}>Cognitive Behavioral Techniques</span>}
                        description={<span style={{ color: '#3E3E5C', fontSize: '16px' }}>Learn practical CBT methods to identify, challenge, and overcome negative thought patterns.</span>}
                      />
                      <Button type="link" style={{ paddingLeft: 0, marginTop: '16px', color: '#4a2c82', fontSize: '16px' }}>Learn more →</Button>
                    </Card>
                  </motion.div>
                </Col>
                <Col xs={24} md={8}>
                  <motion.div 
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card 
                      hoverable 
                      style={{ 
                        borderRadius: '12px', 
                        height: '100%', 
                        overflow: 'hidden',
                        border: 'none',
                        boxShadow: '0 6px 16px rgba(74, 44, 130, 0.12)'
                      }}
                      cover={
                        <div style={{ 
                          height: 240, 
                          background: 'linear-gradient(135deg, #d9ceed 0%, #614694 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ExperimentOutlined style={{ fontSize: 64, color: 'white' }} />
                        </div>
                      }
                    >
                      <Card.Meta
                        title={<span style={{ fontSize: '1.4rem', color: '#4a2c82', fontWeight: 500 }}>Neuroscience Fundamentals</span>}
                        description={<span style={{ color: '#3E3E5C', fontSize: '16px' }}>Explore brain-behavior connections and understand how neural processes influence our psychology.</span>}
                      />
                      <Button type="link" style={{ paddingLeft: 0, marginTop: '16px', color: '#4a2c82', fontSize: '16px' }}>Learn more →</Button>
                    </Card>
                  </motion.div>
                </Col>
                <Col xs={24} md={8}>
                  <motion.div 
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card 
                      hoverable 
                      style={{ 
                        borderRadius: '12px', 
                        height: '100%', 
                        overflow: 'hidden',
                        border: 'none',
                        boxShadow: '0 6px 16px rgba(74, 44, 130, 0.12)'
                      }}
                      cover={
                        <div style={{ 
                          height: 240, 
                          background: 'linear-gradient(135deg, #d2c7e6 0%, #513a85 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <SmileOutlined style={{ fontSize: 64, color: 'white' }} />
                        </div>
                      }
                    >
                      <Card.Meta
                        title={<span style={{ fontSize: '1.4rem', color: '#4a2c82', fontWeight: 500 }}>Positive Psychology</span>}
                        description={<span style={{ color: '#3E3E5C', fontSize: '16px' }}>Discover the science of wellbeing and happiness through evidence-based approaches to positive mental health.</span>}
                      />
                      <Button type="link" style={{ paddingLeft: 0, marginTop: '16px', color: '#4a2c82', fontSize: '16px' }}>Learn more →</Button>
                    </Card>
                  </motion.div>
                </Col>
              </Row>
            </motion.div>
            
            {/* Why Choose Us - Full Width */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={containerVariants}
              style={{ 
                marginBottom: '80px', 
                backgroundColor: 'white', 
                padding: '60px 40px',
                borderRadius: '16px',
                boxShadow: '0 6px 16px rgba(74, 44, 130, 0.08)',
                width: '100%'
              }}
            >
              <Title level={2} style={{ textAlign: 'center', marginBottom: '50px', color: '#4a2c82', fontSize: '36px' }}>
                Why Choose Our Platform
              </Title>
              <Row gutter={[48, 48]}>
                <Col xs={24} md={8}>
                  <motion.div variants={itemVariants} className="text-center">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <motion.div 
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        style={{ 
                        width: '100px', 
                        height: '100px', 
                        background: 'rgba(74, 44, 130, 0.1)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(74, 44, 130, 0.15)'
                      }}>
                        <RocketOutlined style={{ fontSize: 40, color: '#4a2c82' }} />
                      </motion.div>
                    </div>
                    <Title level={3} style={{ color: '#4a2c82', fontSize: '24px' }}>Interactive Learning</Title>
                    <Paragraph style={{ color: '#3E3E5C', fontSize: '16px' }}>Engage with dynamic content designed to enhance understanding and retention.</Paragraph>
                  </motion.div>
                </Col>
                <Col xs={24} md={8}>
                  <motion.div variants={itemVariants} className="text-center">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <motion.div 
                        whileHover={{ rotate: -5, scale: 1.1 }}
                        style={{ 
                        width: '100px', 
                        height: '100px', 
                        background: 'rgba(74, 44, 130, 0.1)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(74, 44, 130, 0.15)'
                      }}>
                        <BulbOutlined style={{ fontSize: 40, color: '#4a2c82' }} />
                      </motion.div>
                    </div>
                    <Title level={3} style={{ color: '#4a2c82', fontSize: '24px' }}>Expert Instructors</Title>
                    <Paragraph style={{ color: '#3E3E5C', fontSize: '16px' }}>Learn from leading professionals in the field of psychology.</Paragraph>
                  </motion.div>
                </Col>
                <Col xs={24} md={8}>
                  <motion.div variants={itemVariants} className="text-center">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <motion.div 
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        style={{ 
                        width: '100px', 
                        height: '100px', 
                        background: 'rgba(74, 44, 130, 0.1)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(74, 44, 130, 0.15)'
                      }}>
                        <HeartOutlined style={{ fontSize: 40, color: '#4a2c82' }} />
                      </motion.div>
                    </div>
                    <Title level={3} style={{ color: '#4a2c82', fontSize: '24px' }}>Practical Skills</Title>
                    <Paragraph style={{ color: '#3E3E5C', fontSize: '16px' }}>Develop applicable techniques that translate to real-world scenarios.</Paragraph>
                  </motion.div>
                </Col>
              </Row>
            </motion.div>
            
            {/* Mindfulness Animation - Full Width */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              style={{ 
                marginBottom: '80px',
                position: 'relative',
                height: '250px',
                backgroundColor: '#f0ebfa',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(74, 44, 130, 0.08)',
                width: '100%'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  style={{ color: '#4a2c82', marginBottom: '15px', textAlign: 'center', zIndex: 2, fontSize: '28px' }}
                >
                  Practice Mindfulness
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  style={{ color: '#4a2c82', textAlign: 'center', maxWidth: '500px', zIndex: 2, fontSize: '18px' }}
                >
                  Take a moment to breathe and center yourself
                </motion.p>
              </div>
              
              {/* Floating elements */}
              {[...Array(20)].map((_, index) => (
                <motion.div
                  key={index}
                  style={{
                    position: 'absolute',
                    background: `rgba(${74 + (index * 5)}, ${44 + (index * 2)}, ${130 - (index * 3)}, ${0.1 + (index * 0.03)})`,
                    width: 20 + (index * 5),
                    height: 20 + (index * 5),
                    borderRadius: '50%',
                    left: `${(index * 5) % 100}%`,
                    top: `${20 + ((index * 10) % 60)}%`,
                    zIndex: 1
                  }}
                  animate={{
                    x: [0, 10, -10, 0],
                    y: [0, -15, 5, 0],
                    scale: [1, 1.2, 0.9, 1],
                  }}
                  transition={{
                    duration: 4 + (index % 4),
                    repeat: Infinity,
                    repeatType: "reverse" as const,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                />
              ))}
            </motion.div>
            
            {/* Testimonials - Full Width */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              style={{ marginBottom: '80px', width: '100%' }}
            >
              <Title level={2} style={{ textAlign: 'center', marginBottom: '50px', color: '#4a2c82', fontSize: '36px' }}>
                Testimonials
              </Title>
              
              <Row gutter={[32, 32]}>
                {[
                  {
                    name: "Sarah Johnson",
                    role: "Psychology Student",
                    text: "The workshops have transformed my understanding of CBT techniques. I can now apply these methods in my internship with confidence.",
                    rating: 5
                  },
                  {
                    name: "Michael Chen",
                    role: "Mental Health Advocate",
                    text: "Dr. Agarwal's approach to teaching positive psychology is refreshing and practical. I've incorporated several techniques into my daily routine.",
                    rating: 5
                  },
                  {
                    name: "Priya Sharma",
                    role: "School Counselor",
                    text: "These resources have been invaluable for my professional development. The neuroscience workshop in particular was eye-opening.",
                    rating: 4
                  }
                ].map((testimonial, index) => (
                  <Col xs={24} md={8} key={index}>
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <Card
                        style={{ 
                          borderRadius: '12px',
                          height: '100%',
                          boxShadow: '0 6px 16px rgba(74, 44, 130, 0.08)',
                          padding: '10px'
                        }}
                      >
                        <div style={{ marginBottom: '16px' }}>
                          {[...Array(5)].map((_, i) => (
                            <StarFilled 
                              key={i} 
                              style={{ 
                                color: i < testimonial.rating ? '#f0c30f' : '#e4e4e4',
                                marginRight: '4px',
                                fontSize: '18px'
                              }} 
                            />
                          ))}
                        </div>
                        <Paragraph style={{ fontSize: '18px', color: '#3E3E5C', marginBottom: '20px' }}>
                          &quot;{testimonial.text}&quot;
                        </Paragraph>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ 
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(74, 44, 130, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px'
                          }}>
                            <UserOutlined style={{ color: '#4a2c82', fontSize: '24px' }} />
                          </div>
                          <div>
                            <Text strong style={{ display: 'block', color: '#4a2c82', fontSize: '18px' }}>{testimonial.name}</Text>
                            <Text style={{ fontSize: '16px', color: '#666' }}>{testimonial.role}</Text>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
            
            {/* Call to Action - Full Screen Width */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ 
                marginBottom: '60px',
                padding: '70px 30px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4a2c82 0%, #6440a4 100%)',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(74, 44, 130, 0.25)',
                width: '100%'
              }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Title level={1} style={{ color: 'white', marginBottom: '20px', fontSize: '42px' }}>
                  Begin Your Journey To Better Mental Health
                </Title>
                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '20px', maxWidth: '900px', margin: '0 auto 40px' }}>
                  Join our community of learners and practitioners dedicated to psychological wellbeing and growth.
                </Paragraph>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => router.push('/signup')}
                    style={{ 
                      backgroundColor: 'white', 
                      color: '#4a2c82', 
                      height: '60px', 
                      padding: '0 50px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      borderColor: 'white'
                    }}
                  >
                    Start Your Free Trial
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Footer */}
            <div style={{ 
              textAlign: 'center', 
              padding: '24px 0', 
              borderTop: '1px solid rgba(74, 44, 130, 0.2)', 
              marginTop: '32px' 
            }}>
              <Paragraph style={{ color: '#4a2c82', fontSize: '16px' }}>
                © {new Date().getFullYear()} Dr. Akanksha Agarwal&apos;s Mental Healthcare Clinic. All rights reserved.
              </Paragraph>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
