// File: /app/(app)/documents/layout.tsx
import React from 'react';

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 書類関連ページに特有のラッパーやコンテキストプロバイダーなどをここに配置可能
    <div className="documents-section">
      {children}
    </div>
  );
}
