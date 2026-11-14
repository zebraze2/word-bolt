"""Turns the Sound City Reading letter-sound recordings (human voice) in audio/scr-raw/
into trimmed, level-matched clips in audio/phonics/<letter>.m4a.

Source: soundcityreading.net (Kathryn J. Davis), "Individual Alphabet Sounds".
Free for parents and teachers to use with their own kids; not for profit-making distribution.
Short o and short u are the "-sh" files (the plain o/u files used by ABC Blast are not short vowels).

  cd word-bolt
  ../wordhollow/tools/.venv/bin/python tools/import-scr.py
"""
import os, subprocess, tempfile
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'audio', 'scr-raw')
OUT = os.path.join(ROOT, 'audio', 'phonics')
NAME = {'o-sh': 'o', 'u-sh': 'u'}

def load(path):
    with tempfile.NamedTemporaryFile(suffix='.wav') as t:
        subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@24000', '-c', '1', path, t.name], check=True)
        a, sr = sf.read(t.name, dtype='float32')
    return a, sr

def trim(a, sr):
    w = int(.01 * sr)
    e = np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(0, len(a) - w, w)])
    mask = e > e.max() * .04                      # gentle: keep soft starts like /f/ and /h/
    runs, st = [], None                           # ignore clicks and breaths shorter than 50 ms
    for i, v in enumerate(list(mask) + [False]):
        if v and st is None: st = i
        if not v and st is not None:
            if i - st >= 5: runs.append((st, i))
            st = None
    s, t = max(0, runs[0][0] * w - int(.05 * sr)), min(len(a), runs[-1][1] * w + int(.1 * sr))
    a = a[s:t]
    a = a * (0.1 / (np.sqrt(np.mean(a ** 2)) or 1))
    if np.abs(a).max() > .95: a *= .95 / np.abs(a).max()
    f = int(.01 * sr); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    return np.concatenate([np.zeros(int(.03 * sr)), a, np.zeros(int(.05 * sr))]).astype(np.float32)

os.makedirs(OUT, exist_ok=True)
for fn in sorted(os.listdir(RAW)):
    if not fn.endswith('.mp3'): continue
    key = fn[:-4]; letter = NAME.get(key, key)
    a, sr = load(os.path.join(RAW, fn))
    a = trim(a, sr)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t:
        sf.write(t.name, a, sr, subtype='PCM_16')
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', t.name, os.path.join(OUT, letter + '.m4a')], check=True)
        os.unlink(t.name)
    print(f'{letter}: {len(a) / sr:.2f}s')
