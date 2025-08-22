import Image from 'next/image';
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/Womimlogo.svg"
                alt="WOMIM Logo"
                width={80}
                height={65}
                className="h-10 w-auto"
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-primary transition-colors font-medium">
                Home
              </Link>
              <Link href="/about" className="text-gray-900 hover:text-primary transition-colors font-medium">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href={'/admin/login?redirect=/admin/attendance'} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium text-sm">
                Attendance
              </Link>
              <Link href={'/register?redirect=/admin/register'} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Decorative dots - Top Left */}
        <div className="absolute top-24 left-8">
          <Image
            src="/assets/dottedsquaregreen.svg"
            alt="Decorative Pattern"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>

        {/* Decorative dots - Top Right */}
        <div className="absolute top-24 right-8">
          <Image
            src="/assets/dottedsquaregreen.svg"
            alt="Decorative Pattern"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>

        {/* Decorative dots - Center Top */}
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
          <Image
            src="/assets/dottedsquaregreen.svg"
            alt="Decorative Pattern"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        </div>

        {/* Thank You Message */}
        <div className="text-center mb-12">
          <h1 className="text-2xl lg:text-3xl text-gray-700 mb-2">
            Thank you for registering to
          </h1>
          <h2 className="text-4xl lg:text-6xl font-bold text-primary mb-8">
            WOMIM 2025
          </h2>
        </div>

        {/* Choir Graphic */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <Image
              src="/assets/thankyouforregisteringimg.svg"
              alt="WOMIM Mass Choir - Musical Instruments and Sign"
              width={600}
              height={400}
              className="w-full max-w-2xl h-auto"
              priority
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Back Home
          </Link>
        </div>

        {/* Decorative dots - Bottom Left */}
        <div className="absolute bottom-24 left-8">
          <Image
            src="/assets/dottedsquaregreen.svg"
            alt="Decorative Pattern"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>

        {/* Decorative dots - Bottom Right */}
        <div className="absolute bottom-24 right-8">
          <Image
            src="/assets/dottedsquaregreen.svg"
            alt="Decorative Pattern"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>
      </main>
    </div>
  );
}
