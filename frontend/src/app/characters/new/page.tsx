"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EmotionKey } from "@/types";
import ThemeToggle from "@/components/ThemeToggle";
import { createCharacter, type CharacterCreate } from "@/lib/api";

const emotionSlots: EmotionKey[] = [
  "happy",
  "sad",
  "angry",
  "shy",
  "sleepy",
  "flirty",
  "neutral",
];

export default function NewCharacter() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("여성");
  const [age, setAge] = useState<number | undefined>(24);
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("친근");
  const [hashtags, setHashtags] = useState<string>("");
  const [boundaries, setBoundaries] = useState<string>("");
  const [imageDefault, setImageDefault] = useState("");
  const [images, setImages] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("이름은 필수입니다.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const hashtagList = hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

      const boundaryList = boundaries
        .split(",")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const characterData: CharacterCreate = {
        name: name.trim(),
        gender: gender || undefined,
        age: age || undefined,
        bio: bio.trim() || undefined,
        description: description.trim() || undefined,
        tone: tone.trim() || undefined,
        hashtags: hashtagList,
        boundaries: boundaryList,
        image_default: imageDefault.trim() || undefined,
        image_by_emotion: Object.fromEntries(
          Object.entries(images).filter(([_, v]) => v.trim().length > 0)
        ),
      };

      const created = await createCharacter(characterData);
      router.push(`/chat/${created.id}`);
    } catch (err) {
      console.error("캐릭터 생성 실패:", err);
      setError(err instanceof Error ? err.message : "캐릭터 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">캐릭터 추가</h1>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
              메인으로
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">기본 정보</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  이름 <span className="text-rose-500">*</span>
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  placeholder="캐릭터 이름"
                />
              </label>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">성별</span>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                >
                  <option value="여성">여성</option>
                  <option value="남성">남성</option>
                  <option value="기타">기타</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">나이</span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-24 rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                />
              </label>
            </div>
              <label className="md:col-span-2 flex flex-col gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400">한줄 소개</span>
                <input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  placeholder="차분하지만 다정한 대학원생"
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400">상세 설명</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  placeholder="밤샘 연구보다 카페 수다를 좋아하는 ENFP 타입"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400">말투</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                >
                  <option value="친근">친근</option>
                  <option value="밝음">밝음</option>
                  <option value="차분">차분</option>
                  <option value="잔잔">잔잔</option>
                  <option value="도도">도도</option>
                  <option value="장난">장난</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400">해시태그 (쉼표 구분)</span>
                <input
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  placeholder="#따뜻함, #카페투어, #ENFP"
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400">경계선/금지 주제 (쉼표 구분)</span>
                <input
                  value={boundaries}
                  onChange={(e) => setBoundaries(e.target.value)}
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  placeholder="폭력적 표현 금지, 모욕적 언어 금지"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">이미지 설정</h2>
            <label className="mb-4 flex flex-col gap-1 text-sm">
              <span className="text-slate-600 dark:text-slate-400">기본 이미지 경로</span>
              <input
                value={imageDefault}
                onChange={(e) => setImageDefault(e.target.value)}
                className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                placeholder="/images/character-default.png"
              />
            </label>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              감정/상황 태그에 맞는 이미지 경로를 입력하세요. (추후 업로드 API 연동)
            </p>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">상황별 이미지</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            감정/상황 태그에 맞는 이미지 경로를 입력하세요. (추후 업로드 API 연동)
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {emotionSlots.map((slot) => (
              <label key={slot} className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">{slot}</span>
                <input
                  value={images[slot] ?? ""}
                  onChange={(e) =>
                    setImages((prev) => ({
                      ...prev,
                      [slot]: e.target.value,
                    }))
                  }
                  placeholder="/images/character-happy.png"
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400"
                />
              </label>
            ))}
          </div>
        </section>

          <div className="grid gap-3 md:grid-cols-2">
            {emotionSlots.map((slot) => (
              <label key={slot} className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400 capitalize">{slot}</span>
                <input
                  value={images[slot] ?? ""}
                  onChange={(e) =>
                    setImages((prev) => ({
                      ...prev,
                      [slot]: e.target.value,
                    }))
                  }
                  placeholder={`/images/character-${slot}.png`}
                  className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400"
                />
              </label>
            ))}
          </div>
        </section>

          <section className="flex items-center justify-end gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}

