"""V6 STEP 1 — narration. Streams edge-tts, captures SentenceBoundary events.
Writes scripts/v6/narration_raw.mp3 + scripts/v6/events.json."""
import asyncio, json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "scripts", "v6")

async def run(text):
    import edge_tts
    c = edge_tts.Communicate(text, "en-US-AndrewNeural", rate="-8%")
    sentences = []
    with open(os.path.join(OUT, "narration_raw.mp3"), "wb") as f:
        async for chunk in c.stream():
            t = chunk.get("type")
            if t == "audio":
                f.write(chunk["data"])
            elif t == "SentenceBoundary":
                sentences.append({"start": chunk["offset"] / 1e7,
                                  "end": (chunk["offset"] + chunk["duration"]) / 1e7,
                                  "text": chunk["text"]})
    json.dump({"sentences": sentences}, open(os.path.join(OUT, "events.json"), "w"), indent=1)
    print(f"sentences={len(sentences)}")

def main():
    os.makedirs(OUT, exist_ok=True)
    text = open(os.path.join(BASE, "scripts", "video-6-script.txt"), encoding="utf-8").read()
    text = " ".join(line.strip() for line in text.splitlines() if line.strip())
    import time
    for attempt in range(5):
        try:
            asyncio.run(run(text))
            return
        except Exception as e:
            print(f"attempt {attempt + 1} failed: {type(e).__name__}; backing off...")
            time.sleep(6 + attempt * 4)
    raise SystemExit("tts failed after retries")

if __name__ == "__main__":
    main()
