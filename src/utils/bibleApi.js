import axios from 'axios';

const API_KEY = 'loPsbJCaWjl5ITSeS4WWD';
const BASE_URL = 'https://rest.api.bible/v1';

const bibleApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'api-key': API_KEY
  }
});

/**
 * Mapping of user-friendly IDs to rest.api.bible IDs.
 * These are specifically chosen from the available list for this API key.
 */
export const VERSION_MAP = {
  'KJV': 'de4e12af7f28f599-01',  // King James Version
  'NKJV': '179568874c45066f-01', // Douay-Rheims (Formal alternative)
  'NIV': '65eec8e0b60e656b-01',  // Free Bible Version (Modern alternative)
  'AMP': '06125adad2d5898a-01',  // American Standard Version (Literal alternative)
  'GENZ': 'de4e12af7f28f599-01'  // KJV base for GenZ
};

export const fetchBibles = async () => {
  const response = await bibleApi.get('/bibles');
  return response.data.data;
};

export const fetchBooks = async (bibleId = VERSION_MAP.KJV) => {
  const response = await bibleApi.get(`/bibles/${bibleId}/books`);
  return response.data.data;
};

export const fetchChapters = async (bibleId, bookId) => {
  const response = await bibleApi.get(`/bibles/${bibleId}/books/${bookId}/chapters`);
  return response.data.data;
};

export const fetchChapterContent = async (bibleId, chapterId) => {
  // chapterId is usually like 'GEN.1'
  const response = await bibleApi.get(`/bibles/${bibleId}/chapters/${chapterId}?content-type=json&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true`);
  return response.data.data;
};

const slangDictionary = {
  // === THE DEEP LORE (Idioms & Phrases) ===
  "weeping and gnashing of teeth": "malding and coping",
  "kingdom of heaven": "the W server",
  "kingdom of god": "the OG's server",
  "son of man": "bro",
  "holy spirit": "the ultimate vibe",
  "holy ghost": "the ultimate vibe",
  "eye for an eye": "matching energy",
  "flesh and blood": "IRL stuff",
  "give up the ghost": "log off for good",
  "and it came to pass": "so basically",
  "verily, verily": "no cap fr fr",
  "gird up thy loins": "lock in",
  "woe unto": "massive L for",
  "in the beginning": "day one",
  "fear not": "don't panic chat",
  "peace be unto you": "good vibes only",
  "laid hands on": "caught hands from",
  "lifted up his voice": "started yapping",
  "fell on his face": "ate dirt",
  "cast out": "yeeted",
  "yielded up the ghost": "respawn timer started",
  "alpha and omega": "first and last boss",

  // === DIVINE & SUPERNATURAL ===
  "lord": "Big Bro",
  "god": "the OG",
  "jehovah": "the Creator",
  "satan": "the biggest hater",
  "devil": "the final boss",
  "demon": "griefer",
  "demons": "trolls",
  "angel": "mod",
  "angels": "the mods",
  "heaven": "W tier", 
  "hell": "Ohio",
  "abyss": "the backrooms",
  "sheol": "the shadow realm",

  // === ROLES, TITLES & PEOPLE ===
  "king": "CEO", 
  "master": "boss",
  "servant": "NPC", 
  "prophet": "influencer", 
  "disciple": "mutual",
  "apostle": "day one homie",
  "pharisees": "gatekeepers",
  "scribe": "reddit mod",
  "hypocrite": "poser with zero aura",
  "sinner": "walking L",
  "saints": "the real ones",
  "brethren": "the squad",
  "multitude": "chat", 
  "gentiles": "the normies",
  "virgin": "simp-free",
  "harlot": "thot",
  "fool": "goofball",
  "wise": "big brain",

  // === ITEMS, GEAR & LOOT ===
  "garments": "fit",
  "raiment": "drip",
  "cloak": "hoodie",
  "sword": "blicky",
  "shield": "plot armor",
  "spear": "pokey stick",
  "chariot": "whip", 
  "chariots": "whips",
  "crown": "W hat",
  "throne": "gaming chair",
  "money": "the bag", 
  "gold": "the bag", 
  "silver": "crypto",
  "shekels": "V-Bucks",
  "bread": "carbs",
  "wine": "juice",
  "water": "hydration",
  "altar": "the setup",
  "tabernacle": "the crib",
  "temple": "the main stage",

  // === KJV ACTIONS & VERBS ===
  "repent": "rebrand", 
  "rejoice": "pop off",
  "weep": "cry about it", 
  "forsake": "ghost", 
  "smite": "cancel", 
  "slay": "unalive",
  "crucify": "cancel",
  "resurrect": "respawn",
  "baptize": "vibe check",
  "covet": "simp for", 
  "pray": "manifest", 
  "fasting": "starving fr",
  "sin": "take an L",
  "sinned": "took an L",
  "saith": "yaps",
  "spake": "dropped info",
  "sayest": "saying",
  "crieth": "yelling",
  "hearken": "listen up chat",
  "tarry": "stick around",
  "beseech": "beg",
  "begat": "spawned",
  "smote": "clapped",
  "cleave": "stick like glue",
  "rend": "rip up",
  "knoweth": "knows the tea",
  "loveth": "simps for",
  "maketh": "cooks up",
  "goeth": "dips",
  "cometh": "pulls up",
  "walketh": "struts",

  // === KJV CONCEPTS ===
  "miracle": "main character energy", 
  "judgment": "the vibe check", 
  "parable": "storytime",
  "wisdom": "the tea", 
  "enemies": "the opps", 
  "temptation": "intrusive thoughts", 
  "flesh": "the ick", 
  "spirit": "the vibes",
  "gospel": "the lore", 
  "truth": "fax", 
  "testament": "lore drop",
  "covenant": "pinky promise",
  "wilderness": "the middle of nowhere",
  "famine": "zero snacks",
  "pestilence": "a massive debuff",
  "salvation": "the ultimate W", 
  "grace": "the ultimate pass",
  "glory": "aesthetic",
  "wrath": "crashing out",
  "woe": "big yikes", 
  "iniquity": "sus behavior",
  "abomination": "cringe",

  // === ADJECTIVES & DESCRIPTORS ===
  "verily": "no cap", 
  "greatly": "highkey", 
  "blessed": "living your best life", 
  "righteous": "based",
  "righteousness": "positive aura",
  "wicked": "sus", 
  "holy": "top tier",
  "sacred": "untouchable",
  "cursed": "shadowbanned",
  "almighty": "busted OP",
  "meek": "lowkey",
  "proud": "ego-lifting",

  // === GRAMMAR, PRONOUNS & CONNECTORS ===
  "thee": "you", 
  "thou": "you", 
  "thy": "your", 
  "thine": "yours", 
  "ye": "y'all",
  "thyself": "your own self",
  "myself": "my main character",
  "art": "are",
  "shalt": "gonna",
  "wilt": "will",
  "hath": "has", 
  "doth": "does", 
  "hast": "have",
  "didst": "did",
  "unto": "to",
  "upon": "on",
  "whence": "from where",
  "hither": "here",
  "thither": "there",
  "wherefore": "why",
  "therefore": "so",
  "thus": "like this",
  "moreover": "plus",
  "nevertheless": "anyways",
  "yea": "fr fr", 
  "nay": "nah",
  "alas": "bruh",
  "lo": "peep this",
  "behold": "look bro",
  "lest": "or else",
  "forthwith": "ASAP",
  "hitherto": "up till now",
  "wherewith": "with what",
  "therein": "in there"
};

/**
 * Custom Gen Z Translator
 * Uses the user-provided dictionary and transformation logic.
 */
export const translateToGenZ = (text) => {
  if (!text) return "";
  let result = text;
  
  // Sort keys by length descending so longer words/phrases match before shorter ones
  const sortedKeys = Object.keys(slangDictionary).sort((a, b) => b.length - a.length);

  for (let kjv of sortedKeys) {
    const slang = slangDictionary[kjv];
    // Use regex to match whole phrases or words
    const regex = new RegExp(`\\b${kjv}\\b`, 'gi');
    
    result = result.replace(regex, (match) => {
      // 1. Handle ALL CAPS (e.g., VERILY -> NO CAP)
      if (match === match.toUpperCase() && match.length > 1) {
        return slang.toUpperCase(); 
      } 
      // 2. Handle Title Case (e.g., Thou -> You)
      else if (match[0] === match[0].toUpperCase()) {
        return slang.charAt(0).toUpperCase() + slang.slice(1);
      }
      // 3. Handle lowercase (e.g., thee -> you)
      return slang; 
    });
  }

  // Convert archaic suffixes (-eth/-est to -ing)
  // e.g., "walketh" becomes "walking"
  result = result.replace(/\b(\w+)(eth|est)\b/gi, (match, rootWord) => {
    // Keep the casing of the root word intact
    return `${rootWord}ing`; 
  });

  return result;
};
