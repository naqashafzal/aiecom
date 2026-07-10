import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  currencyCode: string;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  items,
  total,
  shippingAddress,
  paymentMethod,
  currencyCode,
}: OrderConfirmationEmailProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(price);
  };

  return (
    <Html>
      <Head />
      <Preview>Your Aura Store Order Confirmation (#{orderNumber})</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>AURA</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>Thank you for your order!</Heading>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              We've received your order <strong>#{orderNumber}</strong> and it is now being processed. 
              Below is the summary of your purchase.
            </Text>

            <Hr style={hr} />

            <Section style={itemsSection}>
              <Heading as="h3" style={subHeading}>Order Summary</Heading>
              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={itemNameCol}>
                    <Text style={itemText}>{item.name} <span style={muted}>(x{item.quantity})</span></Text>
                  </Column>
                  <Column style={itemPriceCol}>
                    <Text style={itemTextRight}>{formatPrice(item.price * item.quantity)}</Text>
                  </Column>
                </Row>
              ))}
              
              <Hr style={hrThin} />
              
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Total</Text>
                </Column>
                <Column>
                  <Text style={totalValue}>{formatPrice(total)}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            <Section>
              <Row>
                <Column style={infoCol}>
                  <Heading as="h4" style={subHeadingSm}>Shipping Address</Heading>
                  <Text style={infoText}>{shippingAddress}</Text>
                </Column>
                <Column style={infoCol}>
                  <Heading as="h4" style={subHeadingSm}>Payment Method</Heading>
                  <Text style={infoText}>{paymentMethod}</Text>
                </Column>
              </Row>
            </Section>

            <Text style={footerText}>
              If you have any questions about your order, please reply to this email or contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 48px',
  backgroundColor: '#000000',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '0.2em',
  margin: '0',
};

const content = {
  padding: '24px 48px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#111',
  marginBottom: '24px',
};

const subHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111',
  margin: '0 0 16px',
};

const subHeadingSm = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#111',
  margin: '0 0 8px',
};

const text = {
  fontSize: '16px',
  color: '#444',
  lineHeight: '24px',
};

const infoText = {
  fontSize: '14px',
  color: '#666',
  lineHeight: '20px',
  whiteSpace: 'pre-line',
};

const footerText = {
  fontSize: '14px',
  color: '#888',
  lineHeight: '20px',
  marginTop: '48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const hrThin = {
  borderColor: '#f0f0f0',
  margin: '16px 0',
};

const itemsSection = {
  padding: '16px 0',
};

const itemRow = {
  marginBottom: '8px',
};

const itemNameCol = {
  width: '70%',
};

const itemPriceCol = {
  width: '30%',
};

const itemText = {
  fontSize: '15px',
  color: '#333',
  margin: '0',
};

const itemTextRight = {
  fontSize: '15px',
  color: '#333',
  margin: '0',
  textAlign: 'right' as const,
};

const muted = {
  color: '#888',
  fontSize: '13px',
};

const totalRow = {
  marginTop: '16px',
};

const totalLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111',
  margin: '0',
};

const totalValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111',
  margin: '0',
  textAlign: 'right' as const,
};

const infoCol = {
  width: '50%',
  verticalAlign: 'top',
};
