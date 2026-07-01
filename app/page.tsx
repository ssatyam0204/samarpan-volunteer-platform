import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden relative">
      
      {/* 🚀 Advanced Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-6 lg:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg border border-green-600">
            S
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tighter">
            SAMARPAN.
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          {/* 🚀 FIXED: Replaced "Sign In" with "Admin Access" */}
          <Link href="/login" className="px-4 py-2 text-sm font-black text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:shadow-md transition hidden sm:flex items-center gap-2">
            🛡️ Admin Access
          </Link>
          <Link href="/register" className="px-6 py-2.5 text-sm font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32 relative">
        {/* Background decorative glowing blobs */}
        <div className="absolute top-0 left-10 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-800 font-bold text-xs uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Empowering Communities in India
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter mb-8 leading-[1.1]">
            Connect. Volunteer. <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 drop-shadow-sm">
              Make an Impact.
            </span>
          </h1>
          
          {/* 🚀 FIXED: Darker, thicker font instead of dull gray */}
          <p className="text-xl md:text-2xl text-slate-700 font-semibold max-w-3xl mx-auto mb-12 leading-relaxed">
            Samarpan bridges the gap between passionate volunteers and verified NGOs. Find local drives, track your hours, and earn stipends directly to your secure wallet.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center max-w-xl mx-auto">
            <Link href="/register" className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-lg hover:from-green-400 hover:to-emerald-500 transition shadow-xl shadow-green-500/30 flex items-center justify-center text-center hover:-translate-y-1 duration-200 border border-green-400">
              Join as Volunteer / NGO
            </Link>
            
            <Link href="/login" className="flex-1 py-4 px-6 bg-white text-gray-900 rounded-2xl font-black text-lg hover:bg-gray-50 transition border-2 border-gray-200 shadow-md hover:shadow-lg flex items-center justify-center text-center hover:-translate-y-1 duration-200">
              Login to Account
            </Link>
          </div>
          
          {/* Quick links under hero buttons */}
          <div className="mt-8 flex justify-center gap-6 text-sm font-bold text-slate-500">
            <Link href="/submit-complaint" className="hover:text-red-600 transition flex items-center gap-1">
              <span>⚠️</span> Report an Issue
            </Link>
          </div>
        </div>
      </main>

      {/* 3-Column Features Section */}
      <section className="bg-white py-24 px-6 lg:px-12 border-t border-gray-200 relative z-10 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Feature 1 */}
          <div className="p-10 bg-slate-50 rounded-[2rem] border border-gray-200 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/10 transition duration-300 group">
            <div className="text-5xl mb-8 bg-white w-20 h-20 flex items-center justify-center rounded-2xl shadow-md border border-gray-100 group-hover:scale-110 transition-transform duration-300">
              🔍
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Discover Drives</h3>
            {/* 🚀 FIXED: Darker font color */}
            <p className="text-slate-700 font-medium leading-relaxed text-lg">
              Find verified local social work opportunities tailored to your skills and location. Apply with a single click.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-10 bg-slate-50 rounded-[2rem] border border-gray-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition duration-300 group">
            <div className="text-5xl mb-8 bg-white w-20 h-20 flex items-center justify-center rounded-2xl shadow-md border border-gray-100 group-hover:scale-110 transition-transform duration-300">
              📱
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Smart Attendance</h3>
            <p className="text-slate-700 font-medium leading-relaxed text-lg">
              NGOs can instantly verify volunteer attendance on-site using our built-in secure QR code scanning engine.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-10 bg-slate-50 rounded-[2rem] border border-gray-200 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/10 transition duration-300 group">
            <div className="text-5xl mb-8 bg-white w-20 h-20 flex items-center justify-center rounded-2xl shadow-md border border-gray-100 group-hover:scale-110 transition-transform duration-300">
              💳
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Integrated Wallet</h3>
            <p className="text-slate-700 font-medium leading-relaxed text-lg">
              Receive 5-star ratings, track your stipends, and withdraw your earnings directly to your UPI bank account.
            </p>
          </div>

        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10 text-center text-sm font-bold border-t border-gray-900">
        <p>© {new Date().getFullYear()} Samarpan Platform. Final Year BSc-CS Project.</p>
      </footer>

    </div>
  )
}