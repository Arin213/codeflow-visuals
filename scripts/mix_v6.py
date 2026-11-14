"""V6 STEP 4 — the pre-mix. Voice + bed -> ONE public/video6-mix.wav.
V6 targets: voice peak 0.90; bed rms = 0.25 x voice rms (~12 dB under voice
— BIGGER than V5's 0.17/15.4 dB, per "make the bgm sound bigger");
+3.0 dB pre-amplify with soft knee (cancels Remotion's 0.707 <Audio>
attenuation), final peak <= ~0.98, no clipping."""
import os, wave

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V6 = os.path.join(BASE, "scripts", "v6")
SR = 48000
BED_RATIO = 0.25   # ~12 dB under voice (V5 was 0.17 = 15.4 dB)

import numpy as np

def load(p):
    wf = wave.open(p, "rb")
    a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    wf.close()
    return a

voice = load(os.path.join(V6, "narration.wav"))
bed = load(os.path.join(V6, "bed.wav"))

n = max(len(voice), len(bed))
voice = np.pad(voice, (0, n - len(voice)))
bed = np.pad(bed, (0, n - len(bed)))

v_peak = np.max(np.abs(voice))
voice *= 0.90 / v_peak
v_rms = np.sqrt(np.mean(voice ** 2))
print(f"voice: peak {np.max(np.abs(voice)):.3f} rms {v_rms:.4f} ({20 * np.log10(v_rms):.1f} dBFS)")

b_peak = np.max(np.abs(bed))
b_rms = np.sqrt(np.mean(bed ** 2))
target_rms = BED_RATIO * v_rms
g = min(target_rms / b_rms, 0.30 / b_peak)
bed *= g
b_rms2 = np.sqrt(np.mean(bed ** 2))
print(f"bed: gain {g:.2f} -> rms {b_rms2:.4f} ({20 * np.log10(b_rms2):.1f} dBFS = "
      f"{20 * np.log10(b_rms2 / v_rms):.1f} dB under voice) peak {np.max(np.abs(bed)):.3f}")

mix = voice + bed
print(f"sum: peak {np.max(np.abs(mix)):.3f}")

GAIN = 10 ** (3.0 / 20)
mix *= GAIN
over = np.abs(mix) > 0.8
mix[over] = np.sign(mix[over]) * (0.8 + 0.2 * np.tanh((np.abs(mix[over]) - 0.8) / 0.2))
lim = np.mean(np.abs(mix) > 0.8)
m_rms = np.sqrt(np.mean(mix ** 2))
print(f"after +3.0dB + soft knee: peak {np.max(np.abs(mix)):.3f} (limiter {lim * 100:.2f}%) "
      f"rms {m_rms:.4f} ({20 * np.log10(m_rms):.1f} dBFS)")

wf = wave.open(os.path.join(BASE, "public", "video6-mix.wav"), "wb")
wf.setnchannels(1)
wf.setsampwidth(2)
wf.setframerate(SR)
wf.writeframes((mix * 32767).astype(np.int16).tobytes())
wf.close()
out = os.path.join(BASE, "public", "video6-mix.wav")
print("written", out, os.path.getsize(out), "bytes")
