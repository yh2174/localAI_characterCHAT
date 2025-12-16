"use client";

import { use, useMemo, useState, useEffect, useRef } from "react";
import type { EmotionKey } from "@/types";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { getCharacter, sendMessage, getMessages, type Character, type Message } from "@/lib/api";

export default function ChatRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const characterId = parseInt(id);
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [safeMode, setSafeMode] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 캐릭터 정보 로드
  useEffect(() => {
    if (isNaN(characterId)) {
      setError("잘못된 캐릭터 ID입니다.");
      setLoadingCharacter(false);
      return;
    }
    setLoadingCharacter(true);
    setError(null);
    getCharacter(characterId)
      .then((char) => {
        setCharacter(char);
        setError(null);
      })
      .catch((err) => {
        console.error("캐릭터 로드 실패:", err);
        setError(err instanceof Error ? err.message : "캐릭터를 불러올 수 없습니다.");
        setCharacter(null);
      })
      .finally(() => {
        setLoadingCharacter(false);
      });
  }, [characterId]);

  // 기존 대화 내역 로드 (URL에 conversation_id가 있는 경우)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const convId = urlParams.get("conversation_id");
    if (convId && !isNaN(parseInt(convId))) {
      const id = parseInt(convId);
      setConversationId(id);
      getMessages(id)
        .then((msgs) => {
          setMessages(msgs);
          // 세이프 모드 상태 복원 (첫 메시지의 대화 정보에서 가져올 수 있음)
        })
        .catch((err) => console.error("메시지 로드 실패:", err));
    }
  }, []);

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading || !character) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // 사용자 메시지 즉시 표시
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      is_action: userMessage.startsWith("*") && userMessage.endsWith("*"),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await sendMessage({
        character_id: characterId,
        conversation_id: conversationId,
        safe_mode: safeMode,
        message: userMessage,
      });

      setConversationId(response.conversation_id);

      // AI 응답 추가
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.reply,
        emotion: response.emotion as EmotionKey | undefined,
        is_action: !!response.action,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "죄송해요, 지금 대화를 처리할 수 없어요. 잠시 후 다시 시도해주세요.",
        emotion: "sad",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 목록 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 현재 표시할 이미지 결정
  const currentImage = useMemo(() => {
    if (!character) return "/profile-default.png";
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last?.emotion) return character.image_default || "/profile-default.png";
    const emotionImg = character.image_by_emotion?.[last.emotion];
    return emotionImg || character.image_default || "/profile-default.png";
  }, [messages, character]);

  const renderBubble = (m: Message) => {
    const isUser = m.role === "user";
    const isAction =
      m.is_action ||
      (m.content.trim().startsWith("*") && m.content.trim().endsWith("*"));
    return (
      <div
        key={m.id}
        className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />}
        <div
          className={`max-w-xl rounded-2xl px-4 py-2 text-sm ${
            isUser
              ? "bg-slate-900 text-white dark:bg-slate-700"
              : isAction
                ? "border border-dashed border-slate-300 bg-slate-50 text-slate-700 italic dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                : "bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {m.content}
        </div>
        {isUser && <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-700" />}
      </div>
    );
  };

  // 로딩 중
  if (loadingCharacter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-slate-200"></div>
          <p className="text-slate-600 dark:text-slate-400">캐릭터 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !character) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/20">
              <svg
                className="h-8 w-8 text-rose-600 dark:text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              캐릭터를 불러올 수 없습니다
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {error || "캐릭터가 존재하지 않거나 삭제되었습니다."}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-lg bg-slate-900 px-4 py-3 text-center text-sm text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              메인 페이지로 돌아가기
            </Link>
            <Link
              href="/characters/new"
              className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              새 캐릭터 만들기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{character.name}</p>
            <h1 className="text-lg font-semibold">대화방</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
              메인으로
            </Link>
            <button
              onClick={() => setSafeMode((v) => !v)}
              className={`rounded-full px-3 py-1 ${
                safeMode ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
              }`}
            >
              세이프 모드 {safeMode ? "ON" : "OFF"}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 md:flex-row">
        <aside className="flex min-w-[240px] flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-700">
            <img
              src={currentImage}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">표정/이미지 전환</p>
            <p className="mt-1 text-slate-600">
              AI 응답의 감정 태그에 따라 이미지가 바뀝니다.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              *텍스트* 형태는 행동으로 간주해 이탤릭으로 표시합니다.
            </p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                세이프 {safeMode ? "ON" : "OFF"}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                감정 태그 기반 전환
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              `*행동*`은 대화가 아닌 행동 표현
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-slate-500 dark:text-slate-400">
                <p>대화를 시작해보세요!</p>
              </div>
            ) : (
              <>
                {messages.map((m) => renderBubble(m))}
                {isLoading && (
                  <div className="flex justify-start gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm dark:bg-slate-800">
                      <span className="inline-block animate-pulse">입력 중...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              placeholder="메시지를 입력하세요. *손을 잡으며* 와 같이 행동 표현 가능"
              className="flex-1 rounded-xl border px-4 py-3 text-sm focus:border-slate-400 focus:outline-none disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              {isLoading ? "전송 중..." : "전송"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

