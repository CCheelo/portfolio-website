"""Builds js/chat-phrases.js: many ways people phrase small talk, mapped onto the bot's topic ids.

Sources (phrasings only — every answer is written for Choolwe's bot):
  • CLINC150 (Larson et al., 2019), CC BY 3.0 — github.com/clinc/oos-eval
  • Microsoft BotBuilder Personality Chat, MIT — github.com/ntulsi/BotBuilder-PersonalityChat (fork of Microsoft's repo)
"""
import json, csv, os, re, collections

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'js', 'chat-phrases.js')

# CLINC intent -> our topic id
CLINC_MAP = {
    'greeting': 'greet', 'goodbye': 'bye', 'thank_you': 'thanks', 'tell_joke': 'joke',
    'what_is_your_name': 'botname', 'how_old_are_you': 'age', 'who_made_you': 'whomade', 'are_you_a_bot': 'whoareyou',
    'what_can_i_ask_you': 'capabilities', 'meaning_of_life': 'meaning', 'fun_fact': 'funfact', 'where_are_you_from': 'location',
    'what_are_your_hobbies': 'hobbies', 'do_you_have_pets': 'pets', 'who_do_you_work_for': 'current', 'yes': 'yes', 'no': 'no',
    'maybe': 'maybe', 'repeat': 'repeat', 'user_name': 'username', 'how_busy': 'howareyou'
}

# Personality Chat scenario -> our topic id (scenarios we don't map are skipped)
PC_MAP = {
    'Bot_Ability': 'capabilities', 'Bot_Age': 'age', 'Bot_Boring': 'rude', 'Bot_Boss': 'whomade', 'Bot_Busy': 'howareyou',
    'Bot_Creator': 'whomade', 'Bot_DidDo': 'howareyou', 'Bot_Doing': 'howareyou', 'Bot_DoingLater': 'howareyou', 'Bot_Family': 'private',
    'Bot_Favorites': 'favourites', 'Bot_Gender': 'whoareyou', 'Bot_Happy': 'mood', 'Bot_Hungry': 'food', 'Bot_KnowOtherBot': 'otherbots',
    'Bot_Opinion_Generic': 'opinion', 'Bot_Opinion_Love': 'loveyou', 'Bot_Opinion_MeaningOfLife': 'meaning', 'Bot_Opinion_PrettierThanMe': 'flattery',
    'Bot_Opinion_SmarterThanMe': 'flattery', 'Bot_Opinion_TechCo': 'opinion', 'Bot_Opinion_UserLooks': 'flattery', 'Bot_Opinion_WhatToDo': 'whattodo',
    'Bot_OtherBots': 'otherbots', 'Bot_Real': 'whoareyou', 'Bot_RuleWorld': 'ruleworld', 'Bot_Smart': 'compliment', 'Bot_Spy': 'privacyq',
    'Bot_There': 'there', 'Bot_WhatAreYou': 'whoareyou', 'Bot_WhereAreYou': 'location', 'Bot_WhoAreYou': 'whoareyou',
    'Command_AskMeAnything': 'askme', 'Command_Chat': 'chat', 'Command_Fired': 'rude', 'Command_Joke': 'joke', 'Command_JokeOther': 'joke',
    'Command_SaySomethingFunny': 'joke', 'Command_ShutUp': 'rude', 'Command_Sing': 'sing', 'Command_SurpriseMe': 'surprise',
    'Compliment_Bot': 'compliment', 'Compliment_Humor': 'compliment', 'Compliment_Looks': 'compliment', 'Compliment_Response': 'compliment',
    'Criticism_Abusive': 'rude', 'Criticism_Bot': 'rude', 'Criticism_Humor': 'rude', 'Criticism_Looks': 'rude', 'Criticism_Response': 'rude',
    'Dialog_Affirmation': 'yes', 'Dialog_Laugh': 'ack', 'Dialog_Polite': 'ack', 'Dialog_Questions': 'capabilities', 'Dialog_Right': 'yes',
    'Dialog_Sorry': 'apology', 'Dialog_ThankYou': 'thanks', 'Dialog_WhatDoYouMean': 'clarify', 'Dialog_YouAreWelcome': 'ack',
    'Greetings_Bye': 'bye', 'Greetings_Generic': 'greet', 'Greetings_GoodEvening': 'greet', 'Greetings_GoodMorning': 'greet',
    'Greetings_GoodNight': 'bye', 'Greetings_Hello': 'greet', 'Greetings_HowAreYou': 'howareyou', 'Greetings_HowWasYourDay': 'howareyou',
    'Greetings_NiceToMeetYou': 'nicetomeet', 'Greetings_OtherBot': 'otherbots', 'Greetings_Special': 'greet', 'Greetings_WhatsUp': 'howareyou',
    'Relationship_Flirting': 'loveyou', 'Relationship_Friendship': 'friends', 'Relationship_Generic': 'friends', 'Relationship_HateMe': 'hateme',
    'Relationship_HateYou': 'rude', 'Relationship_Hug': 'hug', 'Relationship_Kiss': 'loveyou', 'Relationship_KnowMe': 'knowme',
    'Relationship_LikeMe': 'friends', 'Relationship_LikeYou': 'loveyou', 'Relationship_LoveMe': 'loveyou', 'Relationship_LoveYou': 'loveyou',
    'Relationship_Marriage': 'loveyou', 'Relationship_MissYou': 'missyou', 'Relationship_ThinkAboutMe': 'knowme', 'Relationship_TrustYou': 'privacyq',
    'User_Angry': 'usersad', 'User_BeBack': 'bye', 'User_Bored': 'bored', 'User_Happy': 'userhappy', 'User_Here': 'greet', 'User_Hungry': 'food',
    'User_Kidding': 'ack', 'User_Lonely': 'usersad', 'User_Loves': 'userloves', 'User_Sad': 'usersad', 'User_Statement': 'ack',
    'User_Testing': 'testing', 'User_Tired': 'usertired'
}


def clean(s):
    s = s.strip().strip('"').lower()
    s = re.sub(r"[’']", '', s)
    s = re.sub(r'[^a-z0-9 ]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


bank = collections.defaultdict(set)

clinc = json.load(open(os.path.join(HERE, 'clinc_full.json'), encoding='utf-8'))
for split in ('train', 'val', 'test'):
    for text, intent in clinc[split]:
        if intent in CLINC_MAP:
            t = clean(text)
            if 2 <= len(t) <= 80:
                bank[CLINC_MAP[intent]].add(t)

seen_scen = collections.Counter()
for p in ('Professional', 'Friendly'):
    path = os.path.join(HERE, 'pc_%s.tsv' % p)
    with open(path, encoding='utf-8-sig') as f:
        for row in csv.reader(f, delimiter='\t'):
            if len(row) < 3 or row[0] == 'Question':
                continue
            scen = row[2].replace('Scenario:', '').strip()
            seen_scen[scen] += 1
            if scen in PC_MAP:
                t = clean(row[0])
                if t:
                    bank[PC_MAP[scen]].add(t)

unmapped = sorted(s for s in seen_scen if s not in PC_MAP)
total = sum(len(v) for v in bank.values())
data = {k: sorted(v) for k, v in sorted(bank.items())}

js = ('/* Phrase bank for the chat bot: many ways people word small talk, mapped to topic ids in chat-kb.js.\n'
      '   Generated by a script — phrasings only, every answer is written in chat-kb.js.\n'
      '   Sources: CLINC150 (Larson et al., 2019, "An Evaluation Dataset for Intent Classification and\n'
      '   Out-of-Scope Prediction"), licensed CC BY 3.0 — github.com/clinc/oos-eval; and Microsoft\n'
      '   BotBuilder Personality Chat queries, MIT licence — github.com/ntulsi/BotBuilder-PersonalityChat. */\n'
      'window.CC_PHRASES = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(OUT, 'w', encoding='utf-8', newline='').write(js)
print('topics', len(data), 'phrases', total, 'kb', round(len(js) / 1024))
print({k: len(v) for k, v in data.items()})
print('unmapped scenarios:', unmapped)
