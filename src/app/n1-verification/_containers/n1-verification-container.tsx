"use client";

import { useState } from "react";
import CodeExamplesSection from "../_components/CodeExamplesSection";
import OverviewSection from "../_components/OverviewSection";
import PerformanceComparisonSection from "../_components/PerformanceComparisonSection";

export default function N1VerificationContainer() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "概要", icon: "📖" },
    { id: "performance", label: "パフォーマンス比較", icon: "📊" },
    { id: "code-examples", label: "コード例", icon: "💻" },
  ];

  return (
    <div className="space-y-8">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-8">
        {activeTab === "overview" && <OverviewSection />}
        {activeTab === "performance" && <PerformanceComparisonSection />}
        {activeTab === "code-examples" && <CodeExamplesSection />}
      </div>
    </div>
  );
}
