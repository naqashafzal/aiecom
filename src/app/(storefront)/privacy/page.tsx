import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ZS Decor",
  description: "Privacy Policy for ZS Decor",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-[#202223]">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">1. Introduction</h2>
        <p>Welcome to ZS Decor. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">2. The Data We Collect About You</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
          <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely by our payment gateways).</li>
          <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#202223] mt-8">3. How We Use Your Personal Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling your order).</li>
          <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          <li>Where we need to comply with a legal obligation.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#202223] mt-8">4. Data Security</h2>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">5. Your Legal Rights</h2>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.</p>
        
        <h2 className="text-2xl font-semibold text-[#202223] mt-8">6. Contact Us</h2>
        <p>If you have any questions about this privacy policy or our privacy practices, please contact us.</p>
      </div>
    </div>
  );
}
