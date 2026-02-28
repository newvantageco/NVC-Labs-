import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8">NVC Labs</h1>
          <p className="text-2xl mb-8 text-gray-600">
            AI Recall Platform for UK Opticians
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto text-gray-500">
            Automate patient recall and appointment booking with intelligent AI voice calls.
            Recover missed revenue and improve patient retention.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Automated Recalls</h3>
              <p className="text-gray-600">
                AI-powered outbound calls to lapsed patients with natural conversation
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Smart Booking</h3>
              <p className="text-gray-600">
                Voice and keypad options for seamless appointment scheduling
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold mb-2">GDPR Compliant</h3>
              <p className="text-gray-600">
                Full compliance with UK data protection and ICO guidelines
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
