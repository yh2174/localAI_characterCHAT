"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { testApiConnection } from "@/lib/api";

export default function Settings() {
  const [safeMode, setSafeMode] = useState(true);
  const [nickname, setNickname] = useState("사용자");
  const [apiStatus, setApiStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setApiStatus("idle");
    try {
      const result = await testApiConnection();
      setApiStatus(result ? "ok" : "fail");
      setTimeout(() => setApiStatus("idle"), 3000);
    } catch {
      setApiStatus("fail");
      setTimeout(() => setApiStatus("idle"), 3000);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">설정</h1>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
              메인으로
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">내 프로필</h2>
          <div className="mt-3 flex flex-col gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-slate-600">닉네임</span>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">세이프 모드</h2>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <button
              onClick={() => setSafeMode((v) => !v)}
              className={`rounded-full px-3 py-1 ${
                safeMode ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
              }`}
            >
              세이프 모드 {safeMode ? "ON" : "OFF"}
            </button>
            {!safeMode && (
              <span className="text-amber-700 dark:text-amber-300">
                OFF 시 더 직접적/노골적 대화를 허용합니다.
              </span>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">대화 내역</h2>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-rose-700 hover:bg-rose-50 dark:border-slate-600 dark:text-rose-400 dark:hover:bg-rose-900/20">
              전체 삭제
            </button>
            <span className="text-slate-500 dark:text-slate-400">삭제 시 되돌릴 수 없습니다.</span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">AI API 연결 테스트</h2>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <button
              onClick={handleTest}
              disabled={testing}
              className="rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              {testing ? "테스트 중..." : "테스트 실행"}
            </button>
            {apiStatus === "ok" && (
              <span className="text-emerald-700 dark:text-emerald-400">연결 성공</span>
            )}
            {apiStatus === "fail" && <span className="text-rose-700 dark:text-rose-400">연결 실패</span>}
          </div>
        </section>
      </main>
    </div>
  );
}

