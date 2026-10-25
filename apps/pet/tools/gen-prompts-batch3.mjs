/**
 * 批次三清单生成器：目标 +1600 张（场景季候变体/明信片全集/表情包/配件装饰四批/
 * 新配色第三批/小游戏美术/成就徽章/插画卡/UI 图标）。
 * 幂等合入 prompts.json。用法：node tools/gen-prompts-batch3.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, 'prompts.json');
const db = JSON.parse(readFileSync(file, 'utf8'));
const has = new Set(db.assets.map((a) => a.key));
const add = (key, o) => { if (!has.has(key)) { db.assets.push({ key, ...o }); has.add(key); } };
let n = 0;
const A = (k, o) => { add(k, o); n++; };

const STICKER = 'kawaii flat sticker style, thick dark brown outline, soft pastel colors, transparent background, no watermark, no text, centered';
const SINGLE = (t) => `a cute ${t}, single object only, ` + STICKER;
const POSTCARD = 'kawaii flat illustration postcard art, soft pastel colors, cute storybook style, no text, no watermark, no characters, wide landscape composition';
const CHIBI = "a tiny chibi sticker of the original character 'GuGu', a chubby round cream-yellow baby bird with big sparkly dark eyes, tiny orange beak and pink blush, ";

// ---- 场景季候/天气变体：24 基础 × 12 态 ----
const BASE_SCENES = ['garden','lake','bamboo','roof','meadow','courtyard','starry-hill','riverside','sakura-park','autumn-lane','snow-town','seaside-cliff','greenhouse','windmill','library-nook','lantern-street','sunflower-field','desert-oasis','alpine','night-market','pond','maple-bridge','cloud-deck','terrace-cafe'];
const SCENE_MOODS = {
  dawn: 'at soft golden dawn light', day2: 'on a bright clear noon', dusk: 'at warm orange dusk',
  night: 'at night with glowing lights', rain: 'in gentle rain with umbrellas mood', snow: 'covered in soft snow',
  spring: 'in full spring bloom with petals', summer: 'in vivid summer with sunflowers', autumn: 'in deep autumn colors',
  winter: 'in quiet winter with bare branches', festival: 'decorated for a lantern festival', sakura: 'with cherry blossoms drifting',
};
for (const s of BASE_SCENES) for (const [m, d] of Object.entries(SCENE_MOODS)) {
  A(`scene-${s}-${m}`, { file: `scene/${s}-${m}.png`, size: '1536x1024', prompt: `the same kawaii storybook ${s.replace(/-/g, ' ')} scene ${d}, ${POSTCARD}` });
}

// ---- 明信片第三批：8 目的地 × 24 视角 ----
const DESTS = ['mountain','beach','forest','town','onsen','camp','field','plaza'];
const PC_VIEWS = ['sunrise','sunset','night','rainy','snowy','foggy','closeup-flower','closeup-food','closeup-souvenir','birdview','trail','bridge','market','cafe','festival','starry','rainbow','mist','harbor','hilltop','field-path','lantern-alley','hot-spring-steam','campfire-night'];
for (const d of DESTS) for (const v of PC_VIEWS) {
  A(`pc-${d}-${v}`, { file: `pc/${d}-${v}.png`, size: '1536x1024', prompt: `a kawaii storybook travel postcard of a ${d} spot: ${v.replace(/-/g, ' ')}, ${POSTCARD}` });
}

// ---- 表情贴纸第三批（60+40）----
const FACES = [
  ['sing-rain','singing in the rain with a leaf umbrella'],['paint','painting on a tiny canvas'],['knit','knitting a tiny scarf'],
  ['fish','holding a tiny fishing rod'],['coffee','sipping a tiny coffee'],['yoga','doing a tiny yoga pose'],
  ['meditate','meditating cross-legged'],['phone','looking at a tiny phone smiling'],['game','holding a game controller excitedly'],
  ['wink','winking with one eye and smiling'],['double-wow','both wings raised in amazement'],['noodle','slurping noodles'],
  ['watermelon','biting a watermelon slice'],['popcorn','watching something with popcorn'],['ghost','scared of a tiny ghost'],
  ['superhero','flying with a cape'],['ninja','wearing a ninja band sneaking'],['pirate','wearing a tiny pirate hat'],
  ['astronaut','wearing a tiny space helmet'],['chef2','flipping a tiny pan'],['doctor','wearing a tiny head mirror'],
  ['farmer','holding a tiny watering can'],['athlete','crossing a finish line ribbon'],['trophy','lifting a tiny trophy'],
  ['crown2','wearing a crown looking regal'],['umbrella2','holding a tiny umbrella'],['snowball','holding a snowball'],
  ['leaf','hidden under a big leaf'],['mushroom2','sitting under a mushroom'],['bath-duck','hugging a rubber duck'],
  ['blanket','wrapped in a blanket burrito'],['pillow-fight','holding a pillow ready to throw'],['cake2','holding a tiny birthday cake'],
  ['balloon2','tied to balloons floating slightly'],['star-catch','catching a falling star'],['moon-hug','hugging a crescent moon'],
  ['cloud-sit','sitting on a fluffy cloud'],['rainbow-slide','sliding down a rainbow'],['seesaw','on a seesaw happy'],
  ['swing2','on a tiny swing'],['slide','going down a slide'],['trampoline','bouncing on trampoline'],
  ['lantern2','holding a glowing lantern'],['letter','reading a letter moved to tears'],['map','studying a tiny map'],
  ['compass','holding a tiny compass'],['backpack2','adjusting a tiny backpack'],['boots','wearing tiny rain boots'],
  ['scarf2','buried in a big scarf'],['cocoa','holding hot cocoa with steam'],['beach-ball','hugging a beach ball'],
  ['sandcastle','proud of a sandcastle'],['ice-cream2','brain freeze'],['corn','eating roasted corn'],
  ['cricket','playing a tiny violin sadly'],['magic','pulling a coin from behind wing'],['peek','peeking from a corner shyly'],
  ['jump-scared','jumping in surprise'],['sleepwalk','sleepwalking with closed eyes'],
  ['stretch','big morning stretch'],['counting','counting on wing tips'],['money','eyes turning to coins'],
  ['sad-rain','under a personal rain cloud'],['heart-break','small heartbreak'],['jealous','puffed cheeks jealous'],
  ['smell','smelling a flower blissfully'],['listen','cupping ear listening'],['echo','shouting into a valley echo'],
  ['photo','taking a selfie'],['draw-wall','drawing on a tiny easel'],
];
for (const [id, d] of FACES) A(`face-${id}`, { file: `face/${id}.png`, size: '1024x1024', square: true, prompt: CHIBI + d + ', ' + STICKER });

// ---- 配件第四批（60）----
const ACC4 = [
  'tiny straw gardening hat with a red band','small blue sailor cap with ribbon','little red football scarf',
  'small aviator goggles with leather band','tiny flower lei necklace','small silk topknot ribbon',
  'tiny fireman helmet','small police cap with badge','tiny magician bow tie and wand',
  'small graduate sash','tiny pilot wings badge','small lifeguard whistle on a cord',
  'tiny viking drinking horn (prop)','small crystal pendant necklace','tiny lucky clover hairpin',
  'small orange life vest','tiny brown satchel bag','small blue umbrella hat',
  'tiny strawberry hairclip','small mint bowtie','tiny yellow rain boots (front pair)',
  'small chef apron','tiny doctor stethoscope','small camera neck strap',
  'tiny knitted snood','small pink heart pin','tiny teal bandana',
  'small purple wizard cape','tiny green elf hat with bell','small red riding hood cape',
  'tiny white cloud hairpin','small blue ribbon choker','tiny golden bell bracelet',
  'small orange fox tail keychain','tiny rainbow suspenders','small brown monocle chain',
  'tiny sea star hairpin','small blue whistle','tiny red mushroom beret',
  'small yellow taxi pin','tiny green sprout headband','small pink conch shell necklace',
  'tiny white feather hair ornament','small blue crystal earring (one)','tiny purple dreamcatcher pin',
  'small red dice pendant','tiny orange sun hairpin','small wind chime charm',
  'tiny blue whale pin','small yellow crescent bag','tiny pink pig nose (party prop)',
  'small green leaf cape','tiny brown acorn pendant','small purple grape hairpin',
  'tiny blue droplet pin','small red heart-shaped glasses','tiny white snowflake pendant',
  'small orange carrot pin','tiny green tea leaf hairpin','small blue wave bracelet',
];
ACC4.forEach((d, i) => A(`acc-b4-${i}`, { file: `acc/b4-${i}.png`, size: '1024x1024', square: true, prompt: SINGLE(d) }));

// ---- 装饰第四批（60）----
const DECO4 = [
  'miniature zen rock garden with tiny rake','tiny wooden spinning top toy','small brass telescope on tripod',
  'little glass cloche with a tiny plant inside','mini bird feeder house with seeds','tiny wooden xylophone mallet set',
  'small copper watering pot','tiny woven picnic basket with cloth','little ceramic gnome statue',
  'mini street lamp scale model','tiny treasure map rolled with ribbon','small hourglass with pink sand',
  'little wooden train toy','mini ferris wheel model','tiny piano music box',
  'small birdcage with an open door','little lighthouse figurine with light','tiny wooden sailboat model',
  'mini hot air balloon model','small robot wind-up toy','tiny camp stove set',
  'little picnic table set','mini globe on a stand','tiny typewriter model',
  'small gramophone horn only','little wooden clog shoes pair','mini cherry blossom bonsai',
  'tiny mushroom watering can','small star garland string','little dream jar with clouds',
  'mini rubber duck family of three','tiny wooden alphabet blocks stack','small kaleidoscope toy',
  'little balance scale with weights','mini picnic umbrella','tiny flower press book',
  'small snail shell house','little windmill salt grinder','mini weather vane rooster',
  'tiny school bell','small bird nest with three eggs','little picket fence section',
  'mini rainbow arch decoration','tiny wooden spoon and bowl set','small acorn cap collection bowl',
  'little hedgehog figurine','mini cotton candy machine toy','tiny popcorn cart model',
  'small astronomy star chart scroll','little kite string winder','mini pencil vase with tiny pencils',
  'tiny watering sprinkler head','small painted easter eggs basket','little sugar jar with spoon',
  'mini window planter box','tiny feather collection in frame','small key collection on hook',
  'little compass rose wall decoration','mini hour candle','tiny dandelion in glass dome',
];
DECO4.forEach((d, i) => A(`deco-b4-${i}`, { file: `deco/b4-${i}.png`, size: '1024x1024', square: true, prompt: SINGLE(d) }));

// ---- 访客第二批（40）----
const VIS2 = [
  'chinchilla with fluffy round body','capypara small sitting','red panda small sleepy',
  'alpaca tiny fluffy','pigeon pecking','woodpecker on a stump','kingfisher perched',
  'flamingo small standing one leg','swan small gliding','seagull standing',
  'octopus tiny waving','seahorse tiny curled','starfish orange sitting','hermit crab with shell',
  'shrimp tiny jumping','whale tiny spouting','dolphin tiny jumping','shark tiny smiling',
  'butterfly-green large','beetle-rhinoceros big','ant carrying a crumb','spider cute round not scary',
  'worm tiny peeking','snail-brown small','slug tiny with leaf','lizard green small',
  'chameleon tiny color-changing','gecko small on leaf','axolotl pink tiny smiling',
  'clownfish tiny swimming','pufferfish-green small','eel tiny curvy',
  'parakeet green small standing','cockatiel tiny with crest','canary yellow tiny singing',
  'finch small brown hopping','robin tiny red chest','sparrow-gray small fluffed',
  'moth-pink small fuzzy','dragonfly-blue wide wings',
];
VIS2.forEach((d, i) => A(`vis2-${i}`, { file: `vis/v2-${i}.png`, size: '1024x1024', square: true, prompt: SINGLE(d) }));

// ---- 新配色第三批 20 × 4 ----
const BODY = (c, b, stage) => stage === 'egg'
  ? `a single upright decorated egg, ${c} shell with wavy white zigzag band around the middle and one small orange heart motif, no face, standing straight, full body, front view, centered composition`
  : stage === 'baby'
    ? `a chubby round baby chick-like bird original character 'GuGu', ${c} body with ${b} belly, small stubby wings, tiny orange webbed feet, a small tuft of two feathers on top of head, faceless (no eyes, beak or mouth), big round belly taking the lower half of the body, full body, front view, centered composition`
    : stage === 'teen'
      ? `a chubby young teenage chick-like bird original character 'GuGu', slightly taller than a baby chick with small grown feather wings and a short budding tail, ${c} body with ${b} belly, tiny orange webbed feet, a small tuft of two feathers on top of head, faceless (no eyes, beak or mouth), full body, front view, centered composition`
      : `a plump grown-up round bird original character 'GuGu', elegant larger wings and a fluffy proud tail, confident upright pose, ${c} body with ${b} belly, orange webbed feet, a neat tuft of two feathers on top of head, faceless (no eyes, beak or mouth), full body, front view, centered composition`;
const VAR3 = [
  ['amber','warm amber gold','honey white'],['berry','deep berry red','blush pink'],['cream-teal','soft cream with teal tint','pale teal'],
  ['indigo','deep indigo blue','pale periwinkle'],['jade','muted jade green','pale celadon'],['latte','latte beige','foam white'],
  ['mango','ripe mango orange','pale cream'],['navy','classic navy','cloud white'],['pearl','pearl opalescent white','soft pink sheen'],
  ['plum','deep plum','light lilac'],['ruby','ruby red','blush'],['sage','soft sage green','cream'],
  ['bubblegum','bright bubblegum pink','white'],['teal','rich teal','pale aqua'],['violet','soft violet','lavender white'],
  ['walnut','walnut brown','tan'],['peppermint','peppermint white-red swirl tint','pale pink'],['denim','denim blue','pale chambray'],
  ['butter','butter yellow','white'],['rosemary','rosemary green-gray','pale gray-green'],
];
for (const [v, c, b] of VAR3) for (const st of ['egg','baby','teen','adult']) {
  A(`${st === 'egg' ? 'egg' : `body-${st}`}-${v}`, { file: `${v}-${st}.png`, size: '1024x1024', prompt: BODY(c, b, st) });
}

// ---- 小游戏美术 ----
// 大富翁：24 地块卡 + 骰子 + 4 棋子
const TILES = ['start-gate','park','bakery','library','fountain','luck-star','toy-shop','pond','hill','bus-stop','museum','tax-office','flower-shop','camp-site','river','bonus-chest','train-station','observatory','beach','farm','festival','hospital','castle','finish-flag'];
for (const t of TILES) A(`game-mono-${t}`, { file: `game/mono-${t}.png`, size: '1024x1024', square: true, prompt: SINGLE(`miniature game board tile illustration of a ${t.replace(/-/g, ' ')}, flat board-game token style`) });
A('game-mono-dice', { file: 'game/mono-dice.png', size: '1024x1024', square: true, prompt: SINGLE('a cute rounded white game dice showing five orange pips') });
for (let i = 1; i <= 4; i++) A(`game-mono-piece-${i}`, { file: `game/mono-piece-${i}.png`, size: '1024x1024', square: true, prompt: SINGLE(`a cute tiny board game meeple pawn in pastel color number ${i}`) });
// 连连看：24 图块（零食主题）
const LLK = ['taiyaki','dango','tart','macaron','pudding2','croissant','pretzel','waffle','candy-apple','mochi','senbei','melonbread','crepe','parfait','shortcake','eclair','madeleine','biscuit','jam-toast','cinnamon-roll','strawberry-pocky','chocolate-cornet','lemon-tart','cream puff'];
for (const t of LLK) A(`game-llk-${t}`, { file: `game/llk-${t}.png`, size: '1024x1024', square: true, prompt: SINGLE(`a cute ${t.replace(/-/g, ' ')} snack, flat tile icon style`) });
// 消消乐：14 元素
const M3 = ['strawberry','banana','grape2','orange2','blueberry','watermelon2','peach2','cherry','pineapple','kiwi','mango2','coconut','lychee','dragonfruit'];
for (const t of M3) A(`game-m3-${t}`, { file: `game/m3-${t}.png`, size: '1024x1024', square: true, prompt: SINGLE(`a glossy cute cartoon ${t.replace(/-/g, ' ')} fruit, match-3 game gem style`) });
// 幻兽合成：8 系 × 3 阶
const MERGE = ['star','cloud','flame','leaf','wave','moon','sun','crystal'];
const MERGE_NAMES = [['star','tiny star sprite'],['twinkle star spirit','bright galaxy star spirit'],['cloud','tiny cloud puff'],['rain cloud spirit','storm guardian spirit'],['flame','tiny flame ember'],['blaze spirit','phoenix spirit'],['leaf','tiny sprout leaf'],['bloom spirit','ancient forest spirit'],['wave','tiny droplet'],['river spirit','ocean spirit'],['moon','tiny moon shard'],['crescent spirit','full moon deity'],['sun','tiny sun spark'],['dawn spirit','solar deity'],['crystal','tiny crystal shard'],['prism spirit','crystal dragon spirit']];
let mi = 0;
for (const sys of MERGE) { for (let st = 1; st <= 3; st++) { const names = MERGE_NAMES[mi]; A(`game-merge-${sys}-${st}`, { file: `game/merge-${sys}-${st}.png`, size: '1024x1024', square: true, prompt: SINGLE(`a cute kawaii fantasy creature evolution stage ${st}: ${names[st - 1]} of the ${sys} family, glowing softly`) }); } mi++; }
// 游戏背景 8
const GBG = ['parlor','casino-soft','orchard','skyland','candyland','night-carnival','zen-garden','boardwalk'];
for (const b of GBG) A(`game-bg-${b}`, { file: `game/bg-${b}.png`, size: '1536x1024', prompt: `a kawaii storybook ${b.replace(/-/g, ' ')} game background, ${POSTCARD}` });

// ---- 成就徽章 18 ----
const BADGES = ['hatch','feed10','wash10','play10','work5','study5','tap50','teen','adult','rich','heal','game12','aiChat','travel1','album6','souvenir4','dressup','decor8'];
for (const b of BADGES) A(`badge-${b}`, { file: `badge/${b}.png`, size: '1024x1024', square: true, prompt: `a cute round golden achievement medal with a pastel icon of ${b.replace(/\d+/g, '').replace(/-/g, ' ')} theme, single object only, ` + STICKER });

// ---- 插画卡 24（关怀/天气/旅行信件）----
const ILLUS = [
  'a steaming bowl of rice with chopsticks and a warm kitchen','a cozy bed with a crescent moon lamp','a sunset desk scene with a closed laptop and tea',
  'a hot spring bath with a towel and bucket','a sunrise window with a plant','a night city window view with warm room light',
  'a picnic blanket with a basket','a train window with passing scenery','a mountain trail with a walking stick',
  'a beach umbrella with a book','a forest path with fireflies','a snow window with frost patterns',
  'a letter with a wax seal and pressed flower','a photo album open with tiny photos','a knitted scarf with needles',
  'an umbrella pair leaning at a door','a pair of rain boots by a mat','a star map with a tiny telescope',
  'a birthday cake with one candle','a first-aid kit with a bandage','a wallet with a lucky coin',
  'a game controller with snacks','a bookshelf ladder with a cat','a window box garden in bloom',
];
ILLUS.forEach((d, i) => A(`illus-${i}`, { file: `illus/${i}.png`, size: '1536x1024', prompt: `a kawaii storybook vignette of ${d}, ${POSTCARD}` }));

// ---- UI 图标 20（圆底）----
const UI = ['coin','heart2','star2','clock','settings-gear','shop-bag','map-pin','backpack3','book2','camera2','dice','trophy2','mail','bell','music-note','sun2','moon2','cloud2','raindrop','snowflake2'];
for (const u of UI) A(`ui-${u}`, { file: `ui/${u}.png`, size: '1024x1024', square: true, prompt: `a cute pastel app UI icon of ${u.replace(/-/g, ' ')} on a soft rounded white circle badge, single object, ` + STICKER });

writeFileSync(file, JSON.stringify(db, null, 2));
console.log('batch3 新增:', n, '总条目:', db.assets.length);
