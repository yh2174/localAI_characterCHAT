const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type Character = {
  id: number;
  name: string;
  gender?: string;
  age?: number;
  bio?: string;
  description?: string;
  hashtags?: string[];
  tone?: string;
  boundaries?: string[];
  image_default?: string;
  image_by_emotion?: Record<string, string>;
};

export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  is_action?: boolean;
  emotion?: string;
  created_at?: string;
};

export type ChatRequest = {
  character_id: number;
  conversation_id?: number;
  user_profile?: Record<string, string>;
  safe_mode: boolean;
  message: string;
};

export type ChatResponse = {
  conversation_id: number;
  reply: string;
  emotion?: string;
  action?: string;
};

export async function getCharacter(id: number): Promise<Character> {
  try {
    const res = await fetch(`${API_BASE}/characters/${id}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("캐릭터를 찾을 수 없습니다. 캐릭터가 삭제되었거나 존재하지 않습니다.");
      }
      const errorData = await res.json().catch(() => ({ detail: "캐릭터를 불러올 수 없습니다" }));
      throw new Error(errorData.detail || "캐릭터를 불러올 수 없습니다");
    }
    return res.json();
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
  }
}

export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "메시지 전송 실패" }));
    throw new Error(error.detail || "메시지 전송 실패");
  }
  return res.json();
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  try {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`);
    if (!res.ok) {
      if (res.status === 404) {
        return []; // 대화가 없으면 빈 배열 반환
      }
      const errorData = await res.json().catch(() => ({ detail: "메시지를 불러올 수 없습니다" }));
      throw new Error(errorData.detail || "메시지를 불러올 수 없습니다");
    }
    return res.json();
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
}

export async function getCharacters(): Promise<Character[]> {
  try {
    const res = await fetch(`${API_BASE}/characters`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "캐릭터 목록을 불러올 수 없습니다" }));
      throw new Error(errorData.detail || "캐릭터 목록을 불러올 수 없습니다");
    }
    return res.json();
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
  }
}

export type CharacterCreate = {
  name: string;
  gender?: string;
  age?: number;
  bio?: string;
  description?: string;
  hashtags?: string[];
  tone?: string;
  boundaries?: string[];
  image_default?: string;
  image_by_emotion?: Record<string, string>;
};

export async function createCharacter(data: CharacterCreate): Promise<Character> {
  try {
    const res = await fetch(`${API_BASE}/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "캐릭터 생성 실패" }));
      throw new Error(errorData.detail || "캐릭터 생성 실패");
    }
    return res.json();
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
  }
}

export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload/image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "이미지 업로드 실패" }));
    throw new Error(error.detail || "이미지 업로드 실패");
  }

  return res.json();
}

export async function testApiConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

