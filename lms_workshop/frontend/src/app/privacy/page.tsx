'use client';

import React from 'react';
import Link from 'next/link';
import { Typography, Breadcrumb, Card, Button } from 'antd';

const { Title, Paragraph } = Typography;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <Breadcrumb className="mb-6" items={[
          { title: <Link href="/">Home</Link> },
          { title: 'Privacy Policy' }
        ]} />
        
        <Card className="shadow-md">
          <Title level={2} className="mb-6">Privacy Policy</Title>
          
          <div className="space-y-6">
            <section>
              <Title level={4}>1. Information We Collect</Title>
              <Paragraph>
                We collect personal information that you voluntarily provide to us when you register on the platform, 
                express interest in obtaining information about our services, or otherwise contact us. 
                The personal information we collect may include names, email addresses, and educational background.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>2. How We Use Your Information</Title>
              <Paragraph>
                We use the information we collect to:
              </Paragraph>
              <ul className="list-disc pl-8 space-y-2">
                <li>Facilitate account creation and login process</li>
                <li>Provide and maintain our platform</li>
                <li>Respond to your inquiries and address your concerns</li>
                <li>Send administrative information</li>
                <li>Personalize your learning experience</li>
              </ul>
            </section>
            
            <section>
              <Title level={4}>3. Cookies and Tracking Technologies</Title>
              <Paragraph>
                We use cookies and similar tracking technologies to track activity on our platform and store certain information. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>4. Data Security</Title>
              <Paragraph>
                We implement appropriate technical and organizational security measures to protect your personal information. 
                However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>5. Third-Party Services</Title>
              <Paragraph>
                Our platform may contain links to third-party websites and services. 
                We are not responsible for the content or privacy practices of these third parties.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>6. Your Rights</Title>
              <Paragraph>
                Depending on your location, you may have certain rights regarding your personal information, 
                such as the right to access, correct, or delete your personal information.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>7. Changes to this Privacy Policy</Title>
              <Paragraph>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </Paragraph>
            </section>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/login">
              <Button type="primary">Back to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 