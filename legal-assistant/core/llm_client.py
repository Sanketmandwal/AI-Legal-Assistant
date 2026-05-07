"""
core/llm_client.py

WHY: Wraps the Groq API with:
  - Retry logic (Groq occasionally rate-limits)
  - JSON response extraction and validation
  - Fallback response on total failure
  - Token usage logging (useful for debugging)
"""

import json
import time
import re
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL, MAX_TOKENS, TEMPERATURE, DISCLAIMER


class LLMClient:

    def __init__(self):
        if not GROQ_API_KEY:
            raise ValueError(
                "GROQ_API_KEY not set. Add it to your .env file."
            )
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model  = GROQ_MODEL

    def _extract_json(self, text: str) -> dict:
        """
        Extract JSON from LLM response.
        LLMs sometimes wrap JSON in markdown fences despite instructions.
        """
        # Remove markdown fences if present
        text = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
        text = re.sub(r'\s*```$', '', text.strip(), flags=re.MULTILINE)
        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to extract JSON object from surrounding text
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

            # Return structured error
            return {
                "error":      "Response parsing failed",
                "raw":        text[:500],
                "disclaimer": DISCLAIMER,
            }

    def call(
        self,
        system_prompt: str,
        user_prompt:   str,
        max_retries:   int = 3,
        retry_delay:   float = 2.0,
    ) -> dict:
        """
        Make an LLM API call with retry logic.
        Returns parsed JSON dict.
        """
        for attempt in range(max_retries):
            try:
                time.sleep(1.5)
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system",  "content": system_prompt},
                        {"role": "user",    "content": user_prompt},
                    ],
                    max_tokens=MAX_TOKENS,
                    temperature=TEMPERATURE,
                    # Ask for JSON output at the API level too
                    response_format={"type": "json_object"},
                )

                raw_text = response.choices[0].message.content
                result   = self._extract_json(raw_text)

                # Log token usage (useful for optimization)
                usage = response.usage
                print(f"    Tokens: {usage.prompt_tokens} in, "
                      f"{usage.completion_tokens} out")

                return result

            except Exception as e:
                error_str = str(e)
                print(f"    [Attempt {attempt+1}/{max_retries}] LLM error: {error_str}")

                # Rate limit → wait longer
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