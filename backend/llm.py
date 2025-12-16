from typing import Optional
import httpx
import json

from .config import settings


async def call_ollama(prompt: str, model: Optional[str] = None) -> str:
    """
    Ollama API를 호출하여 응답을 받습니다.
    Non-streaming 방식으로 안정적으로 처리합니다.
    """
    target_model = model or settings.model
    max_retries = 2
    
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                # Non-streaming 방식으로 먼저 시도
                try:
                    resp = await client.post(
                        f"{settings.ollama_host}/api/generate",
                        json={
                            "model": target_model,
                            "prompt": prompt,
                            "stream": False,
                        },
                        timeout=180.0,
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    response_text = data.get("response", "").strip()
                    if response_text:
                        return response_text
                except httpx.ReadTimeout:
                    # Non-streaming이 타임아웃되면 스트리밍으로 재시도
                    pass
                
                # 스트리밍 방식으로 재시도
                try:
                    full_response = ""
                    async with client.stream(
                        "POST",
                        f"{settings.ollama_host}/api/generate",
                        json={
                            "model": target_model,
                            "prompt": prompt,
                            "stream": True,
                        },
                        timeout=180.0,
                    ) as response:
                        response.raise_for_status()
                        async for line in response.aiter_lines():
                            if not line or line.strip() == "":
                                continue
                            try:
                                data = json.loads(line)
                                if "response" in data:
                                    full_response += data["response"]
                                if data.get("done", False):
                                    break
                            except (json.JSONDecodeError, KeyError):
                                # JSON 파싱 실패는 무시하고 계속
                                continue
                    
                    if full_response.strip():
                        return full_response.strip()
                except httpx.ReadTimeout:
                    if attempt < max_retries - 1:
                        continue
                    raise
                    
        except httpx.TimeoutException:
            if attempt < max_retries - 1:
                continue
            return "응답 시간이 초과되었어요. 다시 시도해주세요. <emotion=sad>"
        except httpx.ConnectError:
            return "Ollama 서버에 연결할 수 없어요. 서버가 실행 중인지 확인해주세요. <emotion=sad>"
        except httpx.HTTPStatusError as e:
            print(f"Ollama HTTP 오류: {e.response.status_code} - {e.response.text}")
            if attempt < max_retries - 1:
                continue
            return "Ollama 서버에서 오류가 발생했어요. <emotion=sad>"
        except Exception as e:
            print(f"Ollama 호출 오류 (시도 {attempt + 1}/{max_retries}): {type(e).__name__}: {e}")
            if attempt < max_retries - 1:
                continue
            return "지금은 대화를 준비 중이야. 잠시 후 다시 시도해줘. <emotion=neutral>"
    
    return "응답을 받지 못했어요. 다시 시도해주세요. <emotion=sad>"

