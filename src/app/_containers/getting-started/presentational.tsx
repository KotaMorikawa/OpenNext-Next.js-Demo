import Link from "next/link";

type QuickLink = {
  title: string;
  description: string;
  href: string;
  primary?: boolean;
};

type GettingStartedPresentationProps = {
  title: string;
  description: string;
  quickLinks: QuickLink[];
  githubUrl?: string;
};

// Presentational Component: UIの表示のみを担当
export function GettingStartedPresentation({
  title,
  description,
  quickLinks,
  githubUrl,
}: GettingStartedPresentationProps) {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block p-6 rounded-lg border transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              link.primary
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white border-gray-200 hover:border-blue-300"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                link.primary ? "text-white" : "text-gray-900"
              }`}
            >
              {link.title}
            </h3>
            <p
              className={`text-sm ${
                link.primary ? "text-blue-100" : "text-gray-600"
              }`}
            >
              {link.description}
            </p>
          </Link>
        ))}
      </div>

      {githubUrl && (
        <div className="text-center">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label="GitHub logo"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>
      )}
    </section>
  );
}
