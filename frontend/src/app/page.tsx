/* 메인 캐릭터 선택 화면 */

"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { Character } from "@/types";
import ThemeToggle from "@/components/ThemeToggle";
import { getCharacters, type Character as ApiCharacter } from "@/lib/api";

type Filters = {
  gender: string;
  minAge: number;
  maxAge: number;
  keyword: string;
};

export default function Home() {
  const [characters, setCharacters] = useState<ApiCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    gender: "all",
    minAge: 18,
    maxAge: 35,
    keyword: "",
  });
  const [selected, setSelected] = useState<ApiCharacter | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCharacters()
      .then((data) => {
        setCharacters(data);
        setError(null);
      })
      .catch((err) => {
        console.error("캐릭터 로드 실패:", err);
        setError(err instanceof Error ? err.message : "캐릭터 목록을 불러올 수 없습니다.");
        setCharacters([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      const genderOk = filters.gender === "all" || c.gender === filters.gender;
      const ageOk =
        (c.age ?? 0) >= filters.minAge && (c.age ?? 0) <= filters.maxAge;
      const text = `${c.name} ${c.bio ?? ""} ${c.description ?? ""} ${(
        c.hashtags ?? []
      ).join(" ")}`;
      const keywordOk = text.toLowerCase().includes(filters.keyword.toLowerCase());
      return genderOk && ageOk && keywordOk;
    });
  }, [filters, characters]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm text-slate-500">AI 이미지 캐릭터 채팅</p>
            <h1 className="text-xl font-semibold">Companion Lounge</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Link href="/history" className="hover:text-slate-900 dark:hover:text-slate-200">
              대화 내역
            </Link>
            <Link href="/settings" className="hover:text-slate-900 dark:hover:text-slate-200">
              설정
            </Link>
            <Link
              href="/characters/new"
              className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              캐릭터 추가
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={filters.gender}
              onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
            >
              <option value="all">성별 전체</option>
              <option value="여성">여성</option>
              <option value="남성">남성</option>
            </select>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <label className="text-slate-700">나이</label>
              <input
                type="number"
                className="w-16 rounded border px-2 py-1"
                value={filters.minAge}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minAge: Number(e.target.value) || 0 }))
                }
              />
              <span>~</span>
              <input
                type="number"
                className="w-16 rounded border px-2 py-1"
                value={filters.maxAge}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxAge: Number(e.target.value) || 100 }))
                }
              />
            </div>
            <input
              type="search"
              placeholder="이름, 해시태그 검색"
              className="w-64 flex-1 min-w-48 rounded-lg border px-3 py-2 text-sm"
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-slate-600 dark:text-slate-400">
              <div className="mb-2 inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-slate-200"></div>
              <p className="mt-2">캐릭터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800 dark:bg-rose-900/20">
              <div className="mb-2 text-rose-600 dark:text-rose-400">
                <svg
                  className="mx-auto h-12 w-12"
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
              <h3 className="mb-2 text-lg font-semibold text-rose-900 dark:text-rose-200">
                캐릭터를 불러올 수 없습니다
              </h3>
              <p className="mb-4 text-sm text-rose-700 dark:text-rose-300">{error}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    getCharacters()
                      .then((data) => {
                        setCharacters(data);
                        setError(null);
                      })
                      .catch((err) => {
                        setError(err instanceof Error ? err.message : "캐릭터 목록을 불러올 수 없습니다.");
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
                >
                  다시 시도
                </button>
                <Link
                  href="/characters/new"
                  className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-center text-sm text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-slate-700"
                >
                  새 캐릭터 만들기
                </Link>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                조건에 맞는 캐릭터가 없습니다.
              </p>
              <Link
                href="/characters/new"
                className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                새 캐릭터 만들기
              </Link>
            </div>
          ) : (
            filtered.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  {c.gender ?? "성별 미정"} · {c.age ? `${c.age}세` : "나이 미정"}
                </div>
                <button
                  className="text-xs text-slate-500 underline"
                  onClick={() => setSelected(c)}
                >
                  프로필 보기
                </button>
              </div>
              <h3 className="mt-2 text-lg font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{c.bio}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-xs text-slate-500">
                {(c.hashtags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2 py-1 text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/chat/${c.id}`}
                  className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-center text-sm text-white hover:bg-slate-800"
                >
                  대화 시작
                </Link>
              </div>
            </article>
            ))
          )}
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800 dark:border dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  {selected.gender ?? "성별 미정"} ·{" "}
                  {selected.age ? `${selected.age}세` : "나이 미정"}
                </p>
                <h3 className="text-xl font-semibold">{selected.name}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{selected.bio}</p>
              </div>
              <button
                className="text-sm text-slate-500 hover:text-slate-800"
                onClick={() => setSelected(null)}
              >
                닫기
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {selected.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {(selected.hashtags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-1 text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">톤</p>
                <p className="font-medium">{selected.tone ?? "미설정"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">경계선</p>
                <p className="font-medium">
                  {selected.boundaries && selected.boundaries.length > 0
                    ? selected.boundaries.join(", ")
                    : "기본 안전 수칙"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                세이프 모드 ON 권장
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                세이프 OFF 시 더 직접적
              </span>
            </div>
            <div className="mt-6 flex gap-2">
              <Link
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-center text-sm text-white hover:bg-slate-800"
                href={`/chat/${selected.id}`}
              >
                대화 시작
              </Link>
              <button
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => setSelected(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
