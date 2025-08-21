type Props = {
  createdAt: Date | null;
  updatedAt?: Date | null;
};

export default function TaskMetaInfo({ createdAt, updatedAt }: Props) {
  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      {createdAt && (
        <>
          <span>作成: {new Date(createdAt).toLocaleDateString()}</span>
          {updatedAt && createdAt !== updatedAt && (
            <>
              <span className="text-gray-400">•</span>
              <span>更新: {new Date(updatedAt).toLocaleDateString()}</span>
            </>
          )}
        </>
      )}
    </div>
  );
}
