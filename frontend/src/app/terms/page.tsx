'use client';

import React from 'react';
import Link from 'next/link';
import { Typography, Breadcrumb, Card, Button } from 'antd';

const { Title, Paragraph } = Typography;

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <Breadcrumb className="mb-6" items={[
          { title: <Link href="/">Home</Link> },
          { title: 'Terms of Service' }
        ]} />
        
        <Card className="shadow-md">
          <Title level={2} className="mb-6">Terms of Service</Title>
          
          <div className="space-y-6">
            <section>
              <Title level={4}>1. Acceptance of Terms</Title>
              <Paragraph>
                By accessing and using the LMS Workshop platform, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our platform.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>2. User Accounts</Title>
              <Paragraph>
                When you create an account with us, you must provide accurate and complete information. 
                You are responsible for maintaining the security of your account and password. 
                The platform cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>3. Course Content</Title>
              <Paragraph>
                All course content provided through our platform is for educational purposes only. 
                The materials and content are protected by copyright and may not be reproduced, distributed, 
                or used for commercial purposes without explicit permission.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>4. User Conduct</Title>
              <Paragraph>
                Users are expected to behave professionally and respectfully when using the platform. 
                Harassment, abuse, or any form of harmful behavior toward other users will not be tolerated and may result in account termination.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>5. Privacy Policy</Title>
              <Paragraph>
                Our privacy practices are outlined in our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, 
                which is incorporated into these Terms of Service.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>6. Limitation of Liability</Title>
              <Paragraph>
                The platform is provided &quot;as is&quot; without warranties of any kind. 
                We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
              </Paragraph>
            </section>
            
            <section>
              <Title level={4}>7. Changes to Terms</Title>
              <Paragraph>
                We reserve the right to modify these terms at any time. 
                Users will be notified of significant changes. 
                Continued use of the platform after such modifications constitutes acceptance of the updated terms.
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