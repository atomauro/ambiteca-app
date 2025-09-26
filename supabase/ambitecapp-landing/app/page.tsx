import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { PromotionalBanner } from "@/components/promotional-banner"
import { OnboardingSection } from "@/components/onboarding-section"
import { MaterialsSection } from "@/components/materials-section"
import { BenefitsSection } from "@/components/benefits-section"
import { RewardsSection } from "@/components/rewards-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PromotionalBanner />
        <OnboardingSection />
        <MaterialsSection />
        <BenefitsSection />
        <RewardsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
