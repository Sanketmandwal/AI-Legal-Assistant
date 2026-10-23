"""
core/llm_client.py

Unified LLM Client supporting:
  1. Google Gemini API via official google-genai SDK (default / primary)
  2. Groq API (fallback / alternative)

Features:
  - Strict JSON response mode
  - Exponential backoff for rate limits (429, resource_exhausted, quota)
  - Automatic fallback between providers on fatal error
  - Accurate token usage logging
"""

import json
import time
import re
import logging
from config import (
    GEMINI_API_KEY, GEMINI_MODEL,
    GROQ_API_KEY, GROQ_MODEL,
    LLM_PROVIDER, MAX_TOKENS, TEMPERATURE, DISCLAIMER
)

logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False

try:
    from groq import Groq
    _GROQ_AVAILABLE = True
except ImportError:
    _GROQ_AVAILABLE = False


class LLMClient:

    def __init__(self, provider: str = None):
        self.provider = (provider or LLM_PROVIDER).lower()
        self.active_provider = None
        self.gemini_client = None
        self.groq_client = None

        # Setup Gemini
        if GEMINI_API_KEY and _GENAI_AVAILABLE:
            try:
                self.gemini_client = genai.Client(api_key=GEMINI_API_KEY)
                self.gemini_model  = GEMINI_MODEL
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")

        # Setup Groq
        if GROQ_API_KEY and _GROQ_AVAILABLE:
            try:
                self.groq_client = Groq(api_key=GROQ_API_KEY)
                self.groq_model  = GROQ_MODEL
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")

        # Choose primary
        if self.provider == "gemini" and self.gemini_client:
            self.active_provider = "gemini"
            self.model_name = self.gemini_model
            print(f"[LLMClient] Using Google Gemini ({self.gemini_model})")
        elif self.groq_client:
            self.active_provider = "groq"
            self.model_name = self.groq_model
            print(f"[LLMClient] Using Groq ({self.groq_model})")
        elif self.gemini_client:
            self.active_provider = "gemini"
            self.model_name = self.gemini_model
            print(f"[LLMClient] Using Google Gemini ({self.gemini_model})")
        else:
            raise ValueError(
                "Neither GEMINI_API_KEY nor GROQ_API_KEY is available or installed."
            )

    def _extract_json(self, text: str) -> dict:
        """
        Extract JSON from LLM response.
        LLMs sometimes wrap JSON in markdown fences despite instructions.
        """
        text = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
        text = re.sub(r'\s*```$', '', text.strip(), flags=re.MULTILINE)
        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

            return {
                "error":      "Response parsing failed",
                "raw":        text[:500],
                "disclaimer": DISCLAIMER,
            }

    def _call_gemini(
        self,
        system_prompt: str,
        user_prompt:   str,
        max_retries:   int = 5,
        retry_delay:   float = 3.0,
    ) -> dict:
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=TEMPERATURE,
            max_output_tokens=MAX_TOKENS,
            response_mime_type="application/json",
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        )

        for attempt in range(max_retries):
            try:
                time.sleep(2.0)  # Gentle spacing
                response = self.gemini_client.models.generate_content(
                    model=self.gemini_model,
                    contents=user_prompt,
                    config=config,
                )

                raw_text = response.text or ""
                result   = self._extract_json(raw_text)

                if hasattr(response, 'usage_metadata') and response.usage_metadata:
                    print(f"    Tokens: {response.usage_metadata.prompt_token_count} in, "
                          f"{response.usage_metadata.candidates_token_count} out (Gemini)")

                return result

            except Exception as e:
                error_str = str(e)
                print(f"    [Attempt {attempt+1}/{max_retries}] Gemini error: {error_str}")

                is_rate_limit = any(k in error_str.lower() for k in ["resource_exhausted", "429", "rate_limit", "quota"])
                is_server_busy = any(k in error_str.lower() for k in ["503", "unavailable", "high demand"])

                if is_rate_limit or is_server_busy:
                    wait = retry_delay * (2 ** attempt)
                    reason = "Rate limited" if is_rate_limit else "Server high demand (503)"
                    print(f"    {reason}. Waiting {wait:.0f}s before retrying...")
                    time.sleep(wait)
                elif attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    if self.groq_client:
                        print("    [Fallback] Gemini failed. Falling back to Groq...")
                        return self._call_groq(system_prompt, user_prompt)
                    return {
                        "error":      f"LLM call failed after {max_retries} attempts: {error_str}",
                        "disclaimer": DISCLAIMER,
                    }

        return {"error": "Max retries exceeded", "disclaimer": DISCLAIMER}

    def _call_groq(
        self,
        system_prompt: str,
        user_prompt:   str,
        max_retries:   int = 3,
        retry_delay:   float = 2.0,
    ) -> dict:
        for attempt in range(max_retries):
            try:
                time.sleep(1.5)
                response = self.groq_client.chat.completions.create(
                    model=self.groq_model,
                    messages=[
                        {"role": "system",  "content": system_prompt},
                        {"role": "user",    "content": user_prompt},
                    ],
                    max_tokens=MAX_TOKENS,
                    temperature=TEMPERATURE,
                    response_format={"type": "json_object"},
                )

                raw_text = response.choices[0].message.content
                result   = self._extract_json(raw_text)

                usage = response.usage
                print(f"    Tokens: {usage.prompt_tokens} in, "
                      f"{usage.completion_tokens} out (Groq)")

                return result

            except Exception as e:
                error_str = str(e)
                print(f"    [Attempt {attempt+1}/{max_retries}] Groq error: {error_str}")

                if "rate_limit" in error_str.lower() or "429" in error_str:
                    wait = retry_delay * (2 ** attempt)
                    print(f"    Rate limited. Waiting {wait:.0f}s...")
                    time.sleep(wait)
                elif attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    return {
                        "error":      f"LLM call failed after {max_retries} attempts: {error_str}",
                        "disclaimer": DISCLAIMER,
                    }

        return {"error": "Max retries exceeded", "disclaimer": DISCLAIMER}

    def call(
        self,
        system_prompt: str,
        user_prompt:   str,
        max_retries:   int = 3,
        retry_delay:   float = 2.0,
    ) -> dict:
        """
        Make an LLM API call with retry logic and provider handling.
        """
        if self.active_provider == "gemini":
            return self._call_gemini(system_prompt, user_prompt, max_retries=5, retry_delay=3.0)
        else:
            return self._call_groq(system_prompt, user_prompt, max_retries=max_retries, retry_delay=retry_delay)