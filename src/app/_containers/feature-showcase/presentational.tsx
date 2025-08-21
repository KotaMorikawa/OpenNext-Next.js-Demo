import Link from "next/link";

type Feature = {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  textColor: string;
};

type FeatureShowcasePresentationProps = {
  sectionTitle: string;
  features: Feature[];
};

// Presentational Component: UIの表示のみを担当
export function FeatureShowcasePresentation({
  sectionTitle,
  features,
}: FeatureShowcasePresentationProps) {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {sectionTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={`${feature.color} border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 block group`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3
                className={`text-lg font-semibold ${feature.textColor} mb-2 group-hover:underline`}
              >
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
