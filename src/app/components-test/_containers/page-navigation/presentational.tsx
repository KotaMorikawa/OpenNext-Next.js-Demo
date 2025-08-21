import Link from "next/link";

type PageNavigationPresentationProps = {
  navigationLinks: {
    href: string;
    label: string;
    className: string;
  }[];
};

// Presentational Component: UIの表示のみを担当
export function PageNavigationPresentation({
  navigationLinks,
}: PageNavigationPresentationProps) {
  return (
    <div className="flex justify-center space-x-4">
      {navigationLinks.map((link) => (
        <Link key={link.href} href={link.href} className={link.className}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
