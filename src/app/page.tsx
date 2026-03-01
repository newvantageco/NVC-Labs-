import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#213052]">NVC Labs</div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-[#009d9c] transition">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-[#009d9c] transition">How It Works</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-[#009d9c] transition">Pricing</Link>
            <Link href="/login" className="text-gray-600 hover:text-[#009d9c] transition">Sign In</Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 bg-[#009d9c] text-white rounded-md hover:bg-[#00847c] transition font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-1.5 bg-[#009d9c]/10 text-[#009d9c] rounded-full text-sm font-medium">
                Trusted by UK Opticians
              </div>
              <h1 className="text-5xl font-bold text-[#213052] mb-6 leading-tight">
                AI-Powered Recall Automation for UK Opticians
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Recover lost appointments and boost revenue with intelligent patient recall campaigns.
                Reduce DNAs, save staff time, and increase practice profitability with automated AI voice calls.
              </p>

              <div className="flex gap-4 mb-8">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-[#009d9c] text-white rounded-lg hover:bg-[#00847c] transition font-semibold text-lg shadow-lg shadow-[#009d9c]/20"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-8 py-4 bg-white text-[#213052] rounded-lg hover:bg-gray-50 transition font-semibold text-lg border-2 border-gray-200"
                >
                  See How It Works
                </Link>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>GOC compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Setup in 10 minutes</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#009d9c] to-[#213052] rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-12 h-12 bg-[#009d9c]/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#009d9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#213052]">Active Campaign</div>
                      <div className="text-sm text-gray-500">High-risk lapsed patients</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#009d9c]">247</div>
                      <div className="text-xs text-gray-500">Calls Made</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">89</div>
                      <div className="text-xs text-gray-500">Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">42</div>
                      <div className="text-xs text-gray-500">Booked</div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm text-gray-600 mb-2">Conversion Rate</div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-gradient-to-r from-[#009d9c] to-green-500 h-3 rounded-full" style={{width: '47%'}}></div>
                    </div>
                    <div className="text-right text-sm font-semibold text-[#009d9c] mt-1">47%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#213052] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">40%</div>
              <div className="text-gray-300">Reduction in DNAs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-gray-300">Hours Saved Per Month</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">30%</div>
              <div className="text-gray-300">Increase in Appointments</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">£12K+</div>
              <div className="text-gray-300">Average Monthly Revenue Gain</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#213052] mb-4">
              Everything You Need to Automate Patient Recall
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Purpose-built for UK opticians. No complicated setup, no technical knowledge required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Risk Stratification",
                description: "Automatically identify high, medium, and low-risk lapsed patients based on NHS guidelines and clinical history."
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
                title: "Natural AI Voice Calls",
                description: "Human-like conversations that book appointments, answer questions, and handle objections professionally."
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Instant SMS Confirmation",
                description: "Automatic appointment confirmations sent via SMS with calendar links. Reduce no-shows effortlessly."
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "CSV Upload",
                description: "Import patient lists from Optix, Acuitas, or any PMS with a simple CSV file. No complex integrations needed."
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Full Audit Trail",
                description: "GOC-compliant audit logs with timestamps, call recordings, and consent tracking for every patient interaction."
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "GDPR Compliant",
                description: "UK data hosting, ICO registered, full GDPR compliance with patient consent management built-in."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition border border-gray-100">
                <div className="w-16 h-16 bg-[#009d9c]/10 rounded-lg flex items-center justify-center text-[#009d9c] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#213052] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#213052] mb-4">
              From CSV to Booked Appointments in 3 Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No technical knowledge required. Setup takes 10 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Upload Patient List",
                description: "Export lapsed patients from your PMS as CSV. Upload to NVC Labs. Our system automatically stratifies by risk level.",
                color: "bg-blue-500"
              },
              {
                step: "2",
                title: "Launch AI Campaign",
                description: "Select risk category (high, medium, low). Click Launch. Our AI starts calling patients with personalized scripts.",
                color: "bg-[#009d9c]"
              },
              {
                step: "3",
                title: "Track & Convert",
                description: "Monitor real-time results in your dashboard. Patients book appointments. SMS confirmations sent automatically.",
                color: "bg-green-500"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className={`w-16 h-16 ${step.color} text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg`}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-[#213052] mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>

                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-300" style={{transform: 'translateX(-50%)', width: 'calc(100% - 4rem)'}}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#213052] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your practice. No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "£149",
                description: "Perfect for single-site practices",
                features: [
                  "Up to 500 AI calls/month",
                  "CSV patient upload",
                  "SMS confirmations",
                  "Basic dashboard",
                  "Email support"
                ],
                cta: "Start Free Trial",
                highlighted: false
              },
              {
                name: "Growth",
                price: "£299",
                description: "For growing practices",
                features: [
                  "Up to 2,000 AI calls/month",
                  "Multi-location support",
                  "Advanced analytics",
                  "Priority support",
                  "Custom call scripts"
                ],
                cta: "Start Free Trial",
                highlighted: true
              },
              {
                name: "Clinical Compliance",
                price: "£349",
                description: "GOC audit-ready practices",
                features: [
                  "Unlimited AI calls",
                  "Full audit trail",
                  "Call recordings",
                  "Compliance reporting",
                  "Dedicated account manager"
                ],
                cta: "Start Free Trial",
                highlighted: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-[#009d9c] text-white shadow-2xl scale-105 border-4 border-[#00847c]'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-[#213052]'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-[#213052]'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-white/80' : 'text-gray-500'}>/month</span>
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-[#009d9c]'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={plan.highlighted ? 'text-white' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-4 rounded-lg font-semibold transition ${
                    plan.highlighted
                      ? 'bg-white text-[#009d9c] hover:bg-gray-100'
                      : 'bg-[#009d9c] text-white hover:bg-[#00847c]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#213052] to-[#009d9c]">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Recover Lost Revenue?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join UK opticians already using NVC Labs to automate patient recall and boost appointments.
          </p>
          <Link
            href="/signup"
            className="inline-block px-12 py-5 bg-white text-[#009d9c] rounded-lg hover:bg-gray-100 transition font-bold text-lg shadow-2xl"
          >
            Start Your Free Trial
          </Link>
          <p className="mt-6 text-white/70">
            Setup in 10 minutes • No credit card required • GOC compliant
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#213052] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">NVC Labs</div>
              <p className="text-gray-400">
                AI-powered patient recall automation for UK opticians.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="mailto:support@nvclabs.com" className="hover:text-white transition">support@nvclabs.com</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2026 NVC Labs. All rights reserved. Registered in England & Wales. ICO Registered.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
