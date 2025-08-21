import FeatureShowcaseContainer from "./_containers/feature-showcase";
import GettingStartedContainer from "./_containers/getting-started";
import HeroSectionContainer from "./_containers/hero-section";
import TechStackContainer from "./_containers/tech-stack";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* ヒーローセクション */}
        <HeroSectionContainer />

        {/* 機能紹介 */}
        <FeatureShowcaseContainer />

        {/* 技術スタック */}
        <TechStackContainer />

        {/* 開始方法 */}
        <GettingStartedContainer />
      </div>
    </div>
  );
}
