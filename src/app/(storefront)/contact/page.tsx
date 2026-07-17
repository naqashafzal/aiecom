"use client";

import { useState } from "react";
import { submitContactMessage } from "../actions";
import { MapPin, Store, Phone } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const res = await submitContactMessage(formData);
    
    if (res.success) {
      setStatus("success");
      e.currentTarget.reset();
    } else {
      setStatus("error");
      setErrorMessage(res.error || "Failed to submit message.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Get in Touch</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have a question about products, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* Contact Information */}
          <div className="lg:col-span-2 bg-gray-900 p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white opacity-5"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white opacity-5"></div>

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-10">Contact Information</h3>
              
              <div className="space-y-10">
                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-full mr-5 shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Head Office</h4>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                      Kh no 1091 Main road Wassan Pura<br />
                      Lahore, Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-full mr-5 shrink-0">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Display Center</h4>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                      Ayan Plaza Basement<br />
                      ShahAlam Market<br />
                      Lahore, Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white/10 p-3 rounded-full mr-5 shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Contact Numbers</h4>
                    <div className="text-gray-300 space-y-2 text-sm md:text-base font-medium">
                      <p>0317 4567281</p>
                      <p>0326 6304583</p>
                      <p>0322 89 22220</p>
                      <p>0312 9222200</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-gray-800 relative z-10">
              <p className="text-sm text-gray-400">
                Our support team is available during regular business hours to assist you.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 p-10 lg:p-14 bg-white">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Send us a message</h3>
            
            {status === "success" && (
              <div className="mb-8 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-center shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 shrink-0"></div>
                Thank you! Your message has been sent successfully. We will be in touch soon.
              </div>
            )}
            
            {status === "error" && (
              <div className="mb-8 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 shadow-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input type="text" name="name" id="name" required placeholder="John Doe" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm h-12 px-4 border bg-gray-50 hover:bg-white outline-none transition-colors" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input type="email" name="email" id="email" required placeholder="john@example.com" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm h-12 px-4 border bg-gray-50 hover:bg-white outline-none transition-colors" />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input type="text" name="subject" id="subject" placeholder="How can we help?" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm h-12 px-4 border bg-gray-50 hover:bg-white outline-none transition-colors" />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea id="message" name="message" rows={6} required placeholder="Write your message here..." className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-4 border bg-gray-50 hover:bg-white outline-none transition-colors resize-none"></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="w-full sm:w-auto px-10 flex justify-center py-3.5 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {status === "submitting" ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
