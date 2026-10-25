/* eslint-disable */
/**
 * 大规模素材清单生成器：程序化模板产出 340+ 条 prompt 合入 tools/prompts.json。
 * 用法：node tools/gen-prompts-batch2.mjs   （幂等：按 key 去重）
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, 'prompts.json');
const db = JSON.parse(readFileSync(file, 'utf8'));
const has = new Set(db.assets.map((a) => a.key));
const add = (key, o) => { if (!has.has(key)) { db.assets.push({ key, ...o }); has.add(key); } };

const STICKER = 'kawaii flat sticker style, thick dark brown outline, soft pastel colors, transparent background, no watermark, no text, centered';
const SINGLE = (t) => `a cute ${t}, single object only, ` + STICKER;
const CHIBI = "a tiny chibi sticker of the original character 'GuGu', a chubby round cream-yellow baby bird with big sparkly dark eyes, tiny orange beak and pink blush, ";
const POSTCARD = 'kawaii flat illustration postcard art, soft pastel colors, cute storybook style, no text, no watermark, no characters, wide landscape composition';

// ---------- B. 场景背景 16+12（1536x1024 横幅） ----------
const scenes = [
  ['garden', 'a flower garden with tulips and daisies, a small wooden fence, butterflies in the distance'],
  ['lake', 'a calm lakeside at late afternoon with reeds, lily pads and distant hills reflecting on water'],
  ['bamboo', 'a peaceful bamboo grove with tall green bamboo stalks and soft light filtering through'],
  ['roof', 'a cozy rooftop terrace with potted plants, hanging laundry line with tiny flags, city skyline at dusk'],
  ['meadow', 'a wide green meadow with wildflowers, gentle hills and a big cotton-cloud sky'],
  ['courtyard', 'a small cozy courtyard with a brick wall, round window, potted herbs and a hanging wind chime'],
  ['starry-hill', 'a grassy hilltop at night under a huge starry milky way sky with fireflies'],
  ['riverside', 'a gentle riverside with smooth stones, a tiny wooden bridge and willow branches'],
  ['sakura-park', 'a park path under blooming sakura trees with drifting petals'],
  ['autumn-lane', 'a quiet lane with golden ginkgo trees and falling leaves'],
  ['snow-town', 'a small snowy town street with warm window lights and snowdrifts'],
  ['seaside-cliff', 'a grassy seaside cliff overlooking turquoise sea with seagulls in the distance'],
  ['greenhouse', 'a bright little greenhouse full of plants and hanging pots'],
  ['windmill', 'a Dutch style field with a small windmill and tulip rows'],
  ['library-nook', 'an outdoor reading nook with bookshelves on a garden wall and a cozy bench'],
  ['lantern-street', 'an old street lined with glowing paper lanterns at twilight'],
  ['sunflower-field', 'a vast sunflower field facing the sunrise'],
  ['desert-oasis', 'a tiny desert oasis with a pond and two palm trees under warm sky'],
  ['alpine', 'an alpine meadow with snowy peaks behind and edelweiss flowers'],
  ['night-market', 'a tiny cozy night market stall street with food stands and string lights'],
  ['pond', 'a quiet frog pond with lotus and cattails at morning'],
  ['maple-bridge', 'a red arched bridge over a maple stream in autumn'],
  ['cloud-deck', 'a dreamy deck standing on clouds with a rainbow in the sky'],
  ['terrace-cafe', 'a tiny outdoor cafe terrace with a round table, croissants and flower pots'],
];
for (const [id, desc] of scenes) add(`scene-${id}`, { file: `scene/${id}.png`, size: '1536x1024', prompt: `${desc}, ${POSTCARD}` });

// ---------- C. 生态访客 24+12（透明小动物） ----------
const visitors = [
  ['sparrow', 'a tiny brown sparrow with round body'], ['firefly', 'a glowing firefly with soft light trail'],
  ['ladybug', 'a red ladybug with black spots'], ['snail', 'a small snail with a swirl shell'],
  ['dragonfly', 'a delicate dragonfly with translucent wings'], ['bee', 'a round fluffy bumblebee'],
  ['butterfly-blue', 'a blue morpho butterfly with open wings'], ['butterfly-orange', 'a small orange monarch butterfly'],
  ['cat', 'a small orange tabby kitten sitting'], ['dove', 'a white dove standing'],
  ['frog', 'a tiny green tree frog'], ['rabbit', 'a small white bunny with long ears'],
  ['hamster', 'a round golden hamster with cheek pouches'], ['hedgehog', 'a tiny hedgehog with soft spikes'],
  ['squirrel', 'a small brown squirrel holding an acorn'], ['turtle', 'a tiny baby turtle'],
  ['chick', 'a small yellow chick (not GuGu, plain chick)'], ['owl', 'a small round sleepy owl'],
  ['koi', 'a white-orange koi fish jumping with water splash'], ['penguin', 'a tiny chibi penguin waving'],
  ['deer', 'a small fawn with white spots'], ['raccoon', 'a small raccoon with a tiny mask face'],
  ['fox', 'a small fluffy orange fox curled'], ['pufferfish', 'a round cute pufferfish'],
  ['moth', 'a fluffy pale luna moth'], ['beetle', 'a round green rainbow beetle'],
  ['mouse', 'a tiny gray mouse holding cheese'], ['duckling', 'a small duckling waddling'],
  ['crow', 'a small glossy crow with a shiny pebble'], ['bat', 'a tiny round bat flying at night'],
  ['crab', 'a small orange crab waving claws'], ['jellyfish', 'a translucent pink jellyfish floating'],
  ['salamander', 'a small orange salamander'], ['hummingbird', 'a tiny hummingbird hovering'],
  ['moth-owl', 'a butterfly-owl moth with patterned wings'], ['leaf-spirit', 'a tiny spirit made of a glowing green leaf'],
];
for (const [id, desc] of visitors) add(`vis-${id}`, { file: `vis/${id}.png`, size: '1024x1024', square: true, prompt: SINGLE(desc) });

// ---------- D. 配件二批+三批（节日/职业/眼镜等 30+24） ----------
const acc2 = [
  ['santa', 'head', 'Santa Claus red hat with white fur trim and pom', '圣诞帽', 18],
  ['pumpkin', 'head', 'small orange pumpkin bucket hat with a green stem', '南瓜帽', 16],
  ['wizard', 'head', 'a tiny blue wizard pointy hat with stars', '巫师帽', 22],
  ['chef', 'head', 'a white chef toque hat', '厨师帽', 18],
  ['detective', 'head', 'a brown detective deerstalker hat', '侦探帽', 20],
  ['beret', 'head', 'a red artist beret', '画家贝雷帽', 15],
  ['cap', 'head', 'a baby blue baseball cap', '棒球帽', 14],
  ['bucket', 'head', 'a tiny yellow rain bucket hat', '小雨帽', 15],
  ['flower-crown', 'head', 'a delicate crown made of small daisies', '花冠', 20],
  ['headphones', 'head', 'pastel pink over-ear headphones', '耳机', 24],
  ['earmuffs', 'head', 'fluffy white earmuffs with a band', '毛绒耳罩', 16],
  ['space-helmet', 'head', 'a round clear glass space helmet with rainbow reflection', '太空头盔', 30],
  ['sunglasses', 'eyes', 'cool black wayfarer sunglasses', '墨镜', 16],
  ['star-glasses', 'eyes', 'yellow star-shaped party glasses', '星星眼镜', 15],
  ['monocle', 'eyes', 'a single golden monocle with a chain', '单片眼镜', 18],
  ['scarf-red', 'scarf', 'a long cozy red knitted scarf', '红围巾', 18],
  ['scarf-yellow', 'scarf', 'a soft mustard yellow scarf', '芥末黄围巾', 18],
  ['bandana', 'scarf', 'a sky blue polka dot bandana neckerchief', '小方巾', 12],
  ['necklace', 'scarf', 'a tiny golden necklace with a fish pendant', '小鱼项链', 20],
  ['bell', 'scarf', 'a red collar with a small golden bell', '铃铛项圈', 15],
  ['wings', 'side', 'tiny white angel wings', '小天使翅膀', 25],
  ['cape', 'side', 'a small red superhero cape', '英雄披风', 25],
  ['bag-star', 'side', 'a small yellow star-shaped shoulder bag', '星星小包', 18],
  ['watch', 'side', 'a tiny pastel wristwatch', '小手表', 15],
  ['hairpin', 'side', 'a small silver moon hairpin', '月亮发夹', 12],
  ['pin-wheel', 'side', 'a colorful small pinwheel on a stick', '小风车', 14],
  ['badge-star', 'side', 'a round golden star badge pin', '星星徽章', 16],
  ['umbrella', 'side', 'a tiny yellow umbrella held tilted', '小黄伞', 18],
];
for (const [id, _anchor, desc, _zh, _price] of acc2) add(`acc-${id}`, { file: `acc/${id}.png`, size: '1024x1024', square: true, prompt: SINGLE(desc) });
const acc3 = [
  ['grad-cap', 'head', 'a black graduation cap with golden tassel', '毕业帽'],
  ['tophat', 'head', 'a small black top hat with red ribbon', '礼帽'],
  ['straw-circle', 'head', 'a round straw hat with hollow center (Chinese farmer style)', '斗笠'],
  ['veil', 'head', 'a short white wedding veil with tiny flowers', '头纱'],
  ['crown-flower', 'head', 'a small crown made of pink cherry blossoms', '樱花冠'],
  ['helmet-wood', 'head', 'a tiny wooden viking helmet with small horns', '维京盔'],
  ['nightcap', 'head', 'a striped blue nightcap with pom tail', '睡帽'],
  ['raincoat-hood', 'head', 'a yellow raincoat hood', '雨帽'],
  ['crown-ice', 'head', 'a crystalline ice crown with snowflake gems', '冰冠'],
  ['mushroom-hat', 'head', 'a red mushroom cap hat with white dots', '蘑菇帽'],
  ['crown-laurel', 'head', 'a golden laurel wreath crown', '桂冠'],
  ['bonnet', 'head', 'a vintage blue floral bonnet hat with ribbons', '淑女帽'],
  ['glasses-heart', 'eyes', 'pink heart-shaped glasses', '爱心眼镜'],
  ['glasses-3d', 'eyes', 'retro white 3d movie glasses', '3D 眼镜'],
  ['visor', 'eyes', 'a futuristic cyan visor glasses', '科幻护目镜'],
  ['scarf-check', 'scarf', 'a green and black checkered scarf', '格纹绿围巾'],
  ['scarf-rainbow', 'scarf', 'a striped rainbow scarf', '彩虹围巾'],
  ['tie', 'scarf', 'a small red bow tie', '蝴蝶领结'],
  ['backpack-bear', 'side', 'a tiny brown bear-shaped backpack', '小熊背包'],
  ['balloon-hand', 'side', 'a hand-held bunch of three pastel balloons', '气球束'],
  ['camera', 'side', 'a small retro pastel camera on a strap', '小相机'],
  ['icecream', 'side', 'a two-scoop strawberry and matcha ice cream cone', '冰淇淋'],
  ['flag', 'side', 'a small waving triangular pennant flag', '小旗子'],
  ['book', 'side', 'a small closed storybook with a bookmark', '故事书'],
];
for (const [id, _anchor, desc, _zh] of acc3) add(`acc-${id}`, { file: `acc/${id}.png`, size: '1024x1024', square: true, prompt: SINGLE(desc) });

// ---------- E. 装饰二批+三批 24+16 ----------
const deco2 = [
  ['swing', 'a small wooden bird swing hanging with ropes'], ['bookshelf', 'a tiny bookshelf with colorful books'],
  ['teapot', 'a round pastel teapot with two cups'], ['cuckoo', 'a small cuckoo clock'],
  ['fountain', 'a tiny tiered stone fountain with water'], ['mail', 'a red mailbox on a wooden post'],
  ['basket-fruit', 'a small basket of red apples'], ['candle', 'a lit candle in a glass jar'],
  ['chalkboard', 'a small chalkboard on a wooden easel'], ['barrel', 'a small wooden barrel'],
  ['birdbath', 'a small stone birdbath with water'], ['hammock', 'a tiny striped hammock between poles'],
  ['lantern', 'a glowing paper lantern on a stand'], ['clock', 'a round wall clock with pastel frame'],
  ['desk', 'a tiny wooden desk with a tiny chair'], ['shelf-plant', 'a hanging shelf with three small plants'],
  ['watering-can', 'a small green watering can'], ['butterfly-house', 'a small wooden butterfly house on a pole'],
  ['mushroom-house', 'a tiny red mushroom shaped house with a door'], ['well', 'a small stone well with a tiny roof'],
  ['horse', 'a tiny wooden rocking horse toy'], ['xylophone', 'a small colorful toy xylophone'],
  ['treasure-chest', 'a small wooden treasure chest slightly open with glow'], ['gramophone', 'a tiny golden gramophone'],
];
for (const [id, desc] of deco2) add(`deco-${id}`, { file: `deco/${id}.png`, size: '1024x1024', square: true, prompt: SINGLE(desc) });
const deco3 = [
  ['sock', 'a red Christmas stocking hanging'], ['wreath', 'a pine wreath with red berries and bow'],
  ['snowman', 'a tiny snowman with carrot nose'], ['pumpkin-lamp', 'a carved smiling pumpkin jack-o-lantern'],
  ['moon-lamp', 'a crescent moon shaped night lamp'], ['star-jar', 'a glass jar with glowing stars inside'],
  ['boat', 'a tiny paper boat'], ['kite', 'a small diamond kite with a tail'],
  ['barometer', 'a vintage brass weather station dial'], ['vine', 'a small potted trailing vine on a stand'],
  ['binoculars', 'small brass binoculars on a stand'], ['thermos', 'a pastel thermos flask with a cup'],
  ['radio', 'a small retro radio with antenna'], ['cuckoo-owl', 'a wooden owl figurine'],
  ['bathtub', 'a tiny round wooden bathtub with steam'], ['sign', 'a small wooden arrow direction sign'],
];
for (const [id, desc] of deco3) add(`deco-${id}`, { file: `deco/${id}.png`, size: '1024x1024', square: true, prompt: SINGLE(desc) });

// ---------- F. 新配色二批 8 变体（蛋+幼年）+ 三批 6 变体，及全 teen/adult ----------
const BODY = (c, b) => `a chubby round baby chick-like bird original character 'GuGu', ${c} body with ${b} belly, small stubby wings, tiny orange webbed feet, a small tuft of two feathers on top of head, faceless (no eyes, beak or mouth), big round belly taking the lower half of the body, full body, front view, centered composition`;
const TEEN = (c, b) => `a chubby young teenage chick-like bird original character 'GuGu', slightly taller than a baby chick with small grown feather wings and a short budding tail, ${c} body with ${b} belly, tiny orange webbed feet, a small tuft of two feathers on top of head, faceless (no eyes, beak or mouth), big round belly taking the lower half of the body, full body, front view, centered composition`;
const ADULT = (c, b) => `a plump grown-up round bird original character 'GuGu', elegant larger wings and a fluffy proud tail, confident upright pose, ${c} body with ${b} belly, orange webbed feet, a neat tuft of two feathers on top of head, faceless (no eyes, beak or mouth), big round belly taking the lower half of the body, full body, front view, centered composition`;
const EGG = (c) => `a single upright decorated egg, ${c} shell with wavy white zigzag band around the middle and one small orange heart motif, no face, standing straight, full body, front view, centered composition`;
const variants = [
  ['matcha', 'soft matcha green', 'pale cream'], ['peach', 'peach orange', 'lighter peach'],
  ['ocean', 'deep ocean blue', 'foam white'], ['grape', 'deep grape purple', 'pale lilac'],
  ['lemon', 'bright lemon yellow', 'pale cream'], ['sakura-deep', 'deep sakura pink', 'blush white'],
  ['cotton', 'cotton white', 'cream'], ['charcoal', 'soft charcoal gray', 'silver gray'],
  ['caramel', 'warm caramel gold', 'honey cream'], ['mint-deep', 'deep spearmint', 'pale mint'],
  ['coral', 'coral red', 'blush'], ['sky', 'light sky blue', 'cloud white'],
  ['rose', 'dusty rose', 'blush'], ['olive', 'soft olive green', 'pale straw'],
];
for (const [v, c, b] of variants) {
  add(`egg-${v}`, { file: `${v}-egg.png`, size: '1024x1024', prompt: EGG(c) });
  add(`body-baby-${v}`, { file: `${v}-baby.png`, size: '1024x1024', prompt: BODY(c, b) });
}
const allVariants = [...variants.map((x) => x[0]), 'choco', 'lavender', 'soda'];
for (const v of allVariants) {
  const [c, b] = variants.find((x) => x[0] === v) ?? ['', ''];
  const C = v === 'choco' ? 'warm chocolate brown' : v === 'lavender' ? 'soft lavender purple' : v === 'soda' ? 'fresh soda blue' : c;
  const B = v === 'choco' ? 'lighter cream' : v === 'lavender' ? 'paler lilac' : v === 'soda' ? 'pale sky' : b;
  add(`body-teen-${v}`, { file: `${v}-teen.png`, size: '1024x1024', prompt: TEEN(C, B) });
  add(`body-adult-${v}`, { file: `${v}-adult.png`, size: '1024x1024', prompt: ADULT(C, B) });
}

// ---------- R. 表情贴纸 24+16（Q 版咕咕表情，气泡配图） ----------
const faces = [
  ['happy', 'beaming with joy, eyes closed happy smile'], ['laugh', 'laughing hard with tears of joy'],
  ['sad', 'teary sad pouting'], ['angry', 'puffed cheeks angry pouting'],
  ['surprised', 'big surprised round eyes and open beak'], ['sleepy', 'sleepy with Zzz'],
  ['love', 'hearts in eyes blushing'], ['thinking', 'thinking with a paw on chin'],
  ['eating', 'cheeks stuffed eating happily'], ['singing', 'singing with music notes'],
  ['shy', 'covering face shyly'], ['cool', 'sunglasses cool pose'],
  ['cry', 'crying a fountain of tears'], ['smug', 'smug smirking'],
  ['wow', 'sparkling star eyes wow'], ['sweat', 'nervous sweating drop'],
  ['proud', 'proud chest out standing tall'], ['sneak', 'tiptoe sneaking'],
  ['dance', 'dancing happily'], ['read', 'reading a tiny book'],
  ['bath', 'in a bath with bubbles on head'], ['sleep-deep', 'deep sleeping on a pillow'],
  ['sing-mic', 'singing into a tiny microphone'], ['gift', 'holding a tiny gift box'],
  ['wave', 'waving hello'], ['run', 'running fast with motion lines'],
  ['fly', 'flying with tiny wings flapping'], ['cook', 'wearing chef hat cooking'],
  ['study', 'studying with glasses writing'], ['travel', 'wearing straw hat with backpack'],
  ['sick', 'sick with ice bag on head'], ['pray', 'praying with paws together'],
  ['cheer', 'cheering with pom-poms'], ['nom', 'about to bite a cookie'],
  ['pat', 'asking for head pats'], ['zzz-song', 'humming with closed eyes'],
  ['gasip', 'whispering gossip'], ['panic', 'panicking with flapping wings'],
  ['meh', 'unimpressed flat look'], ['dizzy', 'dizzy with spiral eyes'],
];
for (const [id, desc] of faces) add(`face-${id}`, { file: `face/${id}.png`, size: '1024x1024', square: true, prompt: CHIBI + desc + ', ' + STICKER });

// ---------- T. 手信精致图标 8 + 便当 3 ----------
const souvenirs = [
  ['mountain', 'a small round gray mountain stone with a snow cap mark'],
  ['beach', 'a small bracelet made of tiny pink seashells'],
  ['forest', 'a tiny red mushroom figurine with white dots'],
  ['town', 'a small red paper lantern ornament'],
  ['onsen', 'a small onsen egg in a tiny cup'],
  ['camp', 'a postcard with a star map print'],
  ['field', 'a small straw whistle'],
  ['plaza', 'a small red balloon with string'],
];
for (const [id, desc] of souvenirs) add(`souv-${id}`, { file: `souvenir/${id}.png`, size: '1024x1024', square: true, prompt: SINGLE(desc) });

// ---------- K. 商店道具二批+三批 12+12 ----------
const items2 = [
  ['onigiri', 'a round rice ball with nori belt'], ['juice', 'a small orange juice box with straw'],
  ['pudding', 'a caramel pudding with a cherry'], ['donut', 'a pink glazed donut with sprinkles'],
  ['hotdog', 'a tiny hotdog with wavy mustard'], ['sushi', 'a salmon nigiri sushi'],
  ['towel', 'a folded pastel blue towel'], ['brush', 'a small wooden grooming brush'],
  ['pillow', 'a small round mint pillow'], ['toy-fish', 'a small cat toy fish'],
  ['thermos-cup', 'a small tea cup with steam'], ['star-candy', 'a wrapped star candy'],
  ['melon-bread', 'a melon pan bread'], ['strawberry-milk', 'a small strawberry milk bottle'],
  ['shampoo', 'a tiny duck shampoo bottle'], ['sunscreen', 'a small sunscreen tube'],
  ['fan', 'a small folding fan'], ['warmer', 'a round hand warmer pouch'],
  ['alarm', 'a small round twin bell alarm clock'], ['diary-book', 'a small diary book with a pen'],
  ['ticket', 'a small golden ticket'], ['medal', 'a golden medal with red ribbon'],
  ['crown-snick', 'a small chocolate crown'], ['festival-mask', 'a small fox festival mask'],
];
for (const [id, desc] of items2) add(`item-${id}`, { file: `item/${id}.png`, size: '1024x1024', square: true, prompt: SINGLE(desc) });

// ---------- O. 明信片二批（每目的地第 2 视角） ----------
const pc2 = [
  ['mountain2', 'a mountain summit sunrise with sea of clouds below and a tiny flag'],
  ['beach2', 'a beach sunset with a sandcastle and gentle waves'],
  ['forest2', 'a forest at night with glowing mushrooms and fireflies'],
  ['town2', 'an old town morning market street with fruit stalls'],
  ['onsen2', 'an indoor onsen bath with wooden buckets and steam'],
  ['camp2', 'a campsite morning with dew on the tent and birds'],
  ['field2', 'a rice field at golden sunset with dragonflies'],
  ['plaza2', 'a plaza carousel at night with lights'],
  ['mountain3', 'a snowy mountain trail with cairn stones'],
  ['beach3', 'a rocky tide pool beach with starfish and crabs'],
  ['forest3', 'an autumn forest path with red maple leaves'],
  ['town3', 'a rainy old town alley with umbrellas and reflections'],
  ['onsen3', 'an open air rotenburo onsen surrounded by snow monkeys far away'],
  ['camp3', 'a cozy campfire with marshmallows and guitar'],
  ['field3', 'a morning field with scarecrow and mist'],
  ['plaza3', 'a plaza fountain at noon with pigeons'],
];
for (const [id, desc] of pc2) add(`pc-${id}`, { file: `pc/${id}.png`, size: '1536x1024', prompt: `${desc}, ${POSTCARD}` });

// ---------- W. 纪念墙/宣传/杂项 ----------
add('misc-memorial-bg', { file: 'misc/memorial-bg.png', size: '1536x1024', prompt: `a dreamy night sky with soft clouds, gentle stars and a single floating feather, peaceful farewell mood, ${POSTCARD}` });
add('misc-hero-banner', { file: 'misc/hero-banner.png', size: '1536x1024', prompt: `a wide cheerful banner illustration of kawaii pastel world with a chubby cream bird silhouette, stars and snacks, storybook style, no text` });
add('misc-egg-nest', { file: 'misc/egg-nest.png', size: '1024x1024', square: true, prompt: SINGLE('a cozy straw nest with a single cream egg inside, warm light') });
for (const s of ['spring', 'summer', 'autumn', 'winter']) {
  add(`misc-season-${s}`, { file: `misc/season-${s}.png`, size: '1536x1024', prompt: `a ${s} themed kawaii landscape scene, ${POSTCARD}` });
}

writeFileSync(file, JSON.stringify(db, null, 2));
console.log('总素材条目:', db.assets.length);
