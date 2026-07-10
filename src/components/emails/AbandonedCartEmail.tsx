import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Button, Img, Link } from '@react-email/components';
import * as React from 'react';

interface AbandonedCartEmailProps {
  customerName?: string;
  checkoutUrl: string;
  storeName: string;
  cartTotal: string;
  items: Array<{
    name: string;
    image: string;
    price: string;
  }>;
}

export default function AbandonedCartEmail({
  customerName = 'there',
  checkoutUrl,
  storeName,
  cartTotal,
  items
}: AbandonedCartEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You left something in your cart at {storeName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Did you forget something?</Heading>
          
          <Text style={text}>
            Hi {customerName},
          </Text>
          <Text style={text}>
            We noticed you left some great items in your cart at {storeName}. 
            Don't worry, we've saved them for you!
          </Text>

          <Section style={itemsSection}>
            {items.map((item, index) => (
              <div key={index} style={itemRow}>
                <Img src={item.image} width="60" height="60" style={itemImage} alt={item.name} />
                <div style={itemDetails}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemPrice}>{item.price}</Text>
                </div>
              </div>
            ))}
          </Section>

          <Hr style={hr} />
          
          <Section style={totalSection}>
            <Text style={totalText}>Cart Total: {cartTotal}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={checkoutUrl}>
              Complete Your Purchase
            </Button>
          </Section>
          
          <Text style={footer}>
            If you have any questions, reply to this email. We're always happy to help!
          </Text>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  marginTop: '40px',
  marginBottom: '40px',
  maxWidth: '600px',
};

const h1 = {
  color: '#111111',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const text = {
  color: '#444444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const itemsSection = {
  padding: '20px 0',
  borderTop: '1px solid #eaeaea',
};

const itemRow = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px',
};

const itemImage = {
  borderRadius: '4px',
  marginRight: '15px',
};

const itemDetails = {
  flex: 1,
};

const itemName = {
  color: '#111111',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 5px',
};

const itemPrice = {
  color: '#666666',
  fontSize: '14px',
  margin: '0',
};

const totalSection = {
  padding: '10px 0 20px',
  textAlign: 'right' as const,
};

const totalText = {
  color: '#111111',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 24px',
};

const hr = {
  borderColor: '#eaeaea',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '10px 0 0',
};
