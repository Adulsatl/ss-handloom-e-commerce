"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-yellow-50 to-green-50 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
                Get in <span className="text-yellow-600">Touch</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Have questions about our handloom products? We'd love to hear from you. Send us a message and we'll
                respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
              {/* Contact Information */}
              <div className="space-y-6 md:space-y-8">
                <div className="animate-fade-in-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Contact Information</h2>
                  <p className="text-gray-600 mb-6 md:mb-8">
                    Reach out to us through any of the following channels. We're here to help!
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {[
                    {
                      icon: MapPin,
                      title: "Address",
                      content: "Balaramapuram, Thiruvananthapuram\nKerala, India - 695501",
                      color: "text-red-500",
                    },
                    {
                      icon: Phone,
                      title: "Phone",
                      content: "+91 9876543210\n+91 9876543211",
                      color: "text-green-500",
                    },
                    {
                      icon: Mail,
                      title: "Email",
                      content: "info@ssbalaramapuram.com\nsupport@ssbalaramapuram.com",
                      color: "text-blue-500",
                    },
                    {
                      icon: Clock,
                      title: "Business Hours",
                      content: "Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM",
                      color: "text-yellow-500",
                    },
                  ].map((item, index) => (
                    <Card
                      key={item.title}
                      className="hover-lift animate-fade-in-left"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 ${item.color} flex-shrink-0`}>
                            <item.icon className="w-full h-full" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{item.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="animate-fade-in-right">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">Send us a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="mt-1"
                            placeholder="+91 0000000000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                            placeholder="What is this about?"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          className="mt-1 min-h-[120px]"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 hover-lift"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </div>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600">Quick answers to common questions</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {[
                  {
                    question: "What is the delivery time?",
                    answer:
                      "We deliver within 3-7 business days depending on your location and shipping method chosen.",
                  },
                  {
                    question: "Do you offer international shipping?",
                    answer: "Currently, we ship within India only. International shipping will be available soon.",
                  },
                  {
                    question: "What is your return policy?",
                    answer:
                      "We offer 7-day returns for unused products in original condition. Custom orders are non-returnable.",
                  },
                  {
                    question: "Are your products authentic?",
                    answer:
                      "Yes, all our products are 100% authentic handloom textiles made by skilled artisans in Balaramapuram.",
                  },
                ].map((faq, index) => (
                  <Card
                    key={index}
                    className="hover-lift animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
