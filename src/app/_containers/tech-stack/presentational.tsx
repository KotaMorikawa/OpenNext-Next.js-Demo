type TechItem = {
  name: string;
  version: string;
  description: string;
  category: string;
};

type TechStackPresentationProps = {
  title: string;
  subtitle: string;
  categories: {
    [key: string]: TechItem[];
  };
};

// Presentational Component: UIの表示のみを担当
export function TechStackPresentation({
  title,
  subtitle,
  categories,
}: TechStackPresentationProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(categories).map(([categoryName, techs]) => (
          <div key={categoryName} className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {categoryName}
            </h3>
            <div className="space-y-3">
              {techs.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {tech.name}
                      </span>
                      <span className="text-sm text-blue-600 font-mono">
                        {tech.version}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
