import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/assets/Womimlogo.svg"
                alt="WOMIM Logo"
                width={109}
                height={89}
                className="h-12 w-auto lg:h-16"
                priority
              />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-primary transition-colors font-medium">
                Home
              </Link>
              <Link href="/" className="text-gray-900 hover:text-primary transition-colors font-medium">
                About
              </Link>
              <Link href="/" className="text-gray-900 hover:text-primary transition-colors font-medium">
                Thank You
              </Link>
            </nav>

            {/* Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/admin/login?redirect=/admin/attendance" className="hidden sm:inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium text-sm">
                Attendance
              </Link>
              <Link href="/register?redirect=/admin/register" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                Register
              </Link>
              <Link href="/admin/login" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8 lg:space-y-12">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-bold text-primary leading-tight">
                    WOMIM
                  </h1>
                  <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
                    Join the largest interdenominational choir in Ibadan
                  </h2>
                </div>
                
                <p className="text-lg lg:text-xl text-gray-600 max-w-xl">
                  Please register to be a part of the event.
                </p>

                <div className="pt-4">
                  <a href="/register" className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Register Now
                  </a>
                </div>
              </div>

              {/* Right Content - Decorative Elements */}
              <div className="relative hidden lg:block">
                <div className="relative w-full h-[600px] flex items-center justify-center">
                  {/* Large Circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/assets/rightcircle.svg"
                      alt="Decorative Circle"
                      width={669}
                      height={669}
                      className="w-full h-auto max-w-[500px] opacity-80"
                    />
                  </div>

                  {/* Dotted Patterns */}
                  <div className="absolute top-8 right-0">
                    <Image
                      src="/assets/dottedsquare.svg"
                      alt="Dotted Pattern"
                      width={59}
                      height={59}
                      className="w-12 h-12 opacity-60"
                    />
                  </div>
                  <div className="absolute bottom-32 right-0">
                    <Image
                      src="/assets/dottedsquare.svg"
                      alt="Dotted Pattern"
                      width={59}
                      height={59}
                      className="w-12 h-12 opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">
                Our Partner
              </h2>
              
              {/* Partner logos would go here */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
                {/* Placeholder for partner logos */}
                <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Partner 1</span>
                </div>
                <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Partner 2</span>
                </div>
                <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Partner 3</span>
                </div>
                <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Partner 4</span>
                </div>
                <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Partner 5</span>
                </div>
                <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Partner 6</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/assets/Womimlogo.svg"
                  alt="WOMIM Logo"
                  width={80}
                  height={65}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-300 text-sm">
                Join the largest interdenominational choir in Ibadan and be part of something extraordinary.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/thank-you" className="hover:text-white transition-colors">Thank You</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Ibadan, Nigeria</p>
                <p>Email: info@womim.org</p>
                <p>Phone: +234 XXX XXX XXXX</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 WOMIM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
