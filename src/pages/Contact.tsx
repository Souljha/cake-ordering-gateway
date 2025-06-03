import React from "react";
import Navbar from "../components/Navbar";
import { MapPin, Phone, Mail } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 mr-2 text-pink-500 flex-shrink-0 mt-1" />
                <span>
                  506/508 Sarnia Road
                  <br />
                  Seaview
                  <br />
                  Durban
                  <br />
                  4094
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-6 h-6 mr-2 text-pink-500" />
                <span>+27 73 599 9972</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-6 h-6 mr-2 text-pink-500" />
                <span>info@cakeaday.co.za</span>
              </div>
            </div>
            <form className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Our Location</h2>
            <div className="aspect-w-16 aspect-h-9">
              <img
                src="/lovable-uploads/location.JPG"
                alt="Cake A Day Location Map"
                className="rounded-md w-full h-auto object-cover"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                We are located at 506/508 Sarnia Road in the Seaview area of
                Durban.
              </p>
              <p className="mt-2">
                Open hours: Monday-Friday 8am-5pm, Saturday 9am-3pm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
