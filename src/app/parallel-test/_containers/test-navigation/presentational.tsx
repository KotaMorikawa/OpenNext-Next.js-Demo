import Link from "next/link";

type TestLink = {
  href: string;
  icon: string;
  title: string;
  description: string;
};

type TestNavigationPresentationProps = {
  testLinks: TestLink[];
  sectionTitle: string;
};

// Presentational Component: UIの表示のみを担当
export function TestNavigationPresentation({
  testLinks,
  sectionTitle,
}: TestNavigationPresentationProps) {
  return (
    <div className="border-t pt-6">
      <h4 className="font-medium text-gray-900 mb-4">{sectionTitle}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {testLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">
              {link.icon} {link.title}
            </div>
            <div className="text-sm text-gray-600 mt-1">{link.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
