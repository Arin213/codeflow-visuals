"""V6 STEP 3 — the BIGGER hook bed. Am-F-C-G lift @92bpm:
richer pad + brighter arp + a soft heartbeat pulse on every beat +
sub root + SFX taps at sentence starts. Target loudness is applied
downstream in mix_v6.py (bed rms = 0.25 x voice rms = ~12 dB under).
Output: scripts/v6/bed.wav (48k mono)."""
import json, os, wave

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V6 = os.path.join(BASE, "scripts", "v6")
SR = 48000

import numpy as np

timing = json.load(open(os.path.join(V6, "timing.json")))
S = lambda i: timing[i]["s"]

CH = {
    "Am":  [110.00, 130.81, 164.81, 220.00, 261.63],
    "F":   [87.31, 110.00, 130.81, 174.61, 220.00],
    "C":   [130.81, 164.81, 196.00, 261.63, 329.63],
    "G":   [98.00, 123.47, 146.83, 196.00, 246.94],
}
SEQ = ["Am", "F", "C", "G"]
SUB = {"Am": 55.00, "F": 43.65, "C": 65.41, "G": 49.00}

BPM = 92
BEATS_PER_CHORD = 8
CHORD_LEN = BEATS_PER_CHORD * 60.0 / BPM
XFADE = 1.0

PAD_LEVEL = 0.40
SUB_LEVEL = 0.18
ARP_LEVEL = 0.11
PULSE_LEVEL = 0.22
SFX_LEVEL = 0.12

N = int((timing[-1]["e"] + 1.5) * SR)
bed = np.zeros(N)

def env(n, atk, rel):
    e = np.ones(n)
    a_ = min(int(atk * SR), n // 2)
    r = min(int(rel * SR), n - a_)
    e[:a_] = np.linspace(0, 1, a_) ** 2
    e[-r:] *= np.linspace(1, 0, r) ** 1.5
    return e

# ---- pad (richer: detune shimmer + octave partial)
pos = 0.0
k = 0
while pos < N / SR:
    name = SEQ[k % len(SEQ)]
    seg_n = int(CHORD_LEN * SR)
    t = np.arange(seg_n) / SR
    seg = np.zeros(seg_n)
    for j, f in enumerate(CH[name]):
        d = 1 + 0.0014 * (1 if j % 2 else -1)
        seg += (np.sin(2 * np.pi * f * d * t) + 0.35 * np.sin(2 * np.pi * 2 * f * d * t)) / len(CH[name])
    seg *= env(seg_n, 1.2, 1.6)
    a0 = int(pos * SR)
    a1 = min(N, a0 + seg_n)
    bed[a0:a1] += seg[: a1 - a0] * PAD_LEVEL
    tn = int(XFADE * SR)
    if a1 < N:
        bed[a1:a1 + tn] += (seg[-tn:] * np.linspace(1, 0, tn) ** 1.2)[: N - a1] * 0.25
    pos += CHORD_LEN - XFADE
    k += 1

# ---- sub root
pos = 0.0
k = 0
while pos < N / SR:
    f = SUB[SEQ[k % len(SEQ)]]
    seg_n = int(CHORD_LEN * SR)
    a0 = int(pos * SR)
    a1 = min(N, a0 + seg_n)
    t = np.arange(a1 - a0) / SR
    bed[a0:a1] += np.sin(2 * np.pi * f * t) * env(a1 - a0, 0.4, 0.9) * SUB_LEVEL
    pos += CHORD_LEN
    k += 1

# ---- brighter arp: 8th-note plucks, two-partial, up the chord
step = CHORD_LEN / BEATS_PER_CHORD / 2
pos = 0.0
k = 0
while pos < N / SR:
    name = SEQ[k % len(SEQ)]
    tones = CH[name]
    f = tones[(k * 3) % len(tones)]
    n_pluck = int(0.26 * SR)
    t = np.arange(n_pluck) / SR
    seg = (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 10)
    a0 = int(pos * SR)
    a1 = min(N, a0 + n_pluck)
    bed[a0:a1] += seg[: a1 - a0] * ARP_LEVEL
    pos += step
    k += 1

# ---- THE HOOK: soft heartbeat pulse on every beat (decaying 55Hz thump)
beat = 60.0 / BPM
nb = int(N / SR / beat)
for b in range(nb):
    a0 = int(b * beat * SR)
    n_th = int(0.16 * SR)
    t = np.arange(n_th) / SR
    seg = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 22)
    a1 = min(N, a0 + n_th)
    bed[a0:a1] += seg[: a1 - a0] * PULSE_LEVEL

# ---- SFX tap at each sentence start
for i in range(len(timing)):
    a0 = int(S(i) * SR)
    n_sfx = int(0.20 * SR)
    t = np.arange(n_sfx) / SR
    seg = (np.sin(2 * np.pi * 740 * t) + 0.4 * np.sin(2 * np.pi * 1480 * t)) * np.exp(-t * 17)
    a1 = min(N, a0 + n_sfx)
    if a0 < N:
        bed[a0:a1] += seg[: a1 - a0] * SFX_LEVEL

# master shape + normalize (mix_v6 applies the final loudness law)
fade = int(0.8 * SR)
bed[-fade:] *= np.linspace(1, 0, fade)
peak = np.max(np.abs(bed))
bed *= 0.72 / peak

wf = wave.open(os.path.join(V6, "bed.wav"), "wb")
wf.setnchannels(1)
wf.setsampwidth(2)
wf.setframerate(SR)
wf.writeframes((bed * 32767).astype(np.int16).tobytes())
wf.close()
print(f"bed.wav written: {len(bed) / SR:.2f}s")
