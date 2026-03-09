import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import logoImageWhite from '@/assets/logoWhite.jpeg';
import type { EventLandingPageConfig } from '@/lib/eventLandingPages';
import { getEventBySlug } from '@/lib/eventLandingPages';

function ImagePlaceholder({ name }: { name: string }) {
  return (
    <div
      data-testid="image-placeholder"
      className="w-full h-64 bg-gradient-to-br from-navy/10 to-navy/30 rounded-xl flex items-center justify-center"
    >
      <span className="text-navy/40 text-lg font-medium">{name}</span>
    </div>
  );
}

function HeroSection({
  hero,
  slug,
}: {
  hero: EventLandingPageConfig['hero'];
  slug: string;
}) {
  return (
    <section className="relative min-h-[70vh] bg-gray-100">
      {hero.imagePath ? (
        <div className="absolute inset-0">
          <img
            src={hero.imagePath}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-navy/70" />
      )}

      <div className="relative z-10 flex items-center min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10 lg:p-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {hero.headline}
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 mb-2 leading-relaxed whitespace-pre-line">
                {hero.subheadline}
              </p>
              <p className="text-base text-gray-300 mb-8">{hero.description}</p>
              <a
                href={`/go/${slug}`}
                className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-center"
              >
                {hero.ctaText}
              </a>
              {hero.subtleNote && (
                <p className="text-gray-400 mt-4 text-sm italic">
                  {hero.subtleNote}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContentSection({
  section,
  slug,
  eventName,
}: {
  section: EventLandingPageConfig['sections'][number];
  slug: string;
  eventName: string;
}) {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {section.title && (
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            {section.title}
          </h2>
        )}

        {section.body.length > 0 && (
          <div className="space-y-4 mb-8">
            {section.body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-lg text-gray-600 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {section.imagePath !== undefined &&
          (section.imagePath ? (
            <img
              src={section.imagePath}
              alt=""
              className="w-full rounded-xl mb-8"
            />
          ) : (
            <div className="mb-8">
              <ImagePlaceholder name={eventName} />
            </div>
          ))}

        {section.steps && section.steps.length > 0 && (
          <div className="space-y-6 mb-8">
            {section.steps.map((step, index) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-gray-600">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {section.bullets && section.bullets.length > 0 && (
          <ul className="space-y-3 mb-8">
            {section.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-3 text-lg text-gray-600"
              >
                <span className="text-navy">•</span>
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {section.cta && (
          <div className="text-center mt-8">
            <a
              href={`/go/${slug}`}
              className="inline-block px-8 py-3 bg-navy text-white rounded-lg hover:bg-navy/90 font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {section.cta.text}
            </a>
            {section.cta.subtleNote && (
              <p className="text-gray-500 mt-3 text-sm italic">
                {section.cta.subtleNote}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function EventLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const config = slug ? getEventBySlug(slug) : undefined;

  useEffect(() => {
    if (!config) return;

    document.title = config.seo.title;

    const metaTags = [
      { name: 'description', content: config.seo.description },
      { property: 'og:title', content: config.seo.title },
      { property: 'og:description', content: config.seo.description },
      { property: 'og:type', content: 'website' },
      {
        property: 'og:url',
        content: `${window.location.origin}/events/${config.slug}`,
      },
    ];

    const createdElements: HTMLMetaElement[] = [];
    const originalValues: [Element, string][] = [];

    for (const tag of metaTags) {
      const selector = tag.name
        ? `meta[name="${tag.name}"]`
        : `meta[property="${tag.property}"]`;
      const existing = document.querySelector(selector);
      if (existing) {
        originalValues.push([existing, existing.getAttribute('content') ?? '']);
        existing.setAttribute('content', tag.content);
      } else {
        const el = document.createElement('meta');
        if (tag.name) el.setAttribute('name', tag.name);
        if (tag.property) el.setAttribute('property', tag.property);
        el.setAttribute('content', tag.content);
        document.head.appendChild(el);
        createdElements.push(el);
      }
    }

    return () => {
      document.title = 'SplitStay';
      for (const el of createdElements) el.remove();
      for (const [el, original] of originalValues) {
        el.setAttribute('content', original);
      }
    };
  }, [config]);

  if (!config) {
    console.warn(`Event landing page not found for slug: "${slug}"`);
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logoImageWhite}
                alt="SplitStay"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-navy">SplitStay</span>
            </Link>
            <a
              href={`/go/${config.slug}`}
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors font-medium text-sm sm:text-base"
            >
              {config.hero.ctaText}
            </a>
          </div>
        </div>
      </header>

      <main>
        <HeroSection hero={config.hero} slug={config.slug} />

        {config.sections.map((section) => (
          <ContentSection
            key={section.title || section.body[0]}
            section={section}
            slug={config.slug}
            eventName={config.name}
          />
        ))}
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} SplitStay
          </p>
        </div>
      </footer>
    </div>
  );
}
