"""Records candidate letter sounds (several versions each) plus sample words for
phonics.html, so a grown-up can listen and pick the version that sounds right.

  cd word-bolt
  ../wordhollow/tools/.venv/bin/python tools/make-sounds.py

Writes audio/try/<sound>_<n>.m4a, audio/try/w_<word>.m4a and audio/try/list.json.
"""
import json, os, subprocess, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'audio', 'try')
MODELS = os.path.join(os.path.dirname(ROOT), 'wordhollow', 'tools', 'models')
VOICE = 'af_heart'
k = Kokoro(os.path.join(MODELS, 'kokoro-v1.0.onnx'), os.path.join(MODELS, 'voices-v1.0.bin'))

# (IPA, speed) for each version; quick, held a little, and held longer
SOUNDS = {
    'o': [('ˈɑ', .9), ('ˈɑː', .85), ('ˈɔ', .9)],
    'a': [('ˈæ', .9), ('ˈæː', .85), ('ˈæ', .75)],
    'e': [('ˈɛ', .9), ('ˈɛː', .85), ('ˈɛ', .75)],
    'i': [('ˈɪ', .9), ('ˈɪː', .85), ('ˈɪ', .75)],
    'u': [('ˈʌ', .9), ('ˈʌː', .85), ('ˈʌ', .75)],
    'n': [('ˈnː', .8), ('nnn', .8), ('ˈn', .9)],
}
# sample words, said from IPA so the vowel is exact
WORDS = {
    'pop': 'pˈɑːp.', 'mop': 'mˈɑːp.', 'mat': 'mˈæt.', 'cap': 'kˈæp.', 'man': 'mˈæn.',
    'bed': 'bˈɛd.', 'pet': 'pˈɛt.', 'pig': 'pˈɪɡ.', 'dip': 'dˈɪp.', 'bud': 'bˈʌd.',
    'cup': 'kˈʌp.', 'not': 'nˈɑːt.', 'tin': 'tˈɪn.',
}

def tidy(s, sr):
    thr = 0.003
    idx = np.where(np.abs(s) > thr)[0]
    if len(idx): s = s[max(0, idx[0] - int(.06 * sr)): idx[-1] + int(.1 * sr)]
    rms = np.sqrt(np.mean(s ** 2)) or 1
    s = s * (0.1 / rms)
    peak = np.max(np.abs(s))
    if peak > 0.95: s = s * (0.95 / peak)
    f = int(.01 * sr); s[:f] *= np.linspace(0, 1, f); s[-f:] *= np.linspace(1, 0, f)
    return np.concatenate([np.zeros(int(.04 * sr)), s, np.zeros(int(.06 * sr))]).astype(np.float32)

def save(name, s, sr):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t:
        sf.write(t.name, tidy(s, sr), sr, subtype='PCM_16')
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', t.name, os.path.join(OUT, name + '.m4a')], check=True)
        os.unlink(t.name)
    return round(len(s) / sr, 2)

os.makedirs(OUT, exist_ok=True)
listing = {'sounds': {}, 'words': []}
for snd, vers in SOUNDS.items():
    listing['sounds'][snd] = []
    for i, (ipa, sp) in enumerate(vers, 1):
        try:
            s, sr = k.create(ipa, voice=VOICE, speed=sp, lang='en-us', is_phonemes=True)
        except Exception as e:
            print(f'{snd}{i}: failed ({e})'); continue
        if len(s) < sr * .12:
            print(f'{snd}{i}: too short, skipped'); continue
        print(f'{snd}{i} /{ipa}/ @ {sp}: {save(f"{snd}_{i}", s, sr)}s')
        listing['sounds'][snd].append(i)
for w, ipa in WORDS.items():
    s, sr = k.create(ipa, voice=VOICE, speed=1.0, lang='en-us', is_phonemes=True)
    save('w_' + w, s, sr); listing['words'].append(w)
json.dump(listing, open(os.path.join(OUT, 'list.json'), 'w'), indent=1)
print('words:', ', '.join(listing['words']))
