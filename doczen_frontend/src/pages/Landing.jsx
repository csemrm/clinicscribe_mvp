import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import StatsBar from '../components/StatsBar'
import ProblemSection from '../components/ProblemSection'
import SolutionSection from '../components/SolutionSection'
import FeaturesSection from '../components/FeaturesSection'
import HowItWorksSection from '../components/HowItWorksSection'
import DashboardPreviewSection from '../components/DashboardPreviewSection'
import SecurityTrustSection from '../components/SecurityTrustSection'
import PricingSection from '../components/PricingSection'
import TestimonialsSection from '../components/TestimonialsSection'
import FAQSection from '../components/FAQSection'
import CTASection from '../components/CTASection'
import FooterSection from '../components/FooterSection'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <section id="hero">
          <HeroSection />
        </section>

        <section id="stats">
          <StatsBar />
        </section>

        <section id="problem">
          <ProblemSection />
        </section>

        <section id="solution">
          <SolutionSection />
        </section>

        <section id="features">
          <FeaturesSection />
        </section>

        <section id="workflow">
          <HowItWorksSection />
        </section>

        <section id="dashboard">
          <DashboardPreviewSection />
        </section>

        <section id="trust">
          <SecurityTrustSection />
        </section>

        <section id="pricing">
          <PricingSection />
        </section>

        <section id="testimonials">
          <TestimonialsSection />
        </section>

        <section id="faq">
          <FAQSection />
        </section>

        <section id="cta">
          <CTASection />
        </section>

        <FooterSection />
      </main>
    </div>
  )
}
