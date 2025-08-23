interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <main className="mb-8">
      <div className="prose prose-lg max-w-none">
        {content.split("\n").map((line, index) => {
          // 簡易的なマークダウン風パース
          const lineKey = `line-${index}-${line.slice(0, 10)}`;

          if (line.startsWith("## ")) {
            return (
              <h2
                key={lineKey}
                className="text-2xl font-bold text-gray-900 mt-8 mb-4"
              >
                {line.substring(3)}
              </h2>
            );
          }

          if (line.startsWith("### ")) {
            return (
              <h3
                key={lineKey}
                className="text-xl font-semibold text-gray-900 mt-6 mb-3"
              >
                {line.substring(4)}
              </h3>
            );
          }

          if (line.trim() === "") {
            return <br key={lineKey} />;
          }

          return (
            <p key={lineKey} className="text-gray-700 leading-relaxed mb-4">
              {line}
            </p>
          );
        })}
      </div>
    </main>
  );
}
