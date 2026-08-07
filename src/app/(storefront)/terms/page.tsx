import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ZS Decor",
  description: "Terms of Service for ZS Decor",
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-[#202223]">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">1. Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">2. Products and Services</h2>
        <p>Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.</p>
        <p>We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">3. Accuracy of Billing and Account Information</h2>
        <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">4. Modifications to the Service and Prices</h2>
        <p>Prices for our products are subject to change without notice.</p>
        <p>We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">5. User Comments, Feedback and Other Submissions</h2>
        <p>If, at our request, you send certain specific submissions (for example contest entries) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">6. Governing Law</h2>
        <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the jurisdiction in which our business is registered.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">7. Contact Information</h2>
        <p>Questions about the Terms of Service should be sent to us through our contact page.</p>
      </div>
    </div>
  );
}
