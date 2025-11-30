'use client';

/**
 * Company Logos Component
 * Show which companies/creators use ClipForge
 * 
 * Features:
 * - Scrolling logo carousel
 * - Grayscale with hover color
 * - Responsive grid
 * - Social proof
 */

const COMPANIES = [
  { name: 'TechCrunch', logo: '/logos/techcrunch.svg' },
  { name: 'Product Hunt', logo: '/logos/producthunt.svg' },
  { name: 'Forbes', logo: '/logos/forbes.svg' },
  { name: 'Entrepreneur', logo: '/logos/entrepreneur.svg' },
  { name: 'Fast Company', logo: '/logos/fastcompany.svg' },
  { name: 'Inc.', logo: '/logos/inc.svg' },
];

export default function CompanyLogos() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Featured In
          </p>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {COMPANIES.map((company, index) => (
            <div
              key={index}
              className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <div className="text-2xl font-bold text-gray-400 hover:text-gray-900">
                {company.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
