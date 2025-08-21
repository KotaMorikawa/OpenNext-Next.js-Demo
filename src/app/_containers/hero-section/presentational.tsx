import Image from "next/image";

type HeroSectionPresentationProps = {
  title: string;
  subtitle: string;
  description: string;
  version: {
    nextjs: string;
    react: string;
  };
};

// Presentational Component: UIの表示のみを担当
export function HeroSectionPresentation({
  title,
  subtitle,
  description,
  version,
}: HeroSectionPresentationProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-8">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={200}
          height={41}
          priority
        />
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>

      <p className="text-xl text-blue-600 font-semibold mb-4">{subtitle}</p>

      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{description}</p>

      <div className="flex justify-center space-x-4 text-sm">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
          Next.js {version.nextjs}
        </span>
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
          React {version.react}
        </span>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
          SST 3.x
        </span>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
          TailwindCSS v4
        </span>
      </div>
    </div>
  );
}
