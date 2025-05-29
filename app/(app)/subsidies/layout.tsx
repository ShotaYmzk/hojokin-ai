// File: /app/(app)/subsidies/layout.tsx
import React from 'react';

export default function SubsidiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 補助金関連ページに特有のラッパーやコンテキストプロバイダーなどをここに配置可能
    // 例えば、検索条件を保持するContext Providerなど
    <div className="subsidies-section-wrapper">
      {children}
    </div>
  );
}
