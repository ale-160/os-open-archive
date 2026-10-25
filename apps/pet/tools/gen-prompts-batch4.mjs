/* eslint-disable */
/**
 * 第四批素材清单生成器：程序化模板产出 700 条 prompt。
 * - 写入独立清单 tools/prompts-batch4.json（可用 --set prompts-batch4.json 直接跑）
 * - 同时按 key 去重幂等合入 tools/prompts.json（参考 gen-prompts-batch2.mjs）
 * 用法：node tools/gen-prompts-batch4.mjs
 *
 * 分类：
 *  A 场景夜雨雾扩展  24 场景 × 10 时态 = 240（1536x1024 横幅）
 *  B 小游戏美术扩展  260：mono2 地块 60 / llk2 森林连连看 48 / m3b 宝石 28 /
 *                    merge2 幻兽 8 系 × 6 阶 48 / bg2 棋盘背景 12 / mono2-prop 骰子·棋子·道具 64
 *  C 装扮+装饰第三批 140：acc/b4b 80 + deco/b4b 60
 *  D 表情+访客       60：face/b3 40 + vis/v3 20
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const batch4File = path.join(here, 'prompts-batch4.json');
const mainFile = path.join(here, 'prompts.json');

const main = JSON.parse(readFileSync(mainFile, 'utf8'));

const STICKER = 'kawaii flat sticker style, thick dark brown outline, soft pastel colors, transparent background, no watermark, no text, centered';
const POSTCARD = 'kawaii flat illustration postcard art, soft pastel colors, cute storybook style, no text, no watermark, no characters, wide landscape composition';
const ITEM = (t) => `a cute ${String(t).replace(/^(a|an) /i, '')}, single object only, ${STICKER}`;
const CHIBI = "a tiny chibi sticker of the original character 'GuGu', a chubby round cream-yellow baby bird with big sparkly dark eyes, tiny orange beak and pink blush, ";

const assets = [];
const seen = new Set();
const add = (key, file, size, prompt, square) => {
  if (seen.has(key)) { console.warn('重复 key 跳过:', key); return; }
  seen.add(key);
  assets.push(square ? { key, file, size, square: true, prompt } : { key, file, size, prompt });
};

// ============ A. 场景夜雨雾扩展 24 × 10 = 240 ============
const scenes = [
  'garden', 'lake', 'bamboo', 'roof', 'meadow', 'courtyard', 'starry-hill', 'riverside',
  'sakura-park', 'autumn-lane', 'snow-town', 'seaside-cliff', 'greenhouse', 'windmill',
  'library-nook', 'lantern-street', 'sunflower-field', 'desert-oasis', 'alpine',
  'night-market', 'pond', 'maple-bridge', 'cloud-deck', 'terrace-cafe',
];
const tenses = [
  ['fog', 'shrouded in soft dreamy rolling fog'],
  ['storm', 'in a dramatic thunderstorm with dark clouds, rain streaks and distant lightning'],
  ['aurora', 'under a glowing pastel aurora borealis in the night sky'],
  ['meteor', 'under a meteor shower with many shooting stars streaking across the night sky'],
  ['rainbow', 'after the rain with a big pastel double rainbow arching over'],
  ['hail', 'during a light hailstorm with small white ice pellets bouncing on the ground'],
  ['rainbow-night', 'at night with a faint glowing moonbow arching in the moonlight'],
  ['mist-morning', 'in gentle silvery morning mist with soft golden sunrise light'],
  ['sunset-purple', 'at dusk under a gorgeous purple and violet gradient sunset sky'],
  ['full-moon', 'at night under a huge glowing full moon and scattered stars'],
];
for (const id of scenes) {
  const display = id.replace(/-/g, ' ');
  for (const [t, desc] of tenses) {
    add(`scene-${id}-${t}`, `scene/${id}-${t}.png`, '1536x1024',
      `the same kawaii storybook ${display} scene ${desc}, ${POSTCARD}`);
  }
}

// ============ B1. 大富翁第二季地块 60 ============
const mono2 = [
  ['cinema', 'a movie cinema with marquee and film reel sign'],
  ['arcade', 'a retro game arcade with pixel heart sign'],
  ['zoo', 'a tiny zoo entrance with a giraffe statue'],
  ['aquarium', 'a round aquarium building with fish bubble sign'],
  ['ramen-shop', 'a cozy ramen shop with steaming bowl sign and noren curtain'],
  ['sushi-bar', 'a small sushi bar with a conveyor belt'],
  ['airport', 'a tiny airport terminal with a control tower and airplane'],
  ['harbor', 'a little harbor pier with fishing boats and cranes'],
  ['lighthouse', 'a striped lighthouse on rocks'],
  ['temple', 'a small temple gate with incense smoke'],
  ['shrine', 'a tiny shrine with torii gate and rope bell'],
  ['pagoda', 'a five-story pagoda tower'],
  ['castle-gate', 'a stone castle gate with drawbridge'],
  ['candy-shop', 'a candy shop with lollipop display'],
  ['chocolate-factory', 'a chocolate factory with pipes and cocoa sign'],
  ['coffee-cafe', 'a coffee cafe with cup sign and striped awning'],
  ['tea-house', 'a traditional tea house with paper windows'],
  ['grand-hotel', 'a grand hotel with golden doors and a flag'],
  ['inn', 'a cozy roadside inn with warm windows'],
  ['school', 'a small schoolhouse with bell and flag'],
  ['university', 'a tiny university hall with columns and book sign'],
  ['stadium', 'a round sports stadium with banner'],
  ['ice-rink', 'an ice skating rink with tiny skate sign'],
  ['bowling-alley', 'a bowling alley with pin sign'],
  ['karaoke-box', 'a karaoke box with music note sign'],
  ['hot-spring', 'a steaming hot spring bath house'],
  ['public-bath', 'a public bath house with chimney'],
  ['ferris-wheel', 'a pastel ferris wheel'],
  ['carousel', 'a tiny carousel with striped roof'],
  ['roller-coaster', 'a small roller coaster loop'],
  ['haunted-house', 'a spooky haunted house with ghost sign'],
  ['fun-house', 'a wobbly fun house with clown face door'],
  ['maze-garden', 'a hedge maze garden with topiary'],
  ['vineyard', 'a vineyard with grape rows and barrels'],
  ['tea-plantation', 'a terraced tea plantation on a hill'],
  ['bee-apiary', 'a bee apiary with striped hives'],
  ['cheese-dairy', 'a dairy farm with cheese wheel sign'],
  ['fish-market', 'a fish market stall with ice and fish'],
  ['flower-market', 'a flower market stall with buckets of blooms'],
  ['antique-shop', 'an antique shop with dusty curiosities'],
  ['book-cafe', 'a book cafe with stacked books and coffee'],
  ['art-studio', 'an art studio with easel and paint'],
  ['music-hall', 'a music hall with violin sign'],
  ['theater', 'a small theater with comedy mask sign'],
  ['opera-house', 'a tiny opera house with red curtains'],
  ['planetarium', 'a dome planetarium with star sign'],
  ['science-lab', 'a science lab with flask and atom sign'],
  ['clinic', 'a small clinic with cross sign'],
  ['fire-station', 'a fire station with a red truck'],
  ['police-box', 'a tiny police box with blue lamp'],
  ['post-office', 'a post office with letter sign'],
  ['bank', 'a small bank with coin sign and columns'],
  ['courthouse', 'a courthouse with scales sign'],
  ['city-hall', 'a city hall with clock and flags'],
  ['clock-tower', 'a tall clock tower'],
  ['skyscraper', 'a rounded pastel skyscraper'],
  ['apartment', 'a small apartment building with balconies'],
  ['subway-station', 'a subway station entrance with stairs and sign'],
  ['cable-car', 'a cable car cabin on a line'],
  ['tram-stop', 'a tram stop with a little tram'],
];
for (const [id, desc] of mono2) add(`game-mono2-${id}`, `game/mono2-${id}.png`, '1024x1024', ITEM(`miniature game board tile illustration of ${desc}`), true);

// ============ B2. 连连看第二批 森林系 48 ============
const llk2 = [
  ['mushroom-fly', 'a red fly agaric mushroom with white dots'],
  ['mushroom-porcini', 'a brown porcini mushroom'],
  ['mushroom-chanterelle', 'orange chanterelle mushrooms'],
  ['mushroom-puffball', 'a round white puffball mushroom'],
  ['mushroom-blue', 'a little blue fairy mushroom'],
  ['mushroom-purple', 'a little purple fairy mushroom'],
  ['mushroom-coral', 'a pink coral fungus cluster'],
  ['mushroom-amber', 'a tiny amber-cap mushroom'],
  ['cone-pine', 'a brown pinecone'],
  ['cone-spruce', 'a long slim spruce cone'],
  ['cone-larch', 'a small round larch cone'],
  ['cone-sweetgum', 'a spiky sweetgum ball'],
  ['nut-acorn', 'a shiny acorn'],
  ['nut-chestnut', 'a glossy chestnut'],
  ['nut-hazelnut', 'a pair of hazelnuts'],
  ['nut-walnut', 'a round walnut'],
  ['leaf-maple', 'a red maple leaf'],
  ['leaf-oak', 'an orange oak leaf'],
  ['leaf-ginkgo', 'a yellow ginkgo leaf'],
  ['leaf-birch', 'a golden birch leaf'],
  ['leaf-aspen', 'a round green aspen leaf'],
  ['leaf-ivy', 'a green ivy leaf'],
  ['leaf-fern', 'a curled fern frond'],
  ['leaf-willow', 'a slender willow leaf'],
  ['berry-strawberry', 'a wild strawberry'],
  ['berry-blackberry', 'a blackberry cluster'],
  ['berry-currant', 'a red currant cluster'],
  ['berry-blueberry', 'a blueberry sprig'],
  ['berry-rosehip', 'a bright red rosehip'],
  ['berry-rowan', 'a rowan berry cluster'],
  ['berry-lingonberry', 'lingonberries with leaves'],
  ['berry-elderberry', 'a dark elderberry cluster'],
  ['flower-daisy', 'a white daisy'],
  ['flower-violet', 'a little violet flower'],
  ['flower-lily-valley', 'lily of the valley bells'],
  ['flower-dandelion', 'a dandelion seed clock'],
  ['flower-thistle', 'a purple thistle'],
  ['flower-clover', 'a clover sprig'],
  ['flower-poppy', 'a red poppy'],
  ['flower-snowdrop', 'white snowdrop flowers'],
  ['forest-moss-rock', 'a mossy rock'],
  ['forest-stump', 'a little tree stump with rings'],
  ['forest-log', 'a hollow mossy log'],
  ['forest-nest', 'a bird nest with blue eggs'],
  ['forest-feather', 'a small blue feather'],
  ['forest-amber', 'a golden amber resin drop'],
  ['forest-snail-shell', 'a spiral snail shell'],
  ['forest-wood-slice', 'a wooden slice with rings'],
];
for (const [id, desc] of llk2) add(`game-llk2-${id}`, `game/llk2-${id}.png`, '1024x1024', ITEM(`${desc}, flat tile icon style`), true);

// ============ B3. 消消乐第二批 宝石 28 ============
const m3b = [
  ['ruby', 'red ruby'], ['emerald', 'green emerald'], ['sapphire', 'blue sapphire'], ['amethyst', 'purple amethyst'],
  ['topaz', 'golden topaz'], ['opal', 'iridescent opal'], ['garnet', 'deep red garnet'], ['peridot', 'lime green peridot'],
  ['aquamarine', 'aqua aquamarine'], ['citrine', 'honey citrine'], ['tourmaline', 'pink and green tourmaline'], ['moonstone', 'glowing milky moonstone'],
  ['onyx', 'black onyx'], ['jade', 'green jade'], ['lapis', 'deep blue lapis lazuli'], ['turquoise', 'turquoise stone'],
  ['spinel', 'hot pink spinel'], ['zircon', 'champagne zircon'], ['tanzanite', 'violet blue tanzanite'], ['morganite', 'peach morganite'],
  ['alexandrite', 'color shifting alexandrite'], ['labradorite', 'shimmering blue labradorite'], ['rose-quartz', 'soft pink rose quartz'], ['obsidian', 'glassy black obsidian'],
  ['amber', 'golden amber with a tiny leaf inside'], ['smoky-quartz', 'smoky brown quartz'], ['sunstone', 'sparkling orange sunstone'], ['fluorite', 'banded green and purple fluorite'],
];
const gemShapes = ['round brilliant cut', 'square cushion cut', 'teardrop cut', 'hexagonal cut', 'star cut', 'heart cut'];
m3b.forEach(([id, name], i) => add(`game-m3b-${id}`, `game/m3b-${id}.png`, '1024x1024',
  ITEM(`${name} gemstone in ${gemShapes[i % gemShapes.length]} with facet sparkle, match-3 game gem style`), true));

// ============ B4. 幻兽第二期 8 系 × 6 阶 = 48 ============
const merge2 = [
  ['shadow', ['a tiny round shadow puff with big eyes', 'a small shadow imp with wisp tail', 'a shadow kitten with glowing purple eyes', 'a shadow wolf pup with smoky mane', 'a tall night shade beast with a crown of smoke', 'a majestic eclipse phantom with starry void body']],
  ['light', ['a tiny glowing light mote', 'a small radiant wisp with halo', 'a luminous sparkle sprite', 'a radiant fawn with light antlers', 'a dawn guardian with prism wings', 'a serene seraph of pure light']],
  ['thunder', ['a tiny crackling spark ball', 'a small static imp with zigzag tail', 'a zap kitten with lightning bolt mark', 'a storm wolf pup with electric mane', 'a thunder beast with storm clouds', 'a mighty tempest dragon with lightning wings']],
  ['frost', ['a tiny snowflake sprite', 'a small frost puff with icy breath', 'an ice kitten with crystal fur', 'a snow wolf pup with frosty mane', 'a glacier beast with ice spikes', 'a regal blizzard dragon with frozen wings']],
  ['blossom', ['a tiny seed bud sprite', 'a small sprout puff with leaf ears', 'a flower kitten with petal collar', 'a bloom fawn with flower antlers', 'a garden guardian with blooming mane', 'a grand sakura treant in full bloom']],
  ['rock', ['a tiny round pebble sprite', 'a small stone puff with moss', 'a boulder imp with crystal eyes', 'a gem golet with ruby spikes', 'a mountain golem with boulder shoulders', 'a colossal titan golem with crystal crown']],
  ['gale', ['a tiny swirling breeze wisp', 'a small wind puff with cloud tail', 'a zephyr imp with feathered ears', 'a cyclone kitten riding wind swirls', 'a storm falcon with silver wings', 'a sky dragon riding cyclone clouds']],
  ['abyss', ['a tiny bubble sprite', 'a small ink puff with fin ears', 'a tide imp with little fins', 'a wave kitten with a water swirl tail', 'a kraken hatchling with tiny tentacles', 'a great leviathan with glowing depth lights']],
];
for (const [fam, stages] of merge2) {
  stages.forEach((desc, i) => add(`game-merge2-${fam}-${i + 1}`, `game/merge2-${fam}-${i + 1}.png`, '1024x1024',
    `a cute kawaii fantasy creature evolution stage ${i + 1}: ${desc} of the ${fam} family, glowing softly, single object only, ${STICKER}`, true));
}

// ============ B5. 棋盘背景 12（四季×昼夜 + 4 特别时辰） ============
const bg2 = [
  ['spring-day', 'rolling green meadow with drifting sakura petals in spring daytime'],
  ['spring-night', 'flowery meadow in spring under a starry night sky'],
  ['summer-day', 'sunny seaside meadow in bright summer daytime'],
  ['summer-night', 'beach meadow in summer with fireflies and a night sky'],
  ['autumn-day', 'golden maple grove in autumn daytime'],
  ['autumn-night', 'autumn forest clearing under a big harvest moon'],
  ['winter-day', 'snowy pine field in winter daytime'],
  ['winter-night', 'snowy field in winter under an aurora night sky'],
  ['sunrise', 'misty hills at soft sunrise'],
  ['sunset', 'warm lake horizon at glowing sunset'],
  ['starry', 'open meadow under the milky way'],
  ['rainy', 'cozy meadow in gentle blue rain'],
];
for (const [id, desc] of bg2) add(`game-bg2-${id}`, `game/bg2-${id}.png`, '1536x1024',
  `a kawaii storybook game board background of ${desc}, wide open flat playfield with no objects, ${POSTCARD}`);

// ============ B6. 骰子面/棋子/道具 64 ============
const propDescs = [];
for (let f = 1; f <= 6; f++) propDescs.push(`a rounded white game dice showing ${f} orange ${f === 1 ? 'pip' : 'pips'}, slightly tilted`);
for (let f = 1; f <= 6; f++) propDescs.push(`a rounded golden game dice showing ${f} pink ${f === 1 ? 'pip' : 'pips'}, slightly tilted`);
for (const c of ['mint green', 'lavender', 'butter yellow', 'coral pink', 'sky blue', 'sage green', 'peach', 'lilac']) {
  propDescs.push(`a cute tiny board game meeple pawn in pastel ${c}`);
}
propDescs.push(
  'a small green board game house token',
  'a small red board game hotel token',
  'a chance card with a big question mark',
  'a property title deed card with a ribbon',
  'a stack of golden coins',
  'a tiny treasure chest key',
  'a classic black top hat game token',
  'a tiny silver thimble game token',
  'a tiny brown boot game token',
  'a tiny wooden wheelbarrow game token',
  'a tiny sitting cat game token',
  'a tiny sitting dog game token',
  'a tiny steamship game token',
  'a tiny race car game token',
  'a tiny flat iron game token',
  'a tiny purse game token',
  'a red and white striped dice cup with dice',
  'a jail card with little bars',
  'a golden free pass ticket card',
  'a tiny toy train game token',
  'a lightning bolt utility card',
  'a water faucet utility card',
  'a glowing light bulb utility card',
  'a golden trophy cup',
  'a golden crown token',
  'a small pennant flag marker',
  'a folded treasure map',
  'a brass compass',
  'a tiny glowing lantern token',
  'a stack of travel tickets',
  'a small passport booklet',
  'a tiny suitcase with travel stickers',
  'a tiny camera game token',
  'a tiny brass binoculars token',
  'a tiny teacup game token',
  'a tiny teapot game token',
  'a honey jar game token',
  'a star shaped golden coin',
  'a moon shaped silver coin',
  'a heart gem game token',
  'a lucky clover token',
  'a tiny bell game token',
  'a tiny drum game token',
  'a tiny trumpet game token',
);
propDescs.forEach((desc, i) => add(`game-mono2-prop-${i + 1}`, `game/mono2-prop-${i + 1}.png`, '1024x1024', ITEM(desc), true));

// ============ C1. 配件第三批 80（transparent，无人物） ============
const accB4 = [
  // 春 12
  'a sakura blossom hair clip with tiny petals',
  'a tulip shaped mini hat pin',
  'a butterfly wing hair clip in pastel pink',
  'a lucky four leaf clover brooch',
  'a green sprout headband with two leaves',
  'a wisteria flower corsage',
  'a small rainbow arc pin',
  'a pastel polka dot rain bonnet',
  'a daisy chain bracelet',
  'a soft green leaf scarf',
  'a bunny ear hood ribbon',
  'a cherry blossom pom pom hair tie',
  // 夏 12
  'a seashell hair clip with a pearl',
  'a tiny starfish hairpin',
  'a watermelon slice bucket hat',
  'a palm tree print beach straw hat',
  'a snorkel mask with a pastel strap',
  'a red and white life buoy ring',
  'a flower lei necklace',
  'a wave pattern blue scarf',
  'a jellyfish charm hairpin',
  'a coral branch hairpin',
  'an ice pop hair clip',
  'a tiny sailboat pin',
  // 秋 12
  'a maple leaf hairpin',
  'an acorn cap beret',
  'a fox ear headband in autumn orange',
  'a pumpkin beanie with a leaf stem',
  'a golden wheat wreath',
  'a tiny mushroom brooch',
  'a pinecone pendant necklace',
  'a chestnut brooch',
  'a plaid orange scarf',
  'an amber drop necklace',
  'a ginkgo leaf hairpin',
  'a tiny acorn shoulder bag',
  // 冬 12
  'a snowflake hairpin in ice blue',
  'a white pom pom beanie',
  'a fluffy white fur cape',
  'a snow globe pendant necklace',
  'an icicle hairpin with crystals',
  'a polar bear ear headband',
  'a pair of mittens on a string',
  'a crystal snowflake brooch',
  'a holly berry hairpin',
  'a snowman button brooch',
  'a candy cane hair clip',
  'an aurora gradient veil',
  // 职业 16
  'a shiny silver knight helmet with a plume',
  'a golden princess tiara with pink gems',
  'a black witch hat with a star buckle',
  'a pirate tricorn hat with a skull mark',
  'a black eye patch with a strap',
  'a royal red velvet cape with ermine trim',
  'a white chef apron with a pocket',
  'a red firefighter helmet',
  'a navy police cap with a badge',
  'a white sailor cap with an anchor',
  'a brown explorer pith helmet',
  'a miner helmet with a headlamp',
  'a brown aviator cap with goggles',
  'a brown cowboy hat with a band',
  'a red ninja headband with tails',
  'a magician wand with a star tip',
  // 材质 16
  'a soft white feather shawl',
  'a rainbow feather hair pin',
  'a crystal quartz hair crown',
  'a pair of ice crystal wings',
  'a wooden carved leaf hairpin',
  'a woven straw shoulder bag with a flower',
  'a glass slipper charm pin',
  'a porcelain white hairpin with a blue pattern',
  'a golden thread embroidered scarf',
  'a silver bell charm bracelet',
  'a translucent jelly hairpin',
  'a velvet grape purple bow',
  'a lace frill collar',
  'a denim blue mini cap',
  'a marble pattern bead necklace',
  'a glittery tulle mini veil',
];
accB4.forEach((desc, i) => add(`acc-b4b-${i + 1}`, `acc/b4b-${i + 1}.png`, '1024x1024', ITEM(`${desc}, no character, no person`), true));

// ============ C2. 装饰第三批 60 ============
const decoB4 = [
  // 春日庭院 7
  'a potted sakura tree in full bloom',
  'a tulip flowerbed with a wooden border',
  'a white picket fence with mushroom caps',
  'a butterfly feeder with fruit',
  'a wisteria trellis arch',
  'a little flower cart with bouquets',
  'rain boot planters with flowers',
  // 盛夏庭院 7
  'a small round pool with a tiny ladder',
  'a garden parasol with a beach chair',
  'a water sprinkler spraying rainbow drops',
  'a garden hose coiled in a pot',
  'a seashell wind chime',
  'a watermelon table with two stools',
  'a tiny lemonade stand',
  // 秋日庭院 7
  'a big pile of fallen leaves',
  'a pumpkin harvest cart',
  'a basket of acorns',
  'a maple leaf arch trellis',
  'a round hay bale',
  'a lanternberry bush with tiny glowing berries',
  'a scarecrow with a straw hat',
  // 冬雪庭院 7
  'a snowman shaped playhouse with a carrot nose door',
  'a snow covered pine tree with lights',
  'a glowing ice lantern sculpture',
  'a wooden sled leaning on snow',
  'a mitten and scarf stand',
  'a frozen birdbath with ice patterns',
  'a snowman family of three',
  // 春节 6
  'a string of red chinese lanterns',
  'a golden lucky knot hanging ornament',
  'a red envelope tree with lucky packets',
  'a firecracker decoration string',
  'a dancing dragon head puppet on a stick',
  'a paper fan wall decoration',
  // 中秋 4
  'a rabbit shaped paper lantern',
  'a mooncake festival stand with tea',
  'a glowing paper full moon lamp',
  'an osmanthus flower pot',
  // 万圣 5
  'a little ghost balloon cluster',
  'a witch cauldron with green brew',
  'a candy bowl with a pumpkin face',
  'a bat garland string',
  'a spooky arch gate with pumpkins',
  // 圣诞 5
  'a pile of wrapped gifts with ribbons',
  'a candy cane fence border',
  'a gingerbread house with icing',
  'a reindeer sleigh with gifts',
  'a wreath adorned lamp post',
  // 功能设施 12
  'a wooden swing frame with a seat',
  'a small round trampoline',
  'a pastel playground slide',
  'a seesaw with pastel seats',
  'a wooden sandbox with toys',
  'a climbing frame with a rope net',
  'a pair of hanging gymnastic rings',
  'a rope ladder',
  'a ball pit with pastel balls',
  'a balance beam on grass',
  'a mini carousel ride',
  'a tiny basketball hoop stand',
];
decoB4.forEach((desc, i) => add(`deco-b4b-${i + 1}`, `deco/b4b-${i + 1}.png`, '1024x1024', ITEM(desc), true));

// ============ D1. 表情贴纸 40 ============
const faceB4 = [
  // 节日 10
  'holding a burning sparkler with wonder',
  'holding a red envelope with both wings',
  'holding a mooncake with crumbs on the beak',
  'holding a pumpkin candy basket for trick or treat',
  'holding a big candy cane',
  'wearing a party cone hat throwing confetti',
  'wearing a flower lei dancing',
  'wearing a fox festival mask waving',
  'lighting a tiny paper lantern',
  'wearing a birthday hat blowing a party horn',
  // 旅行 10
  'riding a rolling suitcase happily',
  'holding a map looking confused',
  'wearing aviator goggles waving a tiny flag',
  'sailing in a paper boat with a leaf sail',
  'hiking with a walking stick and bandana',
  'holding a selfie stick making a peace sign',
  'riding a tiny train waving from the window',
  'holding a boarding pass excited',
  'peeking out of a sleeping bag at camp',
  'holding a cup of instant noodles slurping',
  // 睡姿 10
  'sleeping curled up like a croissant',
  'sleeping hugging a tiny pillow',
  'sleeping in a striped hammock',
  'napping on a stack of books',
  'sleeping sitting upright with head bobbing',
  'tucked in a tiny bed with a blanket',
  'sleeping on a fluffy cloud',
  'hibernating wrapped in a leaf blanket',
  'dreaming with a dream bubble of snacks',
  'sleepy with drooped wings rubbing eyes',
  // 吃东西 10
  'eating ramen noodles with chopsticks',
  'drinking bubble tea through a straw',
  'biting a big watermelon slice',
  'eating a taiyaki from the tail first',
  'licking a dripping ice cream cone',
  'munching a big rice cracker',
  'sipping hot cocoa with marshmallows',
  'eating popcorn from a striped bucket',
  'tasting soup with a tiny spoon',
  'nibbling a chocolate bar with the wrapper',
];
faceB4.forEach((desc, i) => add(`face-b3-${i + 1}`, `face/b3-${i + 1}.png`, '1024x1024', CHIBI + desc + ', ' + STICKER, true));

// ============ D2. 访客（传说生物）20 ============
const vis3 = [
  ['qilin', 'a baby qilin fawn with soft golden scales and tiny antlers'],
  ['fenghuang', 'a baby phoenix chick with flowing rainbow tail feathers'],
  ['jade-rabbit', 'a white moon rabbit with a jade pendant'],
  ['merfolk', 'a little merfolk child with a teal tail'],
  ['yeti', 'a small fluffy white yeti kit'],
  ['griffin', 'a baby griffin cub with fluffy wings'],
  ['unicorn', 'a tiny unicorn foal with a pastel mane'],
  ['dragonet', 'a small chubby dragonet hatchling'],
  ['kitsune', 'a little kitsune pup with three fluffy tails'],
  ['tanuki', 'a chubby tanuki kit with a leaf on its head'],
  ['sphinx', 'a tiny sphinx kitten with golden wing wraps'],
  ['wyvern', 'a tiny wyvern hatchling with rounded wings'],
  ['ember-salamander', 'a small ember salamander with glowing spots'],
  ['sea-serpent', 'a baby sea serpent with cute fins'],
  ['pixie', 'a tiny pixie sprite with dragonfly wings'],
  ['golem', 'a baby pebble golem with moss'],
  ['wisp', 'a floating will-o-wisp with a gentle flame'],
  ['pegasus', 'a small pegasus foal with cloud white wings'],
  ['hippocampus', 'a tiny hippocampus sea foal'],
  ['thunderbird', 'a thunderbird chick with storm feathers'],
];
for (const [id, desc] of vis3) add(`vis-v3-${id}`, `vis/v3-${id}.png`, '1024x1024', ITEM(desc), true);

// ============ 校验 & 写盘 ============
const expect = [
  ['scene-', 240], ['game-mono2-', 124], ['game-llk2-', 48], ['game-m3b-', 28],
  ['game-merge2-', 48], ['game-bg2-', 12], ['game-mono2-prop-', 64],
  ['acc-b4b-', 80], ['deco-b4b-', 60], ['face-b3-', 40], ['vis-v3-', 20],
];
for (const [p, n] of expect) {
  const c = assets.filter((a) => a.key.startsWith(p)).length;
  if (c !== n) throw new Error(`分类计数不符: ${p} 期望 ${n} 实际 ${c}`);
}
if (assets.length !== 700) throw new Error(`总数不符: 期望 700 实际 ${assets.length}`);

const batch4 = { style: main.style, assets };
writeFileSync(batch4File, JSON.stringify(batch4, null, 2));

const has = new Set(main.assets.map((a) => a.key));
let merged = 0;
for (const a of batch4.assets) {
  if (!has.has(a.key)) { main.assets.push(a); has.add(a.key); merged++; }
}
writeFileSync(mainFile, JSON.stringify(main, null, 2));
console.log(`prompts-batch4.json: ${batch4.assets.length} 条`);
console.log(`合入 prompts.json 新增 ${merged} 条，总条目 ${main.assets.length}`);
