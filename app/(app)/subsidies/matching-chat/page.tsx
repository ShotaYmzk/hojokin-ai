// File: /app/(app)/subsidies/matching-chat/page.tsx
"use client"; // クライアントコンポーネントとしてマーク

import React, { useState, useRef, useEffect } from "react";
// FontAwesomeのアイコンを使用しているため、セットアップが必要です。
// 例: import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPauseCircle, faTimesCircle, faPaperPlane, faCalendarAlt, faChevronRight, faFilter, faFileAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

// HeroUIのコンポーネントを使用する場合は適宜インポート
// import { Button } from "@heroui/button";
// import { Input } from "@heroui/input";
// import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";

// 型定義 (必要に応じて /types/domain.ts などに移動)
interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
  timestamp: string;
  options?: string[];
}

interface CompanyInfo {
  name: string;
  industry: string;
  employees: string;
}

interface Grant {
  id: number;
  name: string;
  description: string;
  matchRate: number;
  deadline: string;
  details?: {
    conditions: string[];
    subsidyRate: string;
    maxAmount: string;
    requiredDocs: string[];
    applicationSteps: string[];
  };
}

const MatchingChatPage: React.FC = () => {
  // コンポーネント名を変更 (例: MatchingChatPage)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "こんにちは！補助金・助成金申請サポートAIです。まずは、あなたの会社について教えてください。",
      sender: "ai",
      timestamp: "14:30",
    },
    {
      id: 2,
      text: "業種を選択してください。",
      sender: "ai",
      timestamp: "14:30",
      options: [
        "製造業",
        "IT・通信",
        "小売・卸売",
        "飲食・サービス",
        "建設・不動産",
        "その他",
      ],
    },
  ]);
  const [inputText, setInputText] = useState("");
  // ▼▼▼ 修正箇所 ▼▼▼
  const [_companyInfo] = useState<CompanyInfo>({
  // ▲▲▲ 修正箇所 ▲▲▲
    name: "株式会社テクノソリューション",
    industry: "IT・通信",
    employees: "25名",
  });
  const [progress, setProgress] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showModal, setShowModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim() === "" && !selectedOption) return;
    const messageText = selectedOption || inputText;

    const newUserMessage: Message = {
      // 型を明示
      id: Date.now(), // IDの重複を避けるためDate.now()などを使用
      text: messageText,
      sender: "user" as const,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    // setMessages((prev) => [...prev, newUserMessage]); // AIの応答とまとめて更新した方が自然な場合も

    setInputText("");
    setSelectedOption(null);

    // ユーザーメッセージを追加した直後にAIの応答をシミュレート
    // 実際のアプリケーションではAPIを呼び出す
    setMessages((prev) => [...prev, newUserMessage]); // ユーザーメッセージをまず表示

    setTimeout(() => {
      let aiResponses: Message[] = []; // 複数のメッセージを返す場合も考慮
      let newProgress = progress;

      if (messageText === "製造業" || messageText === "IT・通信") {
        aiResponses.push({
          id: Date.now() + 1,
          text: `${messageText}ですね。従業員数を教えてください。`,
          sender: "ai" as const,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          options: [
            "10名未満",
            "10〜30名",
            "31〜50名",
            "51〜100名",
            "101名以上",
          ],
        });
        newProgress = 30;
      } else if (messageText.includes("名")) {
        aiResponses.push({
          id: Date.now() + 1,
          text: "創業年数を教えてください。",
          sender: "ai" as const,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          options: ["1年未満", "1〜3年", "3〜5年", "5〜10年", "10年以上"],
        });
        newProgress = 45;
      } else {
        // この条件分岐は実際のAIロジックに依存します
        aiResponses.push({
          id: Date.now() + 1,
          text: "ありがとうございます。あなたの会社に最適な補助金を検索しています...",
          sender: "ai" as const,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        newProgress = 60;
        // Simulate finding grants after a delay
        setTimeout(() => {
          const grantsFoundMessage: Message = {
            id: Date.now() + 2,
            text: "あなたの会社に合った補助金が見つかりました！右側のパネルで確認できます。",
            sender: "ai" as const,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setMessages((prev) => [...prev, grantsFoundMessage]);
          setProgress(100); // 検索完了で100%
        }, 2000);
      }
      if (aiResponses.length > 0) {
        setMessages((prev) => [...prev, ...aiResponses]);
      }
      setProgress(newProgress);
    }, 1000);
  };

  const handleOptionClick = (option: string) => {
    // オプションクリック時は即座にユーザーメッセージとして処理
    const newUserMessage: Message = {
      id: Date.now(),
      text: option,
      sender: "user" as const,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    // AIの応答をトリガー
    // AI応答ロジックは handleSendMessage 内のsetTimeout部分を関数化して再利用する
    // ここでは簡略化のため、直接AI応答をシミュレート
    // (実際は handleSendMessage(option) のような形になるか、状態を更新してuseEffectで応答をトリガー)
    // 例:
    // setSelectedOption(option); // これをトリガーにuseEffectでAI応答を呼ぶ
    // handleSendMessage(); // ただし、入力テキストは空なので、optionを渡すように修正が必要

    // ここで直接AIの応答をシミュレート（handleSendMessage内のロジックを参考に）
    setTimeout(() => {
      let aiResponses: Message[] = [];
      let newProgress = progress;

      if (option === "製造業" || option === "IT・通信") {
        aiResponses.push({
          id: Date.now() + 1,
          text: `${option}ですね。従業員数を教えてください。`,
          sender: "ai" as const,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          options: [
            "10名未満",
            "10〜30名",
            "31〜50名",
            "51〜100名",
            "101名以上",
          ],
        });
        newProgress = 30;
      } else if (option.includes("名")) {
        aiResponses.push({
          id: Date.now() + 1,
          text: "創業年数を教えてください。",
          sender: "ai" as const,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          options: ["1年未満", "1〜3年", "3〜5年", "5〜10年", "10年以上"],
        });
        newProgress = 45;
      } else {
        aiResponses.push({
          id: Date.now() + 1,
          text: "ありがとうございます。あなたの会社に最適な補助金を検索しています...",
          sender: "ai" as const,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        newProgress = 60;
        setTimeout(() => {
          const grantsFoundMessage: Message = {
            id: Date.now() + 2,
            text: "あなたの会社に合った補助金が見つかりました！右側のパネルで確認できます。",
            sender: "ai" as const,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setMessages((prev) => [...prev, grantsFoundMessage]);
          setProgress(100);
        }, 2000);
      }
      if (aiResponses.length > 0) {
        setMessages((prev) => [...prev, ...aiResponses]);
      }
      setProgress(newProgress);
    }, 1000);
  };

  const grantsData: Grant[] = [
    // 型を明示し、変数名を変更
    {
      id: 1,
      name: "IT導入補助金2025",
      description: "ITツール導入による生産性向上を支援する補助金制度",
      matchRate: 95,
      deadline: "2025年6月30日",
      details: {
        conditions: ["条件A", "条件B"],
        subsidyRate: "2/3",
        maxAmount: "100万円",
        requiredDocs: ["申請書", "決算書"],
        applicationSteps: ["書類準備", "申請", "審査", "交付"],
      },
    },
    {
      id: 2,
      name: "事業再構築補助金",
      description: "ビジネスモデルの転換や新分野展開を支援",
      matchRate: 85,
      deadline: "2025年7月15日",
      details: {
        conditions: ["条件C", "条件D"],
        subsidyRate: "1/2",
        maxAmount: "50万円",
        requiredDocs: ["事業計画書", "財務諸表"],
        applicationSteps: ["書類準備", "申請", "審査", "交付"],
      },
    },
    {
      id: 3,
      name: "小規模事業者持続化補助金",
      description: "小規模事業者の販路開拓等の取り組みを支援",
      matchRate: 78,
      deadline: "2025年8月10日",
      details: {
        conditions: ["条件E", "条件F"],
        subsidyRate: "1/3",
        maxAmount: "30万円",
        requiredDocs: ["事業計画書", "財務諸表"],
        applicationSteps: ["書類準備", "申請", "審査", "交付"],
      },
    },
  ];

  const handleGrantDetails = (grant: Grant) => {
    setSelectedGrant(grant);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGrant(null); // モーダルを閉じるときに選択された補助金もリセット
  };

  return (
    // ここにJSXを記述。提供されたコードの<div className="flex flex-col min-h-screen ..."> から </div> まで。
    // アイコン部分 (<i className="...">) はFontAwesomeIconコンポーネントに置き換えるか、
    // HeroUIのIconコンポーネントやSVGアイコンを使用するように変更が必要です。
    // 例: <FontAwesomeIcon icon={faPauseCircle} className="mr-2" />
    // またはHeroUIのアイコンを使う場合 <Button startContent={<PauseIcon />}>セッション中断</Button>
    // Tailwind CSSのクラス名はそのまま利用できます。
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] bg-gray-50 font-sans">
      {/* ヘッダー (このページ専用のヘッダー。共通レイアウトのヘッダーとは別) */}
      <header className="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between w-full">
          <div className="text-2xl font-bold text-primary">
            補助金AIチャット
          </div>{" "}
          {/* HeroUIのカラーを使用 */}
          <div className="flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-lg">
            {" "}
            {/* HeroUIのカラーを使用 */}
            <div className="text-sm text-foreground-600">会社情報:</div>{" "}
            {/* HeroUIのカラーを使用 */}
            <div className="text-sm font-medium text-foreground-800">
              {_companyInfo.name}
            </div>{" "}
            {/* HeroUIのカラーを使用 */}
            <div className="text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-md">
              {" "}
              {/* HeroUIのカラーを使用 */}
              {_companyInfo.industry}
            </div>
            <div className="text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-md">
              {" "}
              {/* HeroUIのカラーを使用 */}
              {_companyInfo.employees}
            </div>
          </div>
          <button className="bg-danger hover:bg-danger-600 text-white px-4 py-2 rounded-md whitespace-nowrap cursor-pointer flex items-center">
            {" "}
            {/* HeroUIのカラーとButtonコンポーネント推奨 */}
            {/* <FontAwesomeIcon icon={faPauseCircle} className="mr-2" /> */}
            <span className="mr-2">⚠️</span> {/* 絵文字で代用 or SVG */}
            セッション中断
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* チャットエリア */}
        <div className="w-8/12 flex flex-col bg-background border-r border-divider">
          {" "}
          {/* HeroUIのカラーを使用 */}
          <div className="p-4 bg-content1 border-b border-divider">
            {" "}
            {/* HeroUIのカラーを使用 */}
            <h2 className="text-lg font-semibold text-foreground">
              補助金マッチングチャット
            </h2>
            <p className="text-sm text-foreground-500">
              AIがあなたに最適な補助金を見つけます
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg p-3 shadow ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground" // HeroUIのカラー
                      : "bg-content2 text-foreground" // HeroUIのカラー
                  }`}
                >
                  <div className="text-sm">{message.text}</div>
                  {message.options && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option) => (
                        <button // HeroUIのButton推奨
                          key={option}
                          className="bg-background text-primary border border-primary-300 px-3 py-1.5 rounded-md text-sm hover:bg-primary-50 whitespace-nowrap cursor-pointer"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="text-xs mt-1 opacity-70 text-right">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* 入力エリア */}
          <div className="p-4 border-t border-divider bg-background">
            {" "}
            {/* HeroUIのカラー */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input // HeroUIのInput推奨
                  className="w-full border border-default-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1" // HeroUIのスタイルに寄せる
                  placeholder="メッセージを入力..."
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                {inputText && ( // 入力時のみクリアボタン表示
                  <button // HeroUIのButton推奨 (iconOnly)
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-400 hover:text-foreground-600 cursor-pointer"
                    onClick={() => setInputText("")}
                  >
                    {/* <FontAwesomeIcon icon={faTimesCircle} /> */}
                    <span>✕</span> {/* 絵文字で代用 or SVG */}
                  </button>
                )}
              </div>
              <button // HeroUIのButton推奨
                className="bg-primary hover:bg-primary-600 text-primary-foreground p-3 rounded-md cursor-pointer disabled:opacity-50" // HeroUIのスタイル
                disabled={inputText.trim() === "" && !selectedOption} // ボタンの無効化
                onClick={handleSendMessage}
              >
                {/* <FontAwesomeIcon icon={faPaperPlane} /> */}
                <span>➤</span> {/* 絵文字で代用 or SVG */}
              </button>
            </div>
          </div>
        </div>

        {/* サイドパネル */}
        <div className="w-4/12 bg-content1 flex flex-col">
          {" "}
          {/* HeroUIのカラー */}
          <div className="p-4 bg-background border-b border-divider">
            {" "}
            {/* HeroUIのカラー */}
            <h2 className="text-lg font-semibold text-foreground">
              ヒアリング進捗
            </h2>
            <div className="mt-2">
              <div className="w-full bg-default-200 rounded-full h-2.5">
                {" "}
                {/* HeroUIのカラー */}
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" // HeroUIのカラー
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-foreground-500 mt-1">
                <span>基本情報</span>
                <span>詳細情報</span>
                <span>補助金検索</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              おすすめ補助金
            </h3>
            <div className="space-y-4">
              {grantsData.map(
                (
                  grant, // grants -> grantsData
                ) => (
                  <div
                    key={grant.id}
                    className="bg-background rounded-lg shadow-sm border border-divider p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-medium text-foreground-900">
                        {grant.name}
                      </h4>
                      <div className="bg-success-100 text-success-800 text-xs px-2 py-1 rounded-full">
                        {" "}
                        {/* HeroUIのカラー */}
                        マッチ度 {grant.matchRate}%
                      </div>
                    </div>
                    <p className="text-sm text-foreground-600 mt-2">
                      {grant.description}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-danger-600">
                        {" "}
                        {/* HeroUIのカラー */}
                        <span className="mr-1">📅</span>
                        申請期限: {grant.deadline}
                      </div>
                      <button // HeroUIのLink as Button推奨
                        className="text-primary hover:text-primary-focus text-sm font-medium cursor-pointer"
                        onClick={() => handleGrantDetails(grant)}
                      >
                        <span className="ml-1">❯</span>
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="mt-6">
              <button className="w-full bg-default-100 hover:bg-default-200 text-foreground-700 font-medium py-2 px-4 rounded-md border border-default-300 whitespace-nowrap cursor-pointer">
                {" "}
                {/* HeroUIのButton推奨 */}
                <span className="mr-2">🔧</span>
                絞り込み検索
              </button>
            </div>
          </div>
          <div className="p-4 bg-background border-t border-divider">
            {" "}
            {/* HeroUIのカラー */}
            {/* readdyのリンクはNext.jsのLinkコンポーネントに置き換えるか、通常のaタグで外部リンクとして扱う */}
            <a
              href="https://readdy.ai/home/b567d0ef-eefa-47ef-9459-956aa5b00bca/0c12e8a5-affc-450a-8c4d-289e039a2dba" // このリンクは開発環境では動作しない可能性あり
              rel="noopener noreferrer"
              target="_blank" // 外部リンクの場合は target="_blank"
            >
              <button className="w-full bg-success hover:bg-success-600 text-success-foreground font-medium py-3 px-4 rounded-md whitespace-nowrap cursor-pointer">
                {" "}
                {/* HeroUIのButton推奨 */}
                <span className="mr-2">📄</span>
                申請書類作成に進む
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* 補助金詳細モーダル (HeroUIのModalコンポーネントを使用することを強く推奨) */}
      {showModal && selectedGrant && (
        // <Modal isOpen={showModal} onClose={closeModal} size="4xl" scrollBehavior="inside">
        //   <ModalContent>
        //     <ModalHeader>
        //       <div className="flex justify-between items-center w-full">
        //         <h3 className="text-xl font-bold text-foreground">
        //           {selectedGrant.name}
        //         </h3>
        //         <Button isIconOnly variant="light" onPress={closeModal} aria-label="閉じる">
        //           {/* <FontAwesomeIcon icon={faTimes} className="text-xl" /> */}
        //           <span>✕</span>
        //         </Button>
        //       </div>
        //       <div className="flex items-center mt-2 space-x-3">
        //          <div className="bg-success-100 text-success-800 text-sm px-3 py-1 rounded-full">
        //            マッチ度 {selectedGrant.matchRate}%
        //          </div>
        //          <div className="text-sm text-danger-600">
        //            <span className="mr-1">📅</span>
        //            申請期限: {selectedGrant.deadline}
        //          </div>
        //        </div>
        //     </ModalHeader>
        //     <ModalBody>
        //        {/* モーダルの中身 (selectedGrant.details を表示) */}
        //     </ModalBody>
        //     <ModalFooter>
        //        <Button variant="bordered" onPress={closeModal}>閉じる</Button>
        //        <a href="..."> {/* 申請書類作成へのリンク */}
        //          <Button color="success">この補助金の申請書類作成に進む</Button>
        //        </a>
        //     </ModalFooter>
        //   </ModalContent>
        // </Modal>
        // ↓現状のコードをベースにしたもの (HeroUIのモーダルに置き換え推奨)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-divider">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-foreground">
                  {selectedGrant.name}
                </h3>
                <button
                  className="text-foreground-500 hover:text-foreground-700 cursor-pointer"
                  onClick={closeModal}
                >
                  {/* <FontAwesomeIcon icon={faTimes} className="text-xl" /> */}
                  <span>✕</span>
                </button>
              </div>
              <div className="flex items-center mt-2 space-x-3">
                <div className="bg-success-100 text-success-800 text-sm px-3 py-1 rounded-full">
                  マッチ度 {selectedGrant.matchRate}%
                </div>
                <div className="text-sm text-danger-600">
                  <span className="mr-1">📅</span>
                  申請期限: {selectedGrant.deadline}
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground-800 mb-2">
                  補助金概要
                </h4>
                <p className="text-foreground-700">
                  {selectedGrant.description}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground-800 mb-2">
                  申請条件
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-foreground-700">
                  {selectedGrant.details?.conditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-foreground-800 mb-2">
                    補助率
                  </h4>
                  <p className="text-foreground-700">
                    {selectedGrant.details?.subsidyRate}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground-800 mb-2">
                    上限額
                  </h4>
                  <p className="text-foreground-700">
                    {selectedGrant.details?.maxAmount}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground-800 mb-2">
                  必要書類
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-foreground-700">
                  {selectedGrant.details?.requiredDocs.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div>
                {" "}
                {/* mb-6 を削除してフッターボタンとの間隔を調整 */}
                <h4 className="text-lg font-semibold text-foreground-800 mb-2">
                  申請手順
                </h4>
                <ol className="list-decimal pl-5 space-y-2 text-foreground-700">
                  {selectedGrant.details?.applicationSteps.map(
                    (step, index) => <li key={index}>{step}</li>,
                  )}
                </ol>
              </div>
            </div>

            <div className="p-6 border-t border-divider bg-content2 flex justify-between items-center">
              <button // HeroUIのButton推奨
                className="text-foreground-700 hover:text-foreground-900 font-medium py-2 px-4 border border-default-300 rounded-md whitespace-nowrap cursor-pointer"
                onClick={closeModal}
              >
                閉じる
              </button>
              {/* ▼▼▼ 修正箇所 ▼▼▼ */}
              <a
                href="https://readdy.ai/home/b567d0ef-eefa-47ef-9459-956aa5b00bca/0c12e8a5-affc-450a-8c4d-289e039a2dba"
                rel="noopener noreferrer"
                target="_blank"
              >
              {/* ▲▲▲ 修正箇所 ▲▲▲ */}
                <button className="bg-success hover:bg-success-600 text-success-foreground font-medium py-2 px-4 rounded-md whitespace-nowrap cursor-pointer flex items-center">
                  <span className="mr-2">📄</span>
                  この補助金の申請書類作成に進む
                </button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingChatPage; // エクスポートするコンポーネント名を変更