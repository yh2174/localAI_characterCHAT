"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const mockHistory = [
  { id: 1, characterName: "하린", preview: "오늘 카페 가자고 했어", safeMode: true },
  { id: 2, characterName: "민재", preview: "새로운 게임 얘기 중", safeMode: false },
];

export default function History() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">대화 내역</h1>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
              메인으로
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>최근 대화 목록</span>
            <button className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300">
              전체 삭제
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
            {mockHistory.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{h.characterName}</p>
                  <p className="text-slate-500 dark:text-slate-400">{h.preview}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      h.safeMode
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
                    }`}
                  >
                    세이프 {h.safeMode ? "ON" : "OFF"}
                  </span>
                  <Link
                    href={`/chat/${h.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    다시 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

