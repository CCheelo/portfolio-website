# Chat phrase bank

`build_phrases.py` regenerates `js/chat-phrases.js` — extra ways of phrasing small talk, mapped to topic ids in `js/chat-kb.js`. Only phrasings are taken; every answer is written in `chat-kb.js`.

Download the source data into this folder first (it is not committed):

- `clinc_full.json` — `https://raw.githubusercontent.com/clinc/oos-eval/master/data/data_full.json` (CLINC150, CC BY 3.0 — credited on `project-chatbot.html`)
- `pc_Professional.tsv`, `pc_Friendly.tsv` — `https://raw.githubusercontent.com/ntulsi/BotBuilder-PersonalityChat/master/CSharp/Datasets/Queries_Responses_{Professional,Friendly}_QnAMaker.tsv` (MIT)

Then run `python scripts/chat-phrases/build_phrases.py`. Do not add GPL-licensed data (e.g. Rasa's demo bot) — it would put the site under GPL.
