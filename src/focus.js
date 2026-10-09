/**
 * ☕ Lumpa 桌面工位伴读 · 专注同桌 & 像素萌宠浮窗系统 (Focus Companion Engine)
 * 基于独立像素艺术切片资产（20 款完整透明模型）
 * 包含：
 * 1. 20 款像素萌宠模型库（初始宠物免费，其余使用任务礼物解锁）
 * 2. 真实音频加载器 + 温润水晶和弦提示音 (支持用户直接提供/替换真实猫叫 MP3/WAV)
 * 3. 毫秒级原生切屏感知与场景情绪分发
 * 4. 桌面透明置顶浮窗与主界面双端自适应渲染
 */

// =========================================================================
// 1. 像素萌宠模型库
// =========================================================================

export const PET_ARCHETYPES = {
  cat_white: {
    id: "cat_white",
    name: "纯白棉棉",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "经典软萌白猫，粉嫩内耳与爪垫，乖巧揣手小圆脸，性格温柔粘人。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_white.png",
    pose: "loaf"
  },
  cat_ginger_blush: {
    id: "cat_ginger_blush",
    name: "腮红小橘",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "暖橘色背毛与额头斑纹，脸颊微泛粉红腮红，翘着毛茸尾巴，憨态可掬。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_ginger_blush.png",
    pose: "sit"
  },
  cat_ginger_walk: {
    id: "cat_ginger_walk",
    name: "走步小橘",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "迈着自信轻快小步子的小橘猫，脊背有漂亮橘黄斑纹。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_ginger_walk.png",
    pose: "walk"
  },
  cat_black_bowl: {
    id: "cat_black_bowl",
    name: "红盆小夜",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "舒服蜷在深红色小碗盆里的小黑猫，露出圆圆小脑袋与白色大明眸。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_black_bowl.png",
    pose: "bowl"
  },
  cat_black_stand: {
    id: "cat_black_stand",
    name: "大眼阿夜",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "纯黑修长身形，琥珀黄明亮大眼睛，精神抖擞地注视着主人。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_black_stand.png",
    pose: "stand"
  },
  cat_siamese_green: {
    id: "cat_siamese_green",
    name: "碧眼暹罗",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "浅米奶油色身躯，深巧面具脸与耳朵，一对透亮的宝石翡翠绿眸。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_siamese_green.png",
    pose: "sit"
  },
  cat_calico_loaf: {
    id: "cat_calico_loaf",
    name: "方萌三花",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "白、橘、黑三色拼块，乖巧方滚滚揣手坐姿，眼神呆萌纯净。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_calico_loaf.png",
    pose: "loaf"
  },
  cat_calico_walk: {
    id: "cat_calico_walk",
    name: "踏步三花",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "白毛底上点缀橘黑花斑，走动起来步态轻盈活泼。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_calico_walk.png",
    pose: "walk"
  },
  cat_ragdoll_fluffy: {
    id: "cat_ragdoll_fluffy",
    name: "双色布偶",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "浓密蓬松的奶油白长毛，深棕双色八字面罩，带着一根毛茸茸的大尾巴。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_ragdoll_fluffy.png",
    pose: "fluffy"
  },
  fox_fire: {
    id: "fox_fire",
    name: "赤狐星火",
    baseColor: "#FFFFFF",
    species: "fox",
    desc: "暖橙狐毛，尖尖黑狐耳与雪白胸绒毛，环绕着一条温暖蓬松的大尾巴。",
    unlocked: true,
    sprite: "assets/pixel_pets/fox_fire.png",
    pose: "sit"
  },
  wolf_cub: {
    id: "wolf_cub",
    name: "灰白幼狼",
    baseColor: "#FFFFFF",
    species: "wolf",
    desc: "浅灰背毛与纯白下颔，一对直挺敏锐的小尖耳朵，充满好奇的探索欲。",
    unlocked: true,
    sprite: "assets/pixel_pets/wolf_cub.png",
    pose: "sit"
  },
  dog_french_fawn: {
    id: "dog_french_fawn",
    name: "奶油法斗",
    baseColor: "#E9B56D",
    species: "dog",
    desc: "暖奶油色的小法斗，白色额纹和胸口、深灰短鼻、蝙蝠耳，爱跑爱玩。",
    unlocked: true,
    sprite: "assets/pixel_companions_v3/frames/dog_french_fawn_idle_0.png",
    pose: "sit"
  },
  dog_french_black: {
    id: "dog_french_black",
    name: "黑曜法斗",
    baseColor: "#2B2C2D",
    species: "dog",
    desc: "黑曜石般的小法斗，大耳朵、圆眼睛和短短的鼻吻，机灵又粘人。",
    unlocked: true,
    sprite: "assets/pixel_companions_v3/frames/dog_french_black_idle_0.png",
    pose: "sit"
  },
  cat_pointed_fluffy: {
    id: "cat_pointed_fluffy",
    name: "奶茶重点色",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "圆润可爱的短毛团，深色小耳朵与四爪，趴在地上就像一杯温润的乌龙奶茶。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_pointed_fluffy.png",
    pose: "loaf"
  },
  cat_ginger_smile: {
    id: "cat_ginger_smile",
    name: "微笑暖橘",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "正脸端坐的微笑小橘猫，圆圆的小包子脸满溢着治愈与温暖。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_ginger_smile.png",
    pose: "sit"
  },
  cat_chubby_loaf: {
    id: "cat_chubby_loaf",
    name: "团子长毛猫",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "圆滚滚的胖乎乎长毛猫，小尾巴卷在身侧，像一块刚出炉的面包团。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_chubby_loaf.png",
    pose: "loaf"
  },
  cat_siamese_slender: {
    id: "cat_siamese_slender",
    name: "优雅小暹罗",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "修长身段与高翘的巧克力色小尾巴，姿态格外灵巧端庄。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_siamese_slender.png",
    pose: "stand"
  },
  cat_tabby_brown: {
    id: "cat_tabby_brown",
    name: "棕白小花猫",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "棕白条纹相间的可爱小猫，耳朵微颤，对周围的一切保持着探索欲。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_tabby_brown.png",
    pose: "sit"
  },
  cat_white_emerald: {
    id: "cat_white_emerald",
    name: "细长碧眼白猫",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "纯白轻盈的身形，两只晶莹透亮的祖母绿猫眼，格外高贵优雅。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_white_emerald.png",
    pose: "stand"
  },
  cat_siamese_kitten: {
    id: "cat_siamese_kitten",
    name: "暹罗幼猫",
    baseColor: "#FFFFFF",
    species: "cat",
    desc: "还未长大的小奶猫，圆滚滚的大脑袋，好奇地歪头仰望着你。",
    unlocked: true,
    sprite: "assets/pixel_pets/cat_siamese_kitten.png",
    pose: "sit"
  }
};

// `unlocked` 是早期界面留下的静态元数据；真正存档仍由
// FocusEngine.unlockedItems 管理。保持两者语义一致，避免外部读取时误判。
Object.values(PET_ARCHETYPES).forEach((pet) => {
  pet.unlocked = pet.id === "cat_white";
});

// 关节绘制版角色外观。所有角色都由独立的头、躯干、四肢、耳朵与尾巴
// 组成，不再把一张 PNG 整体拉伸来伪造动作。
export const COMPANION_RIG_STYLES = Object.freeze({
  cat_white:           { body: "#fff8ed", accent: "#a79da2", eye: "#44373c", pattern: "soft", shape: "round", signature: "look" },
  cat_ginger_blush:    { body: "#fff0d8", accent: "#e98e48", eye: "#573b2b", pattern: "tabby", shape: "round", blush: true, signature: "wash" },
  cat_ginger_walk:     { body: "#ffe4bd", accent: "#d97b35", eye: "#513421", pattern: "tabby", shape: "athletic", signature: "walk" },
  cat_black_bowl:      { body: "#27262c", accent: "#f5eee4", eye: "#ffc857", pattern: "tuxedo", shape: "chubby", signature: "sleep" },
  cat_black_stand:     { body: "#202126", accent: "#373943", eye: "#f0b94f", pattern: "soft", shape: "slender", signature: "pounce" },
  cat_siamese_green:   { body: "#eadfc9", accent: "#5c4842", eye: "#4bc39d", pattern: "points", shape: "round", signature: "look" },
  cat_calico_loaf:     { body: "#fff1dc", accent: "#dd7b3e", dark: "#493b3b", eye: "#638a55", pattern: "calico", shape: "chubby", signature: "roll" },
  cat_calico_walk:     { body: "#fff0dc", accent: "#db7a3b", dark: "#40383a", eye: "#6d9459", pattern: "calico", shape: "athletic", signature: "walk" },
  cat_ragdoll_fluffy:  { body: "#f2eadf", accent: "#72564c", eye: "#5bb7e8", pattern: "points", shape: "fluffy", signature: "stretch" },
  fox_fire:            { body: "#e99349", accent: "#fff0d8", dark: "#493832", eye: "#4a3329", pattern: "fox", shape: "slender", species: "fox", signature: "pounce" },
  wolf_cub:            { body: "#aeb8c1", accent: "#f3f4f2", dark: "#5c6873", eye: "#6cc2d8", pattern: "wolf", shape: "athletic", species: "wolf", signature: "walk" },
  dog_french_fawn:     { body: "#e9b56d", accent: "#fff6e4", dark: "#393334", eye: "#302729", pattern: "soft", shape: "chubby", species: "dog", signature: "play" },
  dog_french_black:    { body: "#2b2c2d", accent: "#b48380", dark: "#191a1b", eye: "#f8f1e3", pattern: "soft", shape: "chubby", species: "dog", signature: "pounce" },
  cat_pointed_fluffy:  { body: "#e9d8bd", accent: "#675049", eye: "#60b7dc", pattern: "points", shape: "fluffy", signature: "sleep" },
  cat_ginger_smile:    { body: "#ffe1b5", accent: "#d87731", eye: "#57402d", pattern: "tabby", shape: "round", blush: true, signature: "wash" },
  cat_chubby_loaf:     { body: "#d8c1a4", accent: "#8c705b", eye: "#594635", pattern: "tabby", shape: "chubby", signature: "roll" },
  cat_siamese_slender: { body: "#e7d6ba", accent: "#4b3937", eye: "#6fc5df", pattern: "points", shape: "slender", signature: "walk" },
  cat_tabby_brown:     { body: "#e5cfad", accent: "#795942", eye: "#84a754", pattern: "tabby", shape: "athletic", signature: "stretch" },
  cat_white_emerald:   { body: "#fffaf0", accent: "#d6d4cf", eye: "#35b782", pattern: "soft", shape: "slender", signature: "look" },
  cat_siamese_kitten:  { body: "#eadbc6", accent: "#6a5149", eye: "#70c5e4", pattern: "points", shape: "kitten", signature: "jump" }
});

// =========================================================================
// 2. 历史饰品装扮定义
// 当前产品版本不开放单件穿戴。定义与旧存档键暂时保留，避免将来恢复时
// 丢失资产映射；界面、兑换、佩戴和绘制入口均由此开关统一关闭。
// =========================================================================

export const ACCESSORIES_ENABLED = false;

export const WARDROBE_ITEMS = {
  straw_hat: { id: "straw_hat", slot: "head", name: "田园草帽",
    baseColor: "#FFFFFF", icon: "👒", desc: "手编夏日草帽，系着一根清新薄荷绿缎带。", unlocked: true },
  beret: { id: "beret", slot: "head", name: "艺术家贝雷帽",
    baseColor: "#FFFFFF", icon: "🎨", desc: "斜戴的复古酒红贝雷帽，充满浪漫画家气质。", unlocked: true },
  scholar_cap: { id: "scholar_cap", slot: "head", name: "专注学士帽",
    baseColor: "#FFFFFF", icon: "🎓", desc: "挂着金色流苏的方顶博士帽，专注学霸的象征！", unlocked: true },
  bear_beanie: { id: "bear_beanie", slot: "head", name: "暖冬小熊耳帽",
    baseColor: "#FFFFFF", icon: "🐻", desc: "带有两只圆滚滚小熊耳的厚针织毛线帽，抵御寒冬。", unlocked: true },
  detective_hat: { id: "detective_hat", slot: "head", name: "侦探猎鹿帽",
    baseColor: "#FFFFFF", icon: "🕵️", desc: "英伦千鸟格双檐侦探帽，眼神瞬间变得锐利起来。", unlocked: true },

  red_scarf: { id: "red_scarf", slot: "neck", name: "粗棒针暖红围巾",
    baseColor: "#FFFFFF", icon: "🧣", desc: "冬日手工编织的厚红围巾，下摆随微风轻轻摆动。", unlocked: true },
  plaid_bowtie: { id: "plaid_bowtie", slot: "neck", name: "复古格纹领结",
    baseColor: "#FFFFFF", icon: "🎀", desc: "精致乖巧的小绅士领结，显得格外精神笔挺。", unlocked: true },
  bell_ribbon: { id: "bell_ribbon", slot: "neck", name: "小金铃铛缎带",
    baseColor: "#FFFFFF", icon: "🔔", desc: "系着一枚黄铜小金铃，走动时仿佛能听到微弱叮当声。", unlocked: true },
  detective_cape: { id: "detective_cape", slot: "neck", name: "侦探格纹小披肩",
    baseColor: "#FFFFFF", icon: "🧥", desc: "抵御迷雾与寒风的侦探披肩，充满维多利亚韵味。", unlocked: true },

  round_glasses: { id: "round_glasses", slot: "face", name: "金丝圆框眼镜",
    baseColor: "#FFFFFF", icon: "👓", desc: "工位伴读同款！推在小鼻梁上，瞬间进入学究沉浸状态。", unlocked: true },
  cool_shades: { id: "cool_shades", slot: "face", name: "潮人黑墨镜",
    baseColor: "#FFFFFF", icon: "🕶️", desc: "戴上之后气质高冷，谁都不能打扰我的专注时间。", unlocked: true },
  blush_flower: { id: "blush_flower", slot: "face", name: "两颊樱花贴纸",
    baseColor: "#FFFFFF", icon: "🌸", desc: "脸颊两边贴着小巧的花瓣贴纸，软糯指数爆表。", unlocked: true },

  skin_barista: { id: "skin_barista", slot: "skin", name: "咖啡师围裙装",
    baseColor: "#FFFFFF", icon: "☕", desc: "穿上耐脏的深棕帆布小围裙，口袋插着一柄金属搅拌勺。", unlocked: true },
  skin_detective: { id: "skin_detective", slot: "skin", name: "贝克街名侦探",
    baseColor: "#FFFFFF", icon: "🔍", desc: "经典双排扣英伦风小马甲，专注找出任务里的每一个小Bug！", unlocked: true },
  skin_pajamas: { id: "skin_pajamas", slot: "skin", name: "梦境星空睡袍",
    baseColor: "#FFFFFF", icon: "🌙", desc: "丝绸般轻柔的深蓝带星点睡袍，随时准备在小桌旁舒服做梦。", unlocked: true }
};

export const GIFT_REGISTRY = {
  acorn: { id: "acorn", name: "脆香小松果",
    baseColor: "#FFFFFF", icon: "🌰", rarity: "common", rarityText: "日常信物", quote: "在工位旁窗外的橡树下找到的，闻起来满是午后暖阳的味道。" },
  daisy: { id: "daisy", name: "晨曦小雏菊",
    baseColor: "#FFFFFF", icon: "🌸", rarity: "common", rarityText: "日常信物", quote: "清晨第一朵盛开在草地上的小野花，偷偷别在你的小桌角。" },
  coffee_beans: { id: "coffee_beans", name: "烘焙咖啡豆",
    baseColor: "#FFFFFF", icon: "☕", rarity: "common", rarityText: "日常信物", quote: "散发着浓郁迷人的焦香，小猫推了推杯子：辛苦啦，休息一下吧！" },
  pencil_stub: { id: "pencil_stub", name: "复古小铅笔头",
    baseColor: "#FFFFFF", icon: "✏️", rarity: "common", rarityText: "日常信物", quote: "短短的一小截，但它刚才见证了你笔下所有认真的灵感。" },
  cookie: { id: "cookie", name: "香酥小曲奇",
    baseColor: "#FFFFFF", icon: "🍪", rarity: "common", rarityText: "日常信物", quote: "烤得金黄酥脆的小饼干，吃上一块，脑细胞立刻充满能量！" },
  yarn_ball: { id: "yarn_ball", name: "暖绒软毛线团",
    baseColor: "#FFFFFF", icon: "🧶", rarity: "rare", rarityText: "珍贵心愿", quote: "猫猫滚来滚去最心爱的玩具，攒齐几个就能织一条温暖的围巾啦。" },
  honey_pot: { id: "honey_pot", name: "纯正野蜂蜜罐",
    baseColor: "#FFFFFF", icon: "🍯", rarity: "rare", rarityText: "珍贵心愿", quote: "金灿灿的纯甜野蜂蜜，泡在温水里，甜透整个疲惫的下午。" },
  clover: { id: "clover", name: "四叶草压花书签",
    baseColor: "#FFFFFF", icon: "🍀", rarity: "rare", rarityText: "珍贵心愿", quote: "在一万株三叶草中才偶然拾得的一朵，夹在书页里为你带来好运！" },
  pocket_watch: { id: "pocket_watch", name: "老黄铜小怀表",
    baseColor: "#FFFFFF", icon: "⏱️", rarity: "rare", rarityText: "珍贵心愿", quote: "齿轮滴答作响，它温柔地刻录下你专注且不被外界打扰的时光。" },
  star_stone: { id: "star_stone", name: "夜空坠落的星屑",
    baseColor: "#FFFFFF", icon: "🌟", rarity: "legendary", rarityText: "稀世珍宝", quote: "只有在超长或连续专注时才会偶然凝结的璀璨星屑，隐隐散发光芒。" }
};

// 正式版兑换配方。当前构建默认启用礼物兑换；只有显式传入
// { allUnlocked: true } 才会把完整宠物库用于内部动作调试。
export const UNLOCK_RECIPES = Object.freeze({
  cat_white: {},
  cat_ginger_blush: { acorn: 4, daisy: 3 },
  cat_ginger_walk: { pencil_stub: 4, cookie: 3 },
  cat_black_bowl: { coffee_beans: 5, cookie: 3 },
  cat_black_stand: { acorn: 5, pencil_stub: 5 },
  cat_siamese_green: { daisy: 5, clover: 1 },
  cat_calico_loaf: { cookie: 5, yarn_ball: 1 },
  cat_calico_walk: { pencil_stub: 5, yarn_ball: 1 },
  cat_ragdoll_fluffy: { daisy: 6, honey_pot: 1 },
  fox_fire: { coffee_beans: 6, star_stone: 1 },
  wolf_cub: { acorn: 6, pocket_watch: 1 },
  dog_french_fawn: { cookie: 5, acorn: 3 },
  dog_french_black: { coffee_beans: 5, clover: 1 },
  cat_pointed_fluffy: { cookie: 6, honey_pot: 1 },
  cat_ginger_smile: { daisy: 4, cookie: 4 },
  cat_chubby_loaf: { acorn: 5, honey_pot: 1 },
  cat_siamese_slender: { pencil_stub: 6, clover: 1 },
  cat_tabby_brown: { coffee_beans: 5, acorn: 4 },
  cat_white_emerald: { daisy: 6, star_stone: 1 },
  cat_siamese_kitten: { cookie: 6, yarn_ball: 1 },
  straw_hat: { acorn: 2, daisy: 1 },
  beret: { pencil_stub: 2, daisy: 1 },
  scholar_cap: { pencil_stub: 4, pocket_watch: 1 },
  bear_beanie: { cookie: 3, yarn_ball: 1 },
  detective_hat: { coffee_beans: 3, pocket_watch: 1 },
  red_scarf: { daisy: 2, yarn_ball: 1 },
  plaid_bowtie: { acorn: 2, pencil_stub: 2 },
  bell_ribbon: { cookie: 3, clover: 1 },
  detective_cape: { coffee_beans: 4, pocket_watch: 1 },
  round_glasses: { pencil_stub: 3, coffee_beans: 2 },
  cool_shades: { coffee_beans: 4, star_stone: 1 },
  blush_flower: { daisy: 3, cookie: 1 },
  skin_barista: { coffee_beans: 5, honey_pot: 1 },
  skin_detective: { pencil_stub: 5, pocket_watch: 1 },
  skin_pajamas: { cookie: 5, star_stone: 1 },
});

export const TRASH_REGISTRY = [
  { id: "stinky_dried_fish", name: "臭烘烘的小鱼干",
    baseColor: "#FFFFFF", icon: "🐟", quote: "计时器被提前按停，小猫把没吃完的臭鱼干推了过来：这次先记在垃圾堆里喔。" },
  { id: "fish_bone", name: "啃得干干净净的鱼骨",
    baseColor: "#FFFFFF", icon: "🦴", quote: "只剩下一副孤零零的鱼骨头，像这次没有走完的专注时间。" },
  { id: "crumpled_paper", name: "皱巴巴的便签草稿纸",
    baseColor: "#FFFFFF", icon: "📄", quote: "上面写着‘我这次一定专心’……但刚写了几个字就被揉成了小团。" },
  { id: "ribbon_trash", name: "系着红缎带的垃圾袋",
    baseColor: "#FFFFFF", icon: "🎀", quote: "猫猫委屈地看着你：‘今天……没有陪成吗？不过没关系，随时可以重新开始哦。’" },
  { id: "cold_coffee", name: "放凉了的咖啡杯",
    baseColor: "#FFFFFF", icon: "☕", quote: "咖啡上的热气已经散去啦，杯沿还留着猫爪印：快回来吧，我一直在呢。" },
  { id: "empty_can", name: "咣当作响的空罐头",
    baseColor: "#FFFFFF", icon: "🥫", quote: "空罐头滚到桌脚边，咣当一声提醒你：中断也会留下痕迹。" },
  { id: "torn_sock", name: "被抓破的小袜子",
    baseColor: "#FFFFFF", icon: "🧦", quote: "小猫闷闷地挠了几下袜子，给它留下了三个小洞。" },
  { id: "snack_wrapper", name: "揉成一团的零食纸",
    baseColor: "#FFFFFF", icon: "🍬", quote: "亮晶晶的包装纸被揉成一团，先收进这次的中断记录里。" }
];

// =========================================================================
// 3. 高品音效引擎 (温润水滴木琴音 + 外部猫叫音频自动回退)
// =========================================================================

export const PET_AUDIO_PROFILES = Object.freeze({
  cat_white:            { semitones: 1, gain: 0.76, rate: 1.02, wave: "sine" },
  cat_ginger_blush:     { semitones: 3, gain: 0.78, rate: 1.08, wave: "triangle" },
  cat_ginger_walk:      { semitones: 4, gain: 0.78, rate: 1.10, wave: "triangle" },
  cat_black_bowl:       { semitones: -3, gain: 0.70, rate: 0.92, wave: "sine" },
  cat_black_stand:      { semitones: -4, gain: 0.72, rate: 0.89, wave: "sine" },
  cat_siamese_green:    { semitones: 5, gain: 0.76, rate: 1.12, wave: "triangle" },
  cat_calico_loaf:      { semitones: 1, gain: 0.78, rate: 1.03, wave: "sine" },
  cat_calico_walk:      { semitones: 2, gain: 0.78, rate: 1.06, wave: "triangle" },
  cat_ragdoll_fluffy:   { semitones: -2, gain: 0.72, rate: 0.95, wave: "sine" },
  fox_fire:             { semitones: 6, gain: 0.72, rate: 1.14, wave: "triangle" },
  wolf_cub:             { semitones: -6, gain: 0.70, rate: 0.84, wave: "sine" },
  dog_french_fawn:      { semitones: -2, gain: 0.74, rate: 0.96, wave: "sine" },
  dog_french_black:     { semitones: -4, gain: 0.72, rate: 0.91, wave: "sine" },
  cat_pointed_fluffy:   { semitones: -1, gain: 0.73, rate: 0.97, wave: "sine" },
  cat_ginger_smile:     { semitones: 2, gain: 0.76, rate: 1.05, wave: "triangle" },
  cat_siamese_kitten:   { semitones: 7, gain: 0.67, rate: 1.17, wave: "triangle" },
  cat_siamese_slender:  { semitones: 4, gain: 0.72, rate: 1.09, wave: "triangle" },
  cat_chubby_loaf:      { semitones: -5, gain: 0.75, rate: 0.88, wave: "sine" },
  cat_tabby_brown:      { semitones: 0, gain: 0.78, rate: 1.00, wave: "sine" },
  cat_white_emerald:    { semitones: 2, gain: 0.72, rate: 1.04, wave: "triangle" },
});

// 外置音效包。用户可以把同名的 .wav / .mp3 / .ogg / .m4a 放入
// %LOCALAPPDATA%\\Lumpa\\audio；桌宠会随机挑选可用变体。缺少的文件
// 不会造成静音，会继续使用内置的基础音效。
export const PET_AUDIO_CANDIDATES = Object.freeze({
  cat: Object.freeze({
    gentle: ["meow_gentle_01", "meow_gentle_02", "meow_gentle_03"],
    curious: ["meow_curious_01", "meow_curious_02"],
    alert: ["meow_alert_01", "meow_alert_02"],
    purr: ["meow_purr_01", "meow_purr_02"],
    whine: ["meow_whine_01", "meow_whine_02"],
    pounce: ["meow_pounce_01"],
    stretch: ["meow_stretch_01"],
    yawn: ["meow_yawn_01"],
  }),
  fox: Object.freeze({
    gentle: ["fox_gentle_01", "fox_gentle_02"],
    curious: ["fox_curious_01", "fox_curious_02"],
    alert: ["fox_alert_01", "fox_alert_02"],
  }),
  wolf: Object.freeze({
    gentle: ["wolf_gentle_01", "wolf_gentle_02"],
    curious: ["wolf_curious_01", "wolf_curious_02"],
    alert: ["wolf_alert_01", "wolf_alert_02"],
  }),
  dog: Object.freeze({
    gentle: ["dog_gentle_01", "dog_gentle_02"],
    curious: ["dog_curious_01", "dog_curious_02"],
    alert: ["dog_alert_01", "dog_alert_02"],
  }),
});

const PET_AUDIO_KIND = Object.freeze({ fox_fire: "fox", wolf_cub: "wolf", dog_french_fawn: "dog", dog_french_black: "dog" });
const DEFAULT_AUDIO_KEYS = Object.freeze({
  gentle: "meow_gentle",
  curious: "meow_curious",
  alert: "meow_alert",
  purr: "meow_purr",
  whine: "meow_whine",
  pounce: "meow_pounce",
  stretch: "meow_stretch",
  yawn: "meow_yawn",
});

export class CatAudioSynthesizer {
  constructor(petId = "cat_white") {
    this.ctx = null;
    this.petId = PET_AUDIO_PROFILES[petId] ? petId : "cat_white";
    this.customAudioCache = new Map();
    this.activeAudio = new Set();
    this.currentVoice = null;
    this.lastPlayedAt = new Map();
    this.ambientNodes = [];
    this.ambientRequested = false;
    const preferences = this.loadPreferences();
    this.isMuted = preferences.muted;
    this.masterVolume = preferences.volume;
    // 恢复旧版行为：伴读进入时不自动播放任何持续环境底噪。
    this.ambientType = "none";
  }

  loadPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem("lumpaFocusAudioV2") || "null");
      if (saved && typeof saved === "object") {
        return {
          muted: Boolean(saved.muted),
          volume: Math.min(1, Math.max(0.1, Number(saved.volume) || 0.72)),
          ambientType: ["rain", "fire", "none"].includes(saved.ambientType) ? saved.ambientType : "rain",
        };
      }
    } catch (e) {}
    return { muted: false, volume: 0.72, ambientType: "rain" };
  }

  savePreferences() {
    try {
      localStorage.setItem("lumpaFocusAudioV2", JSON.stringify({
        muted: this.isMuted,
        volume: this.masterVolume,
        ambientType: this.ambientType,
      }));
    } catch (e) {}
  }

  setPet(petId) {
    this.petId = PET_AUDIO_PROFILES[petId] ? petId : "cat_white";
  }

  get profile() {
    return PET_AUDIO_PROFILES[this.petId] || PET_AUDIO_PROFILES.cat_white;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  canPlay(key, cooldownMs, force = false) {
    const now = Date.now();
    if (!force && now - (this.lastPlayedAt.get(key) || 0) < cooldownMs) return false;
    this.lastPlayedAt.set(key, now);
    return true;
  }

  getAudioCandidates(type) {
    const animalKind = PET_AUDIO_KIND[this.petId] || "cat";
    const sourcePool = PET_AUDIO_CANDIDATES[animalKind]?.[type] || [];
    const catFallbacks = animalKind === "cat" || animalKind === "dog" ? [] : (PET_AUDIO_CANDIDATES.cat[type] || []);
    const combined = [...sourcePool, ...catFallbacks];
    if (!combined.length) return [];

    const identitySeed = [...this.petId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const offset = (identitySeed + Math.floor(Date.now() / 997)) % combined.length;
    return [...combined.slice(offset), ...combined.slice(0, offset)];
  }

  async playMeow(type = "gentle", options = {}) {
    if (this.isMuted) return false;
    // jsdom exposes an Audio element but deliberately does not implement media
    // playback.  Skip it in unit tests instead of producing misleading errors.
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent || "")) return false;
    try {
      if (typeof window !== "undefined" && window.__TAURI_INTERNALS__?.invoke) {
        for (const soundName of this.getAudioCandidates(type)) {
          const dataUrl = await window.__TAURI_INTERNALS__.invoke("read_custom_audio", { soundName });
          if (dataUrl) return await this.playOriginalAudio(new Audio(dataUrl));
        }
      }
      // 没有安装狗叫音效时保持安静，不用猫叫冒充法斗。
      if (PET_AUDIO_KIND[this.petId] === "dog") return false;
      if (typeof Audio !== "undefined") {
        const fallback = DEFAULT_AUDIO_KEYS[type] || DEFAULT_AUDIO_KEYS.gentle;
        return await this.playOriginalAudio(new Audio(`assets/audio/${fallback}.wav`));
      }
    } catch (e) {}
    // 动物叫声加载失败时保持安静，不再用电子合成音冒充猫叫。
    return false;
  }

  async playOriginalAudio(audio) {
    audio.volume = 0.72;
    audio.playbackRate = 1;
    if ("preservesPitch" in audio) audio.preservesPitch = true;
    try {
      const result = audio.play();
      if (result && typeof result.then === "function") await result;
      return true;
    } catch (e) {
      return false;
    }
  }

  async playAudioElement(audio, type, segment = null) {
    const profile = this.profile;
    if (this.currentVoice && this.currentVoice !== audio) {
      try { this.currentVoice.pause(); } catch (e) {}
      this.activeAudio.delete(this.currentVoice);
    }
    this.currentVoice = audio;
    audio.volume = Math.min(1, this.masterVolume * profile.gain);
    audio.playbackRate = profile.rate;
    if ("preservesPitch" in audio) audio.preservesPitch = false;
    this.activeAudio.add(audio);
    let stopTimer = null;
    let fadeTimer = null;
    let fadeInterval = null;
    const cleanup = () => {
      if (stopTimer) clearTimeout(stopTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (fadeInterval) clearInterval(fadeInterval);
      this.activeAudio.delete(audio);
      if (this.currentVoice === audio) this.currentVoice = null;
    };
    audio.addEventListener?.("ended", cleanup, { once: true });
    audio.addEventListener?.("error", cleanup, { once: true });
    try {
      if (segment?.start) {
        const seek = () => {
          try { audio.currentTime = segment.start; } catch (e) {}
        };
        seek();
        if (audio.readyState < 1) audio.addEventListener?.("loadedmetadata", seek, { once: true });
      }
      const result = audio.play();
      if (result && typeof result.then === "function") await result;
      if (segment?.duration) {
        const totalMs = Math.max(250, (segment.duration / profile.rate) * 1000);
        const fadeMs = Math.min(180, totalMs * 0.18);
        fadeTimer = setTimeout(() => {
          const initialVolume = audio.volume;
          let step = 0;
          fadeInterval = setInterval(() => {
            step += 1;
            audio.volume = Math.max(0, initialVolume * (1 - step / 6));
            if (step >= 6) clearInterval(fadeInterval);
          }, fadeMs / 6);
        }, Math.max(0, totalMs - fadeMs));
        stopTimer = setTimeout(() => {
          try { audio.pause(); } catch (e) {}
          cleanup();
        }, totalMs);
      }
      return true;
    } catch (e) {
      cleanup();
      this.playAcousticChime(type, { force: true });
      return false;
    }
  }

  playAcousticChime(type, options = {}) {
    if (this.isMuted || !this.canPlay(`fallback:${type}`, 800, options.force)) return false;
    try {
      this.init();
      if (!this.ctx) return false;
      const now = this.ctx.currentTime;
      const pitch = Math.pow(2, this.profile.semitones / 12);
      const patterns = {
        alert: [[880, 0, 0.18, 0.07], [1174, 0.12, 0.25, 0.08]],
        purr: [[523.25, 0, 0.22, 0.05], [659.25, 0.1, 0.22, 0.06], [783.99, 0.2, 0.35, 0.07]],
        curious: [[659.25, 0, 0.28, 0.06]],
        whine: [[698.46, 0, 0.2, 0.055], [523.25, 0.15, 0.35, 0.045]],
        gentle: [[587.33, 0, 0.15, 0.055], [880, 0.12, 0.3, 0.065]],
      };
      (patterns[type] || patterns.gentle).forEach(([freq, offset, duration, gain]) => {
        this.playSoftNote(now + offset, freq * pitch, duration, gain, this.profile.wave);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  playSoftNote(startTime, freq, duration, maxGain, wave = "sine") {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, startTime);
    const level = Math.max(0.0001, maxGain * this.masterVolume);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(level, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  setAmbientType(type, shouldPlay = this.ambientRequested) {
    this.ambientType = "none";
    this.stopAmbient();
    this.savePreferences();
    return this.ambientType;
  }

  startAmbient() {
    this.ambientRequested = false;
    this.stopAmbient(false);
  }

  stopAmbient(clearRequest = true) {
    for (const node of this.ambientNodes) {
      try { node.stop?.(); } catch (e) {}
      try { node.disconnect?.(); } catch (e) {}
    }
    this.ambientNodes = [];
    if (clearRequest) this.ambientRequested = false;
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.isMuted) {
      for (const audio of this.activeAudio) {
        try { audio.pause(); } catch (e) {}
      }
      this.activeAudio.clear();
      this.currentVoice = null;
      this.stopAmbient(false);
    } else if (this.ambientRequested) {
      this.startAmbient();
    }
    this.savePreferences();
    return this.isMuted;
  }

  toggleMute() {
    return this.setMuted(!this.isMuted);
  }
}

// =========================================================================
// 4. 图片资源缓存池 (Sprite Image Cache)
// =========================================================================

const spriteImageCache = new Map();

export function getPetSpriteImage(petId) {
  const pet = PET_ARCHETYPES[petId] || PET_ARCHETYPES.cat_white;
  const src = pet.sprite || `assets/pixel_pets/${pet.id}.png`;
  if (spriteImageCache.has(src)) return spriteImageCache.get(src);

  const img = new Image();
  img.src = src;
  spriteImageCache.set(src, img);
  return img;
}

export function mapPetIdToArchetype(petId) {
  if (!petId) return "cat_white";
  const id = petId.toLowerCase();
  if (id.includes("ginger") || id.includes("orange") || id.includes("blush")) return "cat_ginger";
  if (id.includes("calico")) return "cat_calico";
  if (id.includes("black")) return "cat_black";
  if (id.includes("siamese")) return "cat_siamese";
  if (id.includes("fox")) return "fox_fire";
  if (id.includes("wolf")) return "wolf_cub";
  return "cat_white";
}

// 第三代像素逐帧库：20 个模型全部有自己的完整动作资源，不再按毛色归并，
// 也不允许回退到旧贴图或矢量关节角色。
export const PIXEL_COMPANION_IDS = Object.freeze(Object.keys(PET_ARCHETYPES));
const PIXEL_COMPANION_SET = new Set(PIXEL_COMPANION_IDS);
export const PIXEL_V3_FRAME_COUNTS = Object.freeze({
  idle: 4,
  walk: 4,
  pounce: 1,
  jump: 2,
  land: 1,
  wash: 1,
  play: 1,
  roll: 1,
  stretch: 1,
  look: 4,
  sleep: 2,
  dangle: 2,
  focusing: 4,
});

// Only the fawn Frenchie uses the refined fifth-generation poses. Other pets
// keep their existing art and physics until they receive dedicated updates.
export const FAWN_FRENCHIE_FRAME_COUNTS = Object.freeze({
  idle: 4,
  walk: 8,
  run: 8,
  sniff: 4,
  bow: 4,
  rest: 4,
  sit: 4,
  wag: 4,
  curious: 4,
  yawn: 4,
  greet: 1,
});

const FAWN_DAILY_ACTIONS = Object.freeze(["sit", "wag", "curious", "yawn"]);
const FAWN_TRANSITION_COUNTS = Object.freeze({ settle: 4, sniff_end: 4, bow_end: 4, sit_end: 4, wag_end: 4, curious_end: 4, yawn_end: 4 });

const PIXEL_V3_ACTION_ALIASES = Object.freeze({
  run: "walk",
  loaf: "sleep",
  lie_desk: "sleep",
  look: "idle",
  blink: "idle",
  tilt: "look",
  yawn: "stretch",
  love: "play",
  shake: "idle",
  hiss: "pounce",
  eat: "wash",
  drink: "wash",
  deepsleep: "sleep",
  wake: "idle",
});

export function getPetActionFrameImage(petId, action, frameIdx = 0) {
  const archetype = PIXEL_COMPANION_SET.has(petId) ? petId : "cat_white";
  if (archetype === "dog_french_fawn" && Object.hasOwn(FAWN_FRENCHIE_FRAME_COUNTS, action)) {
    const version = FAWN_DAILY_ACTIONS.includes(action) ? "v8" : action === "walk" || action === "run" ? "v6" : ["sniff", "bow", "rest"].includes(action) ? "v7" : "v5";
    const safeIdx = Math.max(0, Math.floor(frameIdx || 0)) % FAWN_FRENCHIE_FRAME_COUNTS[action];
    const cacheKey = `pixel-${version}:${archetype}:${action}:${safeIdx}`;
    if (spriteImageCache.has(cacheKey)) return spriteImageCache.get(cacheKey);
    const img = new Image();
    img.__lumpaSmooth = false;
    img.onerror = () => {
      if (!img.src.endsWith(`${archetype}_idle_0.png`)) {
        img.src = `assets/pixel_companions_v3/frames/${archetype}_idle_0.png`;
      }
    };
    img.src = `assets/pixel_companions_${version}/frames/${archetype}_${action}_${safeIdx}.png`;
    spriteImageCache.set(cacheKey, img);
    return img;
  }
  let act = PIXEL_V3_ACTION_ALIASES[action || "idle"] || action || "idle";
  if (!Object.hasOwn(PIXEL_V3_FRAME_COUNTS, act)) act = "idle";
  const safeIdx = Math.max(0, Math.floor(frameIdx || 0)) % PIXEL_V3_FRAME_COUNTS[act];
  const cacheKey = `pixel-v3:${archetype}:${act}:${safeIdx}`;

  if (spriteImageCache.has(cacheKey)) return spriteImageCache.get(cacheKey);

  const img = new Image();
  img.__lumpaSmooth = false;
  img.onerror = () => {
    // 缺帧只允许回到同一只角色的新像素待机帧，绝不闪回旧贴图。
    if (!img.src.endsWith(`${archetype}_idle_0.png`)) {
      img.src = `assets/pixel_companions_v3/frames/${archetype}_idle_0.png`;
    }
  };
  img.src = `assets/pixel_companions_v3/frames/${archetype}_${act}_${safeIdx}.png`;
  spriteImageCache.set(cacheKey, img);
  return img;
}

// 第四代补间帧只负责动作衔接，并与第三代完整动作库叠加使用。
// 每个宠物都有自己单独生成的姿势，不会跨模型复用或缩放变形。
export const PIXEL_V4_TRANSITION_FRAME_COUNTS = Object.freeze({
  walk_start: 2,
  walk_stop: 2,
  pounce: 4,
  jump: 3,
  land: 1,
  wash_start: 1,
  roll_start: 1,
  stretch_start: 1,
  recover: 1,
});

export function getPetTransitionFrameImage(petId, action, frameIdx = 0) {
  const archetype = PIXEL_COMPANION_SET.has(petId) ? petId : "cat_white";
  if (archetype === "dog_french_fawn" && Object.hasOwn(FAWN_TRANSITION_COUNTS, action)) {
    const sourceAction = action.replace("_end", "");
    const safeIdx = Math.max(0, Math.floor(frameIdx || 0)) % 4;
    if (sourceAction !== "settle") return getPetActionFrameImage(petId, sourceAction, safeIdx);
    const cacheKey = `pixel-v7:${archetype}:settle:${safeIdx}`;
    if (spriteImageCache.has(cacheKey)) return spriteImageCache.get(cacheKey);
    const img = new Image();
    img.__lumpaSmooth = false;
    img.onerror = () => { img.onerror = null; img.src = `assets/pixel_companions_v7/frames/${archetype}_rest_0.png`; };
    img.src = `assets/pixel_companions_v7/frames/${archetype}_settle_${safeIdx}.png`;
    spriteImageCache.set(cacheKey, img);
    return img;
  }
  const act = Object.hasOwn(PIXEL_V4_TRANSITION_FRAME_COUNTS, action) ? action : "recover";
  const safeIdx = Math.max(0, Math.floor(frameIdx || 0)) % PIXEL_V4_TRANSITION_FRAME_COUNTS[act];
  const cacheKey = `pixel-v4:${archetype}:${act}:${safeIdx}`;

  if (spriteImageCache.has(cacheKey)) return spriteImageCache.get(cacheKey);

  const img = new Image();
  img.__lumpaSmooth = false;
  img.onerror = () => {
    if (!img.src.endsWith(`${archetype}_idle_0.png`)) {
      img.src = `assets/pixel_companions_v3/frames/${archetype}_idle_0.png`;
    }
  };
  img.src = `assets/pixel_companions_v4/frames/${archetype}_${act}_${safeIdx}.png`;
  spriteImageCache.set(cacheKey, img);
  return img;
}

// 第五代装扮系统：宠物动作帧保持原样，装饰物使用独立透明像素 PNG。
// 未提供专用姿态的动作会主动隐藏饰品，绝不再用固定矢量图形强行覆盖身体。
export const PIXEL_ACCESSORY_ASSETS = Object.freeze({
  straw_hat:       { slot: "head", src: "assets/pixel_accessories_v1/head/straw_hat-source.png", width: 72, align: "bottom", offsetY: -1 },
  beret:           { slot: "head", src: "assets/pixel_accessories_v1/head/beret-source.png", width: 58, align: "bottom", offsetX: -3, offsetY: -1 },
  scholar_cap:     { slot: "head", src: "assets/pixel_accessories_v1/head/scholar_cap-source.png", width: 68, align: "bottom", offsetY: 0 },
  bear_beanie:     { slot: "head", src: "assets/pixel_accessories_v1/head/bear_beanie-source.png", width: 61, align: "bottom", offsetY: 1 },
  detective_hat:   { slot: "head", src: "assets/pixel_accessories_v1/head/detective_hat-source.png", width: 70, align: "bottom", offsetY: 0 },
  red_scarf:       { slot: "neck", src: "assets/pixel_accessories_v1/neck/red_scarf-source.png", width: 49, align: "center", offsetY: 2 },
  plaid_bowtie:    { slot: "neck", src: "assets/pixel_accessories_v1/neck/plaid_bowtie-source.png", width: 28, align: "center", offsetY: 1 },
  bell_ribbon:     { slot: "neck", src: "assets/pixel_accessories_v1/neck/bell_ribbon-source.png", width: 43, align: "center" },
  detective_cape:  { slot: "neck", src: "assets/pixel_accessories_v1/neck/detective_cape-source.png", width: 64, align: "top", offsetY: -2 },
  round_glasses:   { slot: "face", src: "assets/pixel_accessories_v1/face/round_glasses-source.png", width: 45, align: "center" },
  cool_shades:     { slot: "face", src: "assets/pixel_accessories_v1/face/cool_shades-source.png", width: 47, align: "center" },
  blush_flower:    { slot: "face", src: "assets/pixel_accessories_v1/face/blush_flower-source.png", width: 46, align: "center", offsetY: 7 },
  skin_barista:    { slot: "skin", src: "assets/pixel_accessories_v1/skin/skin_barista-source.png", width: 54, align: "top" },
  skin_detective:  { slot: "skin", src: "assets/pixel_accessories_v1/skin/skin_detective-source.png", width: 55, align: "top" },
  skin_pajamas:    { slot: "skin", src: "assets/pixel_accessories_v1/skin/skin_pajamas-source.png", width: 57, align: "top" },
});

export const ACCESSORY_ACTION_POSES = Object.freeze({
  idle:     { x: 0, y: 0, rotation: 0, scale: 1 },
  focusing: { x: 0, y: 0, rotation: 0, scale: 1 },
  look:     { x: 0, y: 0, rotation: 0, scale: 1 },
});

const ACCESSORY_SLOT_ANCHORS = Object.freeze({
  head: { x: 0, y: -99 },
  face: { x: 0, y: -81 },
  neck: { x: 0, y: -52 },
  skin: { x: 0, y: -50 },
});

const ACCESSORY_SHAPE_PROFILES = Object.freeze({
  kitten:   { head: 0.84, face: 0.82, neck: 0.82, skin: 0.80, y: 5 },
  slender:  { head: 0.91, face: 0.90, neck: 0.88, skin: 0.86, y: 1 },
  athletic: { head: 0.94, face: 0.92, neck: 0.91, skin: 0.92, y: 1 },
  round:    { head: 1.00, face: 0.94, neck: 0.96, skin: 0.96, y: 0 },
  chubby:   { head: 1.03, face: 0.96, neck: 1.00, skin: 1.04, y: 1 },
  fluffy:   { head: 1.07, face: 0.98, neck: 1.05, skin: 1.08, y: 0 },
});

const accessoryImageCache = new Map();
const accessoryTrimCache = new Map();

export function getPixelAccessoryImage(itemId) {
  const definition = PIXEL_ACCESSORY_ASSETS[itemId];
  if (!definition || typeof Image === "undefined") return null;
  if (accessoryImageCache.has(itemId)) return accessoryImageCache.get(itemId);
  const img = new Image();
  img.__lumpaSmooth = false;
  img.src = definition.src;
  accessoryImageCache.set(itemId, img);
  return img;
}

function getPixelAccessoryTrim(itemId, img) {
  if (accessoryTrimCache.has(itemId)) return accessoryTrimCache.get(itemId);
  const fallback = { x: 0, y: 0, width: img.naturalWidth || 1, height: img.naturalHeight || 1 };
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        if (pixels[((y * canvas.width + x) * 4) + 3] > 24) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    if (maxX >= minX && maxY >= minY) {
      const trim = {
        x: Math.max(0, minX - 2),
        y: Math.max(0, minY - 2),
        width: Math.min(canvas.width, maxX + 4) - Math.max(0, minX - 2),
        height: Math.min(canvas.height, maxY + 4) - Math.max(0, minY - 2),
      };
      accessoryTrimCache.set(itemId, trim);
      return trim;
    }
  } catch (error) {
    // 浏览器拒绝像素读取时仍可使用完整透明画布，不回退到旧矢量装饰。
  }
  accessoryTrimCache.set(itemId, fallback);
  return fallback;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function rigEllipse(ctx, x, y, rx, ry, fill, stroke = "#493b3d", lineWidth = 2.4) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function rigLimb(ctx, x, y, length, width, angle, fill, pawFill, outline) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.roundRect(-width / 2, 0, width, length, width / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = outline;
  ctx.stroke();
  rigEllipse(ctx, 0, length - 1, width * 0.58, width * 0.42, pawFill || fill, outline, 1.8);
  ctx.restore();
}

function rigShape(style) {
  const shapes = {
    chubby:   { bodyRx: 43, bodyRy: 31, headRx: 32, headRy: 29, leg: 25, size: 1.00 },
    fluffy:   { bodyRx: 42, bodyRy: 30, headRx: 34, headRy: 31, leg: 27, size: 1.01 },
    slender:  { bodyRx: 34, bodyRy: 27, headRx: 28, headRy: 27, leg: 33, size: 0.98 },
    athletic: { bodyRx: 39, bodyRy: 25, headRx: 29, headRy: 27, leg: 29, size: 1.00 },
    kitten:   { bodyRx: 31, bodyRy: 25, headRx: 34, headRy: 31, leg: 24, size: 0.92 },
    round:    { bodyRx: 38, bodyRy: 29, headRx: 32, headRy: 29, leg: 27, size: 1.00 },
  };
  return shapes[style.shape] || shapes.round;
}

import {
  COMPANION_COMMANDS,
  COMPANION_EVENTS,
  createCompanionEnvelope,
  validateCompanionCommand,
} from "./companion-protocol.js";

/**
 * 高分辨率关节宠物绘制器。每个身体部件独立重绘，所以动作变化不会产生
 * PNG 被压扁、拉长或切换成另一张贴图的现象。
 */
export function drawCompanionRig(ctx, petId, options = {}) {
  const style = COMPANION_RIG_STYLES[petId] || COMPANION_RIG_STYLES.cat_white;
  const shape = rigShape(style);
  const outline = style.body === "#202126" || style.body === "#27262c" ? "#15161a" : "#4b3a3d";
  const action = String(options.action || "idle");
  const phase = Number(options.phase || 0) % 1;
  const stride = Math.sin(phase * Math.PI * 2);
  const blink = Boolean(options.blink);
  const facing = Number(options.facing || 1) >= 0 ? 1 : -1;
  const scale = Number(options.scale || 1) * shape.size;
  const species = style.species || "cat";
  const isPoints = style.pattern === "points";
  const isDark = style.body === "#202126" || style.body === "#27262c";
  const pawColor = isPoints ? style.accent : (species === "fox" ? (style.dark || style.accent) : style.body);

  let pose = "sit";
  if (action === "walk" || action === "run") pose = "walk";
  else if (action === "jump" || action === "dangle") pose = action;
  else if (action === "sleep" || action === "loaf" || action === "lie_desk") pose = "sleep";
  else if (action === "stretch") pose = "stretch";
  else if (action === "pounce" || action === "land") pose = "crouch";
  else if (action === "roll" || action === "play") pose = "roll";
  else if (action === "wash") pose = "wash";
  else if (action === "look") pose = "look";

  let body = { x: 0, y: -36, rx: shape.bodyRx, ry: shape.bodyRy, rot: 0 };
  let head = { x: 0, y: -76, rx: shape.headRx, ry: shape.headRy, rot: 0 };
  let legs = [
    { x: -17, y: -31, len: shape.leg, w: 14, a: 0 },
    { x: 17, y: -31, len: shape.leg, w: 14, a: 0 },
  ];

  if (pose === "walk") {
    body = { x: -3, y: -36 + Math.abs(stride) * -1.5, rx: shape.bodyRx + 2, ry: Math.max(21, shape.bodyRy - 5), rot: stride * 0.018 };
    head = { x: shape.bodyRx - 5, y: -52 + Math.abs(stride) * -1.2, rx: shape.headRx - 2, ry: shape.headRy - 2, rot: stride * 0.025 };
    legs = [
      { x: -27, y: -27, len: shape.leg + 2, w: 12, a: stride * 0.34 },
      { x: -8, y: -27, len: shape.leg, w: 12, a: -stride * 0.34 },
      { x: 13, y: -27, len: shape.leg + 1, w: 12, a: -stride * 0.32 },
      { x: 29, y: -27, len: shape.leg + 2, w: 12, a: stride * 0.32 },
    ];
  } else if (pose === "crouch") {
    body = { x: -4, y: -24, rx: shape.bodyRx + 3, ry: 18, rot: -0.04 };
    head = { x: shape.bodyRx - 7, y: -37, rx: shape.headRx - 2, ry: shape.headRy - 4, rot: 0.05 };
    legs = [
      { x: -26, y: -19, len: 18, w: 15, a: 0.75 },
      { x: 20, y: -19, len: 20, w: 13, a: -0.76 },
    ];
  } else if (pose === "jump") {
    body = { x: -3, y: -53, rx: shape.bodyRx, ry: Math.max(22, shape.bodyRy - 4), rot: -0.1 };
    head = { x: shape.bodyRx - 7, y: -67, rx: shape.headRx - 2, ry: shape.headRy - 2, rot: 0.06 };
    legs = [
      { x: -23, y: -43, len: 20, w: 13, a: 1.02 },
      { x: -5, y: -42, len: 19, w: 13, a: 0.82 },
      { x: 16, y: -42, len: 21, w: 12, a: -0.9 },
      { x: 29, y: -43, len: 19, w: 12, a: -1.05 },
    ];
  } else if (pose === "dangle") {
    body = { x: 0, y: -52, rx: Math.max(25, shape.bodyRx - 8), ry: shape.bodyRy + 6, rot: 0 };
    head = { x: 0, y: -94, rx: shape.headRx, ry: shape.headRy, rot: stride * 0.04 };
    legs = [
      { x: -19, y: -39, len: 30, w: 12, a: -0.08 + stride * 0.05 },
      { x: -7, y: -37, len: 32, w: 12, a: 0.07 - stride * 0.04 },
      { x: 8, y: -37, len: 31, w: 12, a: -0.06 + stride * 0.04 },
      { x: 19, y: -39, len: 30, w: 12, a: 0.08 - stride * 0.05 },
    ];
  } else if (pose === "sleep") {
    body = { x: -5, y: -22, rx: shape.bodyRx + 5, ry: 22, rot: 0 };
    head = { x: 25, y: -32, rx: shape.headRx - 3, ry: shape.headRy - 5, rot: 0.08 };
    legs = [];
  } else if (pose === "stretch") {
    body = { x: -12, y: -38, rx: shape.bodyRx + 2, ry: shape.bodyRy - 3, rot: -0.16 };
    head = { x: 35, y: -23, rx: shape.headRx - 3, ry: shape.headRy - 4, rot: 0.12 };
    legs = [
      { x: 21, y: -18, len: 32, w: 12, a: -1.0 },
      { x: 31, y: -16, len: 34, w: 12, a: -0.93 },
      { x: -33, y: -31, len: 31, w: 14, a: 0.08 },
    ];
  } else if (pose === "roll") {
    body = { x: 0, y: -35, rx: shape.bodyRx - 2, ry: shape.bodyRy, rot: 0 };
    head = { x: 0, y: -57, rx: shape.headRx, ry: shape.headRy, rot: -0.08 };
    legs = [
      { x: -23, y: -43, len: 22, w: 13, a: 2.72 },
      { x: -7, y: -48, len: 24, w: 13, a: 2.95 },
      { x: 8, y: -48, len: 24, w: 13, a: -2.95 },
      { x: 23, y: -43, len: 22, w: 13, a: -2.72 },
    ];
  } else if (pose === "wash") {
    legs = [
      { x: -16, y: -31, len: shape.leg, w: 14, a: 0 },
      { x: 18, y: -47, len: 27, w: 13, a: -2.45 + stride * 0.12 },
    ];
  } else if (pose === "look") {
    head.rot = stride * 0.12;
    head.x = stride * 4;
  }

  const bodyBreath = pose === "sleep" ? Math.sin(phase * Math.PI * 2) * 1.2 : 0;
  body.y += bodyBreath;
  head.y += bodyBreath * 0.5;

  ctx.save();
  ctx.translate(Number(options.x || 0), Number(options.y || 0));
  ctx.scale(facing * scale, scale);
  if (pose === "roll") {
    const roll = phase * Math.PI * 2;
    ctx.translate(0, -Math.sin(phase * Math.PI) * 7);
    ctx.rotate(roll);
  }
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(34, 27, 31, 0.18)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 4;

  // 尾巴（身体后层）：曲线路径独立摆动，不会拖拽整个角色轮廓。
  ctx.beginPath();
  if (pose === "sleep") {
    ctx.moveTo(-30, -20);
    ctx.bezierCurveTo(-62, -33, -55, -3, -10, -4);
  } else if (pose === "jump" || pose === "walk") {
    ctx.moveTo(-shape.bodyRx + 5, body.y - 3);
    ctx.bezierCurveTo(-65, body.y - 18, -61, body.y - 48 + stride * 5, -43, body.y - 39 + stride * 7);
  } else {
    ctx.moveTo(-shape.bodyRx + 8, body.y - 2);
    ctx.bezierCurveTo(-63, body.y - 5, -64, body.y - 39, -43, body.y - 45 + stride * 3);
  }
  ctx.strokeStyle = outline;
  ctx.lineWidth = species === "fox" || style.shape === "fluffy" ? 22 : 18;
  ctx.stroke();
  ctx.strokeStyle = isPoints ? style.accent : style.body;
  ctx.lineWidth -= 5;
  ctx.stroke();

  // 四肢后层。
  legs.slice(0, pose === "walk" || pose === "jump" || pose === "roll" || pose === "dangle" ? 2 : 0)
    .forEach((leg) => rigLimb(ctx, leg.x, leg.y, leg.len, leg.w, leg.a, style.body, pawColor, outline));

  ctx.save();
  ctx.translate(body.x, body.y);
  ctx.rotate(body.rot);
  rigEllipse(ctx, 0, 0, body.rx, body.ry, style.body, outline);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.ellipse(5, -8, body.rx * 0.55, body.ry * 0.45, -0.08, 0, Math.PI * 2);
  ctx.fill();

  if (style.pattern === "tabby") {
    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 4;
    [-18, -5, 9].forEach((sx, index) => {
      ctx.beginPath();
      ctx.moveTo(sx, -body.ry + 5);
      ctx.quadraticCurveTo(sx + 4, -body.ry + 13, sx + 7, -body.ry + 16 + index);
      ctx.stroke();
    });
  } else if (style.pattern === "calico") {
    rigEllipse(ctx, -18, -9, 15, 11, style.accent, "transparent", 0);
    rigEllipse(ctx, 15, 8, 17, 12, style.dark, "transparent", 0);
  } else if (style.pattern === "tuxedo" || species === "fox" || species === "wolf") {
    ctx.fillStyle = style.accent;
    ctx.beginPath();
    ctx.ellipse(17, 5, 17, body.ry * 0.72, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 四肢前层。
  legs.slice(pose === "walk" || pose === "jump" || pose === "roll" || pose === "dangle" ? 2 : 0)
    .forEach((leg) => rigLimb(ctx, leg.x, leg.y, leg.len, leg.w, leg.a, style.body, pawColor, outline));

  // 头与耳朵独立关节。
  ctx.save();
  ctx.translate(head.x, head.y);
  ctx.rotate(head.rot);
  const earHeight = species === "fox" || species === "wolf" ? 31 : 24;
  const earSpread = head.rx * 0.62;
  [[-earSpread, -head.ry + 5], [earSpread, -head.ry + 5]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(ex - 12, ey + 9);
    ctx.lineTo(ex, ey - earHeight);
    ctx.lineTo(ex + 13, ey + 10);
    ctx.closePath();
    ctx.fillStyle = isPoints || species === "fox" || species === "wolf" ? (style.dark || style.accent) : style.body;
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = outline;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex - 6, ey + 4);
    ctx.lineTo(ex, ey - earHeight + 8);
    ctx.lineTo(ex + 7, ey + 5);
    ctx.closePath();
    ctx.fillStyle = "#f2a29b";
    ctx.globalAlpha = 0.72;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  rigEllipse(ctx, 0, 0, head.rx, head.ry, style.body, outline);
  ctx.shadowColor = "transparent";

  if (isPoints) {
    ctx.fillStyle = style.accent;
    ctx.beginPath();
    ctx.ellipse(0, 2, head.rx * 0.66, head.ry * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (style.pattern === "calico") {
    ctx.fillStyle = style.accent;
    ctx.beginPath();
    ctx.ellipse(-13, -10, 15, 13, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = style.dark;
    ctx.beginPath();
    ctx.ellipse(14, -7, 13, 15, 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (style.pattern === "tabby") {
    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 3.4;
    [-7, 0, 7].forEach((sx) => {
      ctx.beginPath();
      ctx.moveTo(sx, -head.ry + 3);
      ctx.lineTo(sx * 0.72, -head.ry + 12);
      ctx.stroke();
    });
  } else if (species === "wolf") {
    ctx.fillStyle = style.dark;
    ctx.beginPath();
    ctx.ellipse(0, -5, head.rx * 0.72, head.ry * 0.52, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  const eyeColor = style.eye;
  const eyeY = -2;
  if (blink || pose === "sleep") {
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 3.2;
    [-11, 11].forEach((ex) => {
      ctx.beginPath();
      ctx.moveTo(ex - 4, eyeY);
      ctx.quadraticCurveTo(ex, eyeY + 3, ex + 4, eyeY);
      ctx.stroke();
    });
  } else {
    [-11, 11].forEach((ex) => {
      rigEllipse(ctx, ex, eyeY, species === "fox" ? 3.3 : 4.1, species === "fox" ? 5.3 : 5.6, eyeColor, "transparent", 0);
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.beginPath();
      ctx.arc(ex - 1.2, eyeY - 1.8, 1.05, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 口鼻与胡须。
  ctx.fillStyle = isDark || isPoints ? "rgba(255,247,236,0.88)" : "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.ellipse(-5, 9, 8, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(5, 9, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-3.5, 7);
  ctx.lineTo(3.5, 7);
  ctx.lineTo(0, 11);
  ctx.closePath();
  ctx.fillStyle = "#d98282";
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 11);
  ctx.quadraticCurveTo(-3, 15, -7, 13);
  ctx.moveTo(0, 11);
  ctx.quadraticCurveTo(3, 15, 7, 13);
  ctx.stroke();
  ctx.globalAlpha = 0.42;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 10, 11);
    ctx.lineTo(side * 31, 8);
    ctx.moveTo(side * 10, 14);
    ctx.lineTo(side * 30, 17);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  if (style.blush) {
    rigEllipse(ctx, -21, 10, 6, 3, "rgba(238,126,128,0.28)", "transparent", 0);
    rigEllipse(ctx, 21, 10, 6, 3, "rgba(238,126,128,0.28)", "transparent", 0);
  }
  ctx.restore();

  if (pose === "roll" || action === "play") {
    rigEllipse(ctx, 40, -6, 12, 12, "#e88991", outline, 1.8);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1.4;
    for (let i = -6; i <= 6; i += 6) {
      ctx.beginPath();
      ctx.moveTo(31, -6 + i * 0.5);
      ctx.quadraticCurveTo(40, -12 + i, 49, -6 + i * 0.5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// =========================================================================
// 5. 核心伴读与切屏感知状态引擎 (Focus Engine)
// =========================================================================

export class FocusEngine {
  constructor(options = {}) {
    this.state = "idle";
    this.targetDuration = 25 * 60;
    this.remainingSeconds = this.targetDuration;
    this.timerInterval = null;
    this.startTime = 0;
    this.frameCount = 0;

    // 电影级多动作定格动画状态机
    this.currentAction = "idle"; // "idle" | "walk" | "wash" | "sleep" | "play" | "jump" | "alert" | "dangle" | "land"
    this.actionStartTime = Date.now();
    this.actionDuration = 0;
    this.actionFrame = 0;
    this.actionFrameDelay = 0;
    this.visualTransition = null;
    this.previousAction = "idle";
    this.lastAutonomousActionTime = Date.now();
    this.nextAutonomousInterval = 8000;
    // 同一个 FocusEngine 会同时服务主舞台与桌面浮窗。以真实时间节流，
    // 防止两个 canvas 在一帧内各推进一次物理状态，造成肉眼可见的瞬跳。
    this.lastActionUpdateAt = 0;

    // 独立桌面 2D 像素宠物生命体系统 (Autonomous Mascot System)
    this.facing = 1; // 1 = 面朝右, -1 = 面朝左
    this.walkOffset = 0; // 横向漫步实时位置
    this.walkTarget = 0; // 目标漫步位置
    this.walkVelocity = 0;
    this.isDangling = false; // 鼠标拎起状态（后颈皮悬空）
    this.isLanding = false; // 落地着地缓冲
    this.landingProgress = 0;

    // 游戏级 60FPS 物理运动学与环境交互系统 (Game Kinematics & Physics)
    this.onDesk = false; // 是否在桌子上
    this.petY = 0; // 当前垂直物理位移
    this.isClimbing = false; // 是否正在爬/跃上桌子
    this.climbProgress = 0;
    this.isJumpingDown = false; // 是否正在跳下桌子
    this.jumpDownProgress = 0;
    this.onCatTree = false; // 是否在猫爬架上
    this.isClimbingCatTree = false; // 是否正在跃上猫爬架
    this.climbTreeProgress = 0;
    this.isJumpingDownTree = false; // 是否从猫爬架跳下
    this.jumpDownTreeProgress = 0;
    this.isStretching = false; // 60帧丝滑猫式伸懒腰
    this.stretchProgress = 0;
    this.autoLifeEnabled = true; // 全自主自由生活模式

    // 专属微动作与效果 (复刻右键菜单交互)
    this.manualActionLock = 0; // 手动右键交互动作锁，确保执行期间不被自主漫步打断
    this.renderFacingScale = 1; // 转体透视插值
    this.blinkEffect = 0;
    this.tiltEffect = 0;
    this.shakeEffect = 0;

    this.catAudio = new CatAudioSynthesizer();

    // 正式版本默认采用礼物兑换经济；仅显式传入 { allUnlocked: true }
    // 才进入完整宠物模型调试模式。饰品在两种模式下都暂不开放。
    this.allUnlocked = options.allUnlocked === true;
    this.unlockedItems = this.loadUnlockedItems();
    this.equipped = this.loadEquipped();
    if (!this.unlockedItems[this.equipped.petId]) this.equipped.petId = "cat_white";
    if (PET_ARCHETYPES[options.initialPetId] && this.unlockedItems[options.initialPetId]) {
      this.equipped.petId = options.initialPetId;
    }
    this.giftBackpack = this.loadGiftBackpack();
    this.trashBackpack = this.loadTrashBackpack();
    this.stats = this.loadStats();
    this.catAudio.setPet(this.equipped.petId);
    this.todayKey = getLocalDateKey();
    this.todos = this.loadTodos();
    this.petGrowth = this.loadPetGrowth();
    this.activeSessionTodoIds = [];

    this.lastForegroundApp = "";
    this.lastForegroundCategory = "";
    this.lastSwitchTime = 0;

    this.currentFurnitureScene = this.loadFurnitureScene();

    this.renderLoop = this.renderLoop.bind(this);
    this.animFrameId = null;

    // 预热全部宠物的待机帧和起步补间帧。
    Object.keys(PET_ARCHETYPES).forEach(id => {
      getPetActionFrameImage(id, "idle", 0);
      getPetTransitionFrameImage(id, "walk_start", 0);
    });
    // Load the main pet's entire motion pack before its first autonomous turn.
    for (const [action, count] of Object.entries({ ...PIXEL_V3_FRAME_COUNTS, ...FAWN_FRENCHIE_FRAME_COUNTS })) {
      for (let frame = 0; frame < count; frame++) getPetActionFrameImage("dog_french_fawn", action, frame);
    }
    for (const [action, count] of Object.entries(PIXEL_V4_TRANSITION_FRAME_COUNTS)) {
      for (let frame = 0; frame < count; frame++) getPetTransitionFrameImage("dog_french_fawn", action, frame);
    }
    for (let frame = 0; frame < 4; frame++) getPetTransitionFrameImage("dog_french_fawn", "settle", frame);
  }

  loadFurnitureScene() {
    try {
      return localStorage.getItem("lumpaFurnitureScene") || "desk";
    } catch (e) {}
    return "desk";
  }

  setFurnitureScene(sceneName) {
    const scenes = new Set(["desk", "cattree", "bed", "clean"]);
    this.currentFurnitureScene = scenes.has(sceneName) ? sceneName : "desk";
    // 切换布置时先把角色收回地面，避免角色保留上一个场景的高度，
    // 造成“悬在空中”的视觉断层。
    if (this.currentFurnitureScene !== "desk" && this.onDesk) {
      this.onDesk = false;
      this.petY = 0;
    }
    if (this.currentFurnitureScene !== "cattree" && this.onCatTree) {
      this.onCatTree = false;
      this.petY = 0;
    }
    this.walkOffset = Math.max(-this.getWalkBound(), Math.min(this.getWalkBound(), this.walkOffset));
    try {
      localStorage.setItem("lumpaFurnitureScene", this.currentFurnitureScene);
    } catch (e) {}
    this.onSceneChanged?.(this.currentFurnitureScene);
  }

  getWalkBound() {
    if (this.onDesk) return 68;
    if (this.onCatTree) return 18;
    return this.currentFurnitureScene === "clean" ? 145 : 112;
  }

  // 所有第三代宠物帧都以接近图片底部的位置作为脚底基线。场景绘制
  // 会把角色根节点放在地面之下这一点点，令不透明像素的最末一行恰好
  // 接触地毯、桌面或猫爬架，而不是凭某一只猫的素材高度猜测落点。
  getPetFootInset(petId = this.equipped.petId) {
    const size = 170 * this.getPetGrowthInfo(petId).scale;
    return Math.max(1, Math.round(size / 256));
  }

  getDeskSurfaceOffset() {
    return -86;
  }

  getCatTreeSurfaceOffset() {
    return -98;
  }

  // 换上角色时播放其标志性入场动作。它们共享自然关节动作库，但每一款
  // 都有与原设定相符的默认表演，而不是所有模型只换一层颜色。
  triggerSignatureAction(petId = this.equipped.petId) {
    const signature = COMPANION_RIG_STYLES[petId]?.signature || "look";
    this.manualActionLock = Date.now() + 2600;
    if (signature === "walk") {
      const bound = this.getWalkBound();
      this.walkTarget = this.walkOffset > 0 ? -bound * 0.65 : bound * 0.65;
      this.facing = this.walkTarget > this.walkOffset ? 1 : -1;
      this.setAction("walk", 2600);
    } else if (signature === "jump") {
      this.isGroundJumping = true;
      this.groundJumpProgress = 0;
      this.actionStartTime = Date.now();
    } else if (signature === "stretch") {
      this.isStretching = true;
      this.stretchProgress = 0;
      this.currentAction = "stretch";
      this.actionStartTime = Date.now();
    } else {
      const durations = { look: 2200, wash: 2400, sleep: 3200, roll: 2400, pounce: 2000 };
      this.setAction(signature, durations[signature] || 2200);
    }
    return signature;
  }

  // 右键动作菜单专属触发器 (均带有锁定保护，100%响应不被冲掉)
  triggerBlink() {
    this.manualActionLock = Date.now() + 2000;
    this.blinkEffect = 35;
    this.setAction("idle", 2000);
    this.catAudio.playMeow("gentle");
    this.onSubtitleTrigger?.("🐱 眨巴眨巴亮晶晶的大眼睛～", "gentle");
  }

  triggerTilt() {
    this.manualActionLock = Date.now() + 2200;
    this.tiltEffect = 45;
    this.setAction("look", 2200);
    this.catAudio.playMeow("curious");
    this.onSubtitleTrigger?.("🐾 歪了歪小脑瓜，好奇地瞅着你～", "curious");
  }

  triggerRoll() {
    this.manualActionLock = Date.now() + 2600;
    this.triggerRollPlay(false);
  }

  triggerLook() {
    this.manualActionLock = Date.now() + 2200;
    this.triggerLookAround(false);
  }

  triggerYawn() {
    this.manualActionLock = Date.now() + 2600;
    this.setAction("sleep", 2600);
    this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🥱 打了个长长又满足的软萌大哈欠～", "purr");
  }

  triggerLove() {
    this.manualActionLock = Date.now() + 2400;
    this.setAction("wash", 2400);
    this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("💖 最喜欢你了！轻轻蹭了蹭主人的手心～", "purr");
  }

  triggerStretch() {
    this.manualActionLock = Date.now() + 2800;
    this.triggerCatStretch(false);
  }

  triggerShake() {
    this.manualActionLock = Date.now() + 1800;
    this.shakeEffect = 35;
    this.setAction("idle", 1800);
    this.catAudio.playMeow("curious");
    this.onSubtitleTrigger?.("🔵 甩了甩毛茸茸的小脑瓜和耳朵，精神百倍！", "curious");
  }

  triggerHiss() {
    this.manualActionLock = Date.now() + 2200;
    this.setAction("pounce", 2200);
    this.catAudio.playMeow("alert");
    this.onSubtitleTrigger?.("😼 超凶哈气！(其实是撒娇求陪伴啦)", "alert");
  }

  triggerEat() {
    this.manualActionLock = Date.now() + 2800;
    this.setAction("loaf", 2800);
    this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🥣 大口干饭，咔嚓咔嚓吃得好香！", "purr");
  }

  triggerDrink() {
    this.manualActionLock = Date.now() + 2800;
    this.setAction("loaf", 2800);
    this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🥛 吨吨吨喝清凉的水，精神充沛！", "purr");
  }

  triggerLoaf() {
    this.manualActionLock = Date.now() + 4500;
    this.setAction("loaf", 4500);
    this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🧎 把四只软爪揣在胸口，惬意开启摆烂模式～", "purr");
  }

  triggerSleep() {
    this.manualActionLock = Date.now() + 5000;
    this.triggerLoafNap(false);
  }

  triggerDeepSleep() {
    this.manualActionLock = Date.now() + 999999;
    this.setAction("sleep", 999999);
    this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("💤 蜷成甜甜圈，进入深度长眠陪伴模式……", "purr");
  }

  triggerWake() {
    this.manualActionLock = Date.now() + 2500;
    this.triggerCatStretch(false);
    this.onSubtitleTrigger?.("🌅 睡醒伸伸懒腰，元气满满回归！", "purr");
  }

  feedFish() {
    this.manualActionLock = Date.now() + 2600;
    this.setAction("loaf", 2600);
    this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🐟 嗷呜！吃到鲜美的小鱼干，好开心～", "purr");
  }

  feedWater() {
    this.manualActionLock = Date.now() + 2600;
    this.setAction("loaf", 2600);
    this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🥛 喝了清甜的水，满足地舔了舔胡须！", "purr");
  }

  triggerJump() {
    this.manualActionLock = Date.now() + 2400;
    if (this.onDesk) {
      this.triggerJumpDown(false);
    } else if (this.onCatTree) {
      this.triggerJumpDownCatTree(false);
    } else {
      this.triggerGroundJump(false);
    }
  }

  loadEquipped() {
    const defaults = { petId: "cat_white", head: null, neck: null, face: null, skin: "default" };
    try {
      const saved = localStorage.getItem("lumpaFocusEquipped");
      if (saved) {
        const parsed = { ...defaults, ...JSON.parse(saved) };
        // 穿戴功能暂停期间只读取宠物选择。旧饰品字段仍保留在原始
        // localStorage 中，避免未来恢复功能时丢失历史记录。
        return { ...defaults, petId: PET_ARCHETYPES[parsed.petId] ? parsed.petId : "cat_white" };
      }
    } catch (e) {}
    return defaults;
  }

  saveEquipped() {
    try {
      if (!ACCESSORIES_ENABLED) {
        const previous = JSON.parse(localStorage.getItem("lumpaFocusEquipped") || "null");
        const preserved = previous && typeof previous === "object" ? previous : {};
        localStorage.setItem("lumpaFocusEquipped", JSON.stringify({
          ...preserved,
          petId: this.equipped.petId,
        }));
        return;
      }
      localStorage.setItem("lumpaFocusEquipped", JSON.stringify(this.equipped));
    } catch (e) {}
  }

  getAllUnlockedItems() {
    const unlocked = {};
    Object.keys(PET_ARCHETYPES).forEach(id => { unlocked[id] = true; });
    return unlocked;
  }

  loadUnlockedItems() {
    let unlocked = { cat_white: true };
    try {
      const saved = JSON.parse(localStorage.getItem("lumpaFocusUnlockedV1") || "null");
      if (saved && typeof saved === "object") unlocked = { ...unlocked, ...saved };
    } catch (e) {}
    return this.allUnlocked ? { ...unlocked, ...this.getAllUnlockedItems() } : unlocked;
  }

  saveUnlockedItems() {
    try {
      localStorage.setItem("lumpaFocusUnlockedV1", JSON.stringify(this.unlockedItems));
    } catch (e) {}
  }

  getUnlockCost(itemId) {
    return { ...(UNLOCK_RECIPES[itemId] || {}) };
  }

  getUnlockCostText(itemId) {
    const cost = this.getUnlockCost(itemId);
    const entries = Object.entries(cost);
    if (!entries.length) return "初始拥有";
    return entries.map(([giftId, count]) => {
      const gift = GIFT_REGISTRY[giftId];
      return `${gift?.icon || "🎁"}${gift?.name || giftId}×${count}`;
    }).join(" + ");
  }

  loadGiftBackpack() {
    try {
      const saved = JSON.parse(localStorage.getItem("lumpaGiftBackpackV1") || "null");
      if (saved && typeof saved === "object") return saved;
    } catch (e) {}
    return {};
  }

  saveGiftBackpack() {
    try {
      localStorage.setItem("lumpaGiftBackpackV1", JSON.stringify(this.giftBackpack));
    } catch (e) {}
  }

  loadTrashBackpack() {
    try {
      const saved = JSON.parse(localStorage.getItem("lumpaTrashBackpackV1") || "null");
      if (saved && typeof saved === "object") return saved;
    } catch (e) {}
    return {};
  }

  saveTrashBackpack() {
    try {
      localStorage.setItem("lumpaTrashBackpackV1", JSON.stringify(this.trashBackpack));
    } catch (e) {}
  }

  grantTrash() {
    const trash = TRASH_REGISTRY[Math.floor(Math.random() * TRASH_REGISTRY.length)];
    this.trashBackpack[trash.id] = (this.trashBackpack[trash.id] || 0) + 1;
    this.saveTrashBackpack();
    return {
      ...trash,
      count: this.trashBackpack[trash.id],
      total: Object.values(this.trashBackpack).reduce((sum, count) => sum + (Number(count) || 0), 0),
    };
  }

  loadStats() {
    try {
      const saved = JSON.parse(localStorage.getItem("lumpaFocusStatsV1") || "null");
      if (saved && typeof saved === "object") {
        return {
          totalFocusMinutes: Number(saved.totalFocusMinutes) || 0,
          completedSessions: Number(saved.completedSessions) || 0,
          abandonedSessions: Number(saved.abandonedSessions) || 0,
          giftsCollected: Number(saved.giftsCollected) || 0,
        };
      }
    } catch (e) {}
    return { totalFocusMinutes: 0, completedSessions: 0, abandonedSessions: 0, giftsCollected: 0 };
  }

  saveStats() {
    try {
      localStorage.setItem("lumpaFocusStatsV1", JSON.stringify(this.stats));
    } catch (e) {}
  }

  ensureTodayTodos() {
    const dateKey = getLocalDateKey();
    if (dateKey !== this.todayKey) {
      this.todayKey = dateKey;
      this.todos = this.loadTodos();
      this.activeSessionTodoIds = [];
    }
    return this.todos;
  }

  loadTodos() {
    const dateKey = this.todayKey || getLocalDateKey();
    try {
      const saved = JSON.parse(localStorage.getItem(`lumpaDailyTodosV1:${dateKey}`) || "[]");
      if (Array.isArray(saved)) return saved.filter(todo => todo && typeof todo.text === "string");
    } catch (e) {}
    return [];
  }

  saveTodos() {
    try {
      localStorage.setItem(`lumpaDailyTodosV1:${this.todayKey}`, JSON.stringify(this.todos));
    } catch (e) {}
  }

  getTodayTodos() {
    this.ensureTodayTodos();
    return this.todos.map(todo => ({ ...todo }));
  }

  addTodo(text) {
    this.ensureTodayTodos();
    const cleanText = String(text || "").trim().slice(0, 100);
    if (!cleanText) return null;
    const todo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: cleanText,
      done: false,
      rewardGranted: false,
      rewardId: null,
      createdAt: Date.now(),
      completedAt: null,
      date: this.todayKey,
    };
    this.todos.push(todo);
    this.saveTodos();
    this.onTodosChanged?.(this.getTodayTodos());
    return { ...todo };
  }

  toggleTodo(todoId, done = true) {
    this.ensureTodayTodos();
    const todo = this.todos.find(item => item.id === todoId);
    if (!todo) return null;

    todo.done = Boolean(done);
    todo.completedAt = todo.done ? (todo.completedAt || Date.now()) : null;
    let gift = null;
    // 奖励与番茄计时完全解耦：任务首次勾选即得奖励；反复取消/勾选不能刷奖励。
    if (todo.done && !todo.rewardGranted) {
      gift = this.grantTodoReward();
      todo.rewardGranted = true;
      todo.rewardId = gift.id;
    }
    this.saveTodos();
    const snapshot = { ...todo };
    this.onTodosChanged?.(this.getTodayTodos());
    if (gift) this.onTodoReward?.({ todo: snapshot, gift });
    return { todo: snapshot, gift };
  }

  removeTodo(todoId) {
    this.ensureTodayTodos();
    const nextTodos = this.todos.filter(item => item.id !== todoId);
    if (nextTodos.length === this.todos.length) return false;
    this.todos = nextTodos;
    this.saveTodos();
    this.onTodosChanged?.(this.getTodayTodos());
    return true;
  }

  grantTodoReward() {
    const rewardPool = ["acorn", "daisy", "coffee_beans", "pencil_stub", "cookie"];
    const giftId = rewardPool[Math.floor(Math.random() * rewardPool.length)];
    const gift = GIFT_REGISTRY[giftId];
    this.giftBackpack[giftId] = (this.giftBackpack[giftId] || 0) + 1;
    this.stats.giftsCollected += 1;
    this.saveGiftBackpack();
    this.saveStats();
    return gift;
  }

  loadPetGrowth() {
    try {
      const saved = JSON.parse(localStorage.getItem("lumpaPetGrowthV1") || "null");
      if (saved && typeof saved === "object") return saved;
    } catch (e) {}
    return {};
  }

  savePetGrowth() {
    try {
      localStorage.setItem("lumpaPetGrowthV1", JSON.stringify(this.petGrowth));
    } catch (e) {}
  }

  getPetGrowthInfo(petId = this.equipped.petId) {
    const completedPomodoros = Math.max(0, Number(this.petGrowth[petId]?.completedPomodoros) || 0);
    let stage = "幼崽";
    let nextAt = 3;
    if (completedPomodoros >= 15) {
      stage = "成年";
      nextAt = null;
    } else if (completedPomodoros >= 8) {
      stage = "少年";
      nextAt = 15;
    } else if (completedPomodoros >= 3) {
      stage = "小猫";
      nextAt = 8;
    }
    // 每完成一次番茄都会均匀长大一点，15 次达到成年体型；始终等比缩放。
    const scale = 0.68 + Math.min(15, completedPomodoros) * (0.32 / 15);
    return {
      petId,
      completedPomodoros,
      stage,
      nextAt,
      scale,
      progress: Math.min(1, completedPomodoros / 15),
    };
  }

  growCurrentPet() {
    const petId = this.equipped.petId;
    const current = this.getPetGrowthInfo(petId);
    this.petGrowth[petId] = { completedPomodoros: current.completedPomodoros + 1 };
    this.savePetGrowth();
    const growth = this.getPetGrowthInfo(petId);
    this.onGrowthChanged?.(growth);
    return growth;
  }

  handleAppSwitch(appName, category, title = "") {
    const combined = `${appName} ${title}`.trim();
    if (!appName || combined === this.lastForegroundApp) return;

    this.lastForegroundApp = combined;
    this.lastForegroundCategory = category;

    // 还没开始入座伴读时，保持绝对静音，绝不发出任何声音打扰用户正常操作
    if (this.state !== "focusing") {
      return;
    }

    const now = Date.now();
    if (now - this.lastSwitchTime < 300) return;
    this.lastSwitchTime = now;

    // 摸鱼判定：包含游戏、视频、社交网页与软件
    const isDistraction = category === "game" || 
      /bilibili|douyin|weibo|steam|youtube|game|twitter|x\.com|tiktok|taptap|epicgames/i.test(combined);

    if (isDistraction) {
      this.catAudio.playMeow("alert");
      const alertQuotes = [
        `……某人是不是切到【${appName}】摸鱼啦？(推眼镜盯)`,
        `小桌上的热咖啡还冒着气呢，快回来专心嘛～`,
        `任务栏的小脑袋探出来了：说好要一起专注完成目标的哦！`,
        `再专心坚持一会儿，等会儿就能在桌角摸到神秘礼物啦！`
      ];
      const quote = alertQuotes[Math.floor(Math.random() * alertQuotes.length)];
      this.onSubtitleTrigger?.(quote, "alert");
      return;
    }

    // 生产力工具判定：代码、文档、办公
    const isProductive = category === "tool" || 
      /code|cursor|word|excel|idea|pycharm|notes|terminal|github|feishu|notion|wps/i.test(combined);

    if (isProductive) {
      this.catAudio.playMeow("purr");
      const returnQuotes = [
        `欢迎回来！深吸一口气，我们继续在【${appName}】沉浸推进～`,
        `小猫伸了伸爪子：看你认真敲字的样子，真的超有安全感！`,
        `保持节奏～小木桌上的计时器正在为你一秒秒记录努力哦。`
      ];
      const quote = returnQuotes[Math.floor(Math.random() * returnQuotes.length)];
      this.onSubtitleTrigger?.(quote, "purr");
      return;
    }

    // 其他任意打开的应用或切屏（浏览器等），即刻发声提醒伴读在侧
    this.catAudio.playMeow("curious");
    const quote = `切换到【${appName}】啦～小猫在旁边默默陪读，保持专注哦！`;
    this.onSubtitleTrigger?.(quote, "curious");
  }

  startDangle() {
    this.isDangling = true;
    this.isLanding = false;
    if (this.equipped.petId === "dog_french_fawn") {
      this.isGroundJumping = false;
      this.isClimbing = false;
      this.isClimbingCatTree = false;
      this.isJumpingDown = false;
      this.isJumpingDownTree = false;
      this.isStretching = false;
      this.petY = this.onDesk ? this.getDeskSurfaceOffset() : this.onCatTree ? this.getCatTreeSurfaceOffset() : 0;
      this.setAction("run", 0);
      this.visualTransition = null;
      this.actionFrameDelay = 0;
      this.onSubtitleTrigger?.("小法斗迈开短腿，跟着你快跑起来！", "gentle");
    } else {
      this.setAction("dangle", 0);
      this.catAudio.playMeow("whine");
      this.onSubtitleTrigger?.("……喵呀！(被命运扼住了后颈皮，四爪悬空晃呀晃～)", "gentle");
    }
  }

  endDangle() {
    if (!this.isDangling) return;
    this.isDangling = false;
    this.isLanding = true;
    this.landingProgress = 1.0;
    this.setAction(this.equipped.petId === "dog_french_fawn" ? "rest" : "land", 900);
    if (this.equipped.petId !== "dog_french_fawn") {
      this.catAudio.playMeow("purr");
      this.onSubtitleTrigger?.("稳稳四脚着地！抖了抖小绒毛～", "purr");
    }
  }

  triggerClimbDesk(silent = false) {
    if (this.onDesk || this.isClimbing || this.isJumpingDown) return;
    this.setFurnitureScene("desk");
    if (this.onCatTree) this.onCatTree = false;
    this.isClimbing = true;
    this.climbProgress = 0;
    this.setAction("pounce", 0);
    if (!silent) this.catAudio.playMeow("gentle");
    this.onSubtitleTrigger?.("🐾 压低小爪、摇了摇小屁股——一口气跃上小木桌！", "gentle");
  }

  triggerLieDesk(silent = false) {
    this.setFurnitureScene("desk");
    if (!this.onDesk) {
      this.triggerClimbDesk(silent);
      window.setTimeout(() => {
        this.setAction("lie_desk", 7000);
        if (!silent) this.catAudio.playMeow("purr");
        this.onSubtitleTrigger?.("🍞 伏在小木桌上，身姿压得扁扁的，下巴贴着木头打盹～", "purr");
      }, 700);
      return;
    }
    this.setAction("lie_desk", 7000);
    if (!silent) this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🍞 伏在小木桌上，身姿压得扁扁的，下巴贴着木头打盹～", "purr");
  }

  triggerClimbCatTree(silent = false) {
    if (this.onCatTree || this.isClimbingCatTree || this.isJumpingDownTree) return;
    this.setFurnitureScene("cattree");
    if (this.onDesk) this.onDesk = false;
    this.isClimbingCatTree = true;
    this.climbTreeProgress = 0;
    this.setAction("pounce", 0);
    if (!silent) this.catAudio.playMeow("curious");
    this.onSubtitleTrigger?.("🌳 轻轻一跃！登上了原木猫爬架顶层瞭望台～", "curious");
  }

  triggerJumpDownCatTree(silent = false) {
    if (!this.onCatTree || this.isClimbingCatTree || this.isJumpingDownTree) return;
    this.isJumpingDownTree = true;
    this.jumpDownTreeProgress = 0;
    this.setAction("pounce", 0);
    if (!silent) this.catAudio.playMeow("curious");
    this.onSubtitleTrigger?.("🐾 从猫爬架轻巧跃下，软软肉垫着地～", "curious");
  }

  triggerJumpDown(silent = false) {
    if (!this.onDesk || this.isClimbing || this.isJumpingDown) return;
    this.isJumpingDown = true;
    this.jumpDownProgress = 0;
    this.setAction("pounce", 0);
    if (!silent) this.catAudio.playMeow("curious");
    this.onSubtitleTrigger?.("🐾 轻巧跃下桌面，软软的小爪肉垫无声着地～", "curious");
  }

  triggerGroundJump(silent = false) {
    if (this.isGroundJumping || this.isClimbing || this.isJumpingDown || this.isClimbingCatTree || this.isJumpingDownTree) return;
    this.isGroundJumping = true;
    this.groundJumpProgress = 0;
    this.setAction("pounce", 0);
    if (!silent) this.catAudio.playMeow("curious");
    this.onSubtitleTrigger?.("🐾 压低小身板蓄力——轻巧一跃腾空！", "curious");
  }

  triggerCatStretch(silent = false) {
    if (this.isStretching) return;
    this.isStretching = true;
    this.stretchProgress = 0;
    this.setAction("stretch", 0);
    if (!silent) this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🐈 前爪前伸下压、高高翘起小屁股～舒舒服服伸了个大懒腰！", "purr");
  }

  triggerWalkRoam(silent = false) {
    const bound = this.getWalkBound();
    let newTarget = (Math.random() - 0.5) * bound * 2;
    if (Math.abs(newTarget - this.walkOffset) < 20) {
      newTarget = (this.walkOffset >= 0 ? -1 : 1) * (18 + Math.random() * (bound - 18));
    }
    this.walkTarget = Math.max(-bound, Math.min(bound, newTarget));
    this.facing = this.walkTarget > this.walkOffset ? 1 : -1;
    this.setAction("walk", 3800);
    this.onSubtitleTrigger?.("🚶 迈着轻巧的小猫步在周围自由漫步溜达～", "curious");
  }

  triggerLookAround(silent = false) {
    this.setAction("look", 2000);
    if (!silent) this.catAudio.playMeow("curious");
    this.onSubtitleTrigger?.("👀 歪了歪小脑瓜，竖起尖耳朵好奇地打量周围～", "curious");
  }

  triggerWashFace(silent = false) {
    this.setAction("wash", 2200);
    if (!silent) this.catAudio.playMeow("gentle");
    this.onSubtitleTrigger?.("🐾 抬起软软的小前爪，仔细抹了抹小胡须和脸蛋～", "gentle");
  }

  triggerPounceWiggle(silent = false) {
    this.setAction("pounce", 2000);
    if (!silent) this.catAudio.playMeow("curious");
    this.onSubtitleTrigger?.("🐾 压低小身板，小屁股左右蓄力轻摇——超凶猛扑！", "curious");
  }

  triggerRollPlay(silent = false) {
    this.setAction("roll", 2400);
    if (!silent) this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("🧶 咕咚翻过身露出软肚皮，四脚朝天抱着毛线球打滚玩耍！", "purr");
  }

  triggerLoafNap(silent = false) {
    this.setAction("sleep", 6000);
    if (!silent) this.catAudio.playMeow("purr");
    this.onSubtitleTrigger?.("💤 揣起两只前爪趴在暖软垫上，舒舒服服打起小瞌睡～", "purr");
  }

  onWalkTargetReached() {
    this.actionDuration = 0;
    this.lastAutonomousActionTime = Date.now();
    if (!this.autoLifeEnabled) {
      this.setAction("idle", 0);
      return;
    }
    // 到达漫步终点后的动作衔接（自主状态统一静音陪伴）
    if (!this.onDesk && !this.onCatTree) {
      const r = Math.random();
      if (r < 0.25) {
        this.triggerClimbDesk(true);
      } else if (r < 0.45) {
        this.triggerClimbCatTree(true);
      } else if (r < 0.65) {
        this.triggerLookAround(true);
      } else if (r < 0.80) {
        this.triggerWashFace(true);
      } else if (r < 0.90) {
        this.triggerCatStretch(true);
      } else {
        this.triggerRollPlay(true);
      }
    } else if (this.onDesk) {
      const r = Math.random();
      if (r < 0.35) {
        this.triggerLieDesk(true);
      } else if (r < 0.60) {
        this.triggerCatStretch(true);
      } else if (r < 0.80) {
        this.triggerLookAround(true);
      } else {
        this.triggerJumpDown(true);
      }
    } else {
      const r = Math.random();
      if (r < 0.40) {
        this.triggerLookAround(true);
      } else if (r < 0.70) {
        this.triggerWashFace(true);
      } else {
        this.triggerJumpDownCatTree(true);
      }
    }
  }

  nextAutonomousAction() {
    if (!this.autoLifeEnabled) return;
    if (Date.now() < this.manualActionLock) return;
    if (this.isClimbing || this.isJumpingDown || this.isDangling || this.isStretching || this.isClimbingCatTree || this.isJumpingDownTree) return;
    this.lastAutonomousActionTime = Date.now();

    // The fawn Frenchie has its own extra poses; never inject them into the
    // other nineteen companions' action graphs.
    if (this.equipped.petId === "dog_french_fawn" && Math.random() < 0.48) {
      const choices = ["sniff", "bow", "greet", ...FAWN_DAILY_ACTIONS];
      const action = choices[Math.floor(Math.random() * choices.length)];
      this.setAction(action, (action === "sit" ? 2600 : 1700) + Math.round(Math.random() * 800));
      return;
    }

    // 自主生活行动决策（静音陪伴：传入 true，绝不打扰用户）
    if (!this.onDesk && !this.onCatTree) {
      const r = Math.random();
      if (r < 0.28) {
        this.triggerWalkRoam(true);
      } else if (r < 0.42) {
        this.triggerLookAround(true);
      } else if (r < 0.55) {
        this.triggerWashFace(true);
      } else if (r < 0.68) {
        this.triggerCatStretch(true);
      } else if (r < 0.78) {
        this.triggerClimbDesk(true);
      } else if (r < 0.88) {
        this.triggerClimbCatTree(true);
      } else if (r < 0.94) {
        this.triggerPounceWiggle(true);
      } else {
        this.triggerRollPlay(true);
      }
    } else if (this.onDesk) {
      const r = Math.random();
      if (r < 0.35) {
        this.triggerLieDesk(true);
      } else if (r < 0.60) {
        this.triggerCatStretch(true);
      } else if (r < 0.80) {
        this.triggerLookAround(true);
      } else {
        this.triggerJumpDown(true);
      }
    } else {
      const r = Math.random();
      if (r < 0.40) {
        this.triggerLookAround(true);
      } else if (r < 0.70) {
        this.triggerWashFace(true);
      } else {
        this.triggerJumpDownCatTree(true);
      }
    }
  }

  toggleAutoLife() {
    this.autoLifeEnabled = !this.autoLifeEnabled;
    const msg = this.autoLifeEnabled ? "🤖 已开启【全自主自由生活模式】：小猫会自己漫步、爬桌、伸懒腰、洗脸与打滚！" : "⏸️ 已暂停自主活动，保持当前姿态。";
    this.onSubtitleTrigger?.(msg, "gentle");
    if (this.autoLifeEnabled) {
      this.nextAutonomousAction();
    }
    return this.autoLifeEnabled;
  }

  setAction(action, duration = 0) {
    const previous = this.currentAction || "idle";
    const isFawn = this.equipped.petId === "dog_french_fawn";
    if (isFawn && action === "idle" && ["walk", "run", "sniff", "bow", "land", "rest", ...FAWN_DAILY_ACTIONS].includes(previous)) action = "rest";
    let clip = null;
    let transitionDuration = 0;
    let frameSequence = null;
    if (isFawn && ["walk", "run"].includes(previous) && action !== previous) {
      clip = "settle";
      transitionDuration = previous === "run" ? 280 : 320;
    } else if (isFawn && ["sniff", "bow", ...FAWN_DAILY_ACTIONS].includes(previous) && action !== previous) {
      clip = `${previous}_end`;
      const current = Math.max(0, this.actionFrame) % 4;
      frameSequence = current === 3 && previous !== "sit" ? [3, 0] : Array.from({ length: current + 1 }, (_, index) => current - index);
      transitionDuration = frameSequence.length * 90;
    } else if (previous === "walk" && action !== "walk") {
      clip = "walk_stop";
      transitionDuration = 240;
    } else if (action === "walk" && previous !== "walk") {
      clip = "walk_start";
      transitionDuration = 240;
    } else if (action === "wash" && previous !== "wash") {
      clip = "wash_start";
      transitionDuration = 150;
    } else if (action === "roll" && previous !== "roll") {
      clip = "roll_start";
      transitionDuration = 150;
    } else if (action === "stretch" && previous !== "stretch") {
      clip = "stretch_start";
      transitionDuration = 150;
    } else if (action === "idle" && previous !== "idle") {
      clip = "recover";
      transitionDuration = 150;
    }
    this.previousAction = previous;
    this.visualTransition = clip ? { clip, startTime: Date.now(), duration: transitionDuration, frameSequence } : null;
    this.currentAction = action;
    this.actionStartTime = Date.now();
    this.actionFrameDelay = transitionDuration;
    if (isFawn) {
      this.actionFrame = 0;
      if (action === "walk" && previous !== "walk") this.walkVelocity = 0;
    }
    this.actionDuration = duration > 0 && isFawn ? duration + transitionDuration : duration;
    this.lastAutonomousActionTime = Date.now();
  }

  updateAction() {
    const now = Date.now();
    const clockNow = typeof performance !== "undefined" ? performance.now() : now;
    const hasMultipleRenderSurfaces = Boolean(
      this.stageCanvas || (typeof document !== "undefined" && document.querySelector("#petFloatingCanvas")),
    );
    if (!hasMultipleRenderSurfaces) {
      // 保持无画布状态下的引擎确定性，便于离线逻辑调用与测试。
      this.lastActionUpdateAt = clockNow;
    } else if (!this.lastActionUpdateAt) {
      this.lastActionUpdateAt = clockNow;
      return;
    }
    const elapsed = hasMultipleRenderSurfaces
      ? Math.min(50, Math.max(0, clockNow - this.lastActionUpdateAt))
      : 1000 / 60;
    // 第二个画布通常会紧随第一个画布绘制；不重复推进状态。
    if (hasMultipleRenderSurfaces && elapsed < 8) return;
    this.lastActionUpdateAt = clockNow;
    const tick = elapsed / (1000 / 60);
    const isFocusing = this.state === "focusing";
    // Keep the paws planted while anticipation/recovery frames play. Moving
    // the root before those poses finish makes the pet visibly skate.
    if (this.equipped.petId === "dog_french_fawn" && this.visualTransition && now - this.actionStartTime < this.actionFrameDelay) {
      this.actionFrame = 0;
      return;
    }

    // 0. 原地蓄力轻跃物理运动学 (Anticipation Squat -> Flight Arc -> Cushion Land)
    if (this.isGroundJumping) {
      this.groundJumpProgress += 0.032 * tick;
      const t = this.groundJumpProgress;
      if (t < 0.22) {
        // 阶段 1: 蓄力压低身体，小爪紧抓地面
        this.currentAction = "pounce";
        this.actionFrame = Math.min(3, Math.floor((t / 0.22) * 4));
        this.petY = 4;
      } else if (t < 0.82) {
        // 阶段 2: 真实抛物线腾空跃起
        const flightT = (t - 0.22) / 0.60;
        const arc = Math.sin(flightT * Math.PI) * 28;
        this.petY = -arc;
        this.currentAction = "jump";
        this.actionFrame = Math.min(2, Math.floor(flightT * 3));
      } else if (t < 1.0) {
        // 阶段 3: 肉垫着地吸收缓冲
        this.petY = 0;
        this.currentAction = "land";
        this.landingProgress = (1.0 - t) / 0.18;
      } else {
        this.petY = 0;
        this.isGroundJumping = false;
        this.setAction("idle", 0);
        this.landingProgress = 0;
      }
      return;
    }

    // 1. 爬上桌子物理运动学插值 (Squat -> Parabolic Leap -> Land on Desk)
    if (this.isClimbing) {
      this.climbProgress += 0.024 * tick;
      if (this.climbProgress < 0.28) {
        // 阶段 1: 蓄力压低身体，小屁股左右摇晃
        this.currentAction = "pounce";
        this.actionFrame = Math.min(3, Math.floor((this.climbProgress / 0.28) * 4));
      } else if (this.climbProgress < 0.85) {
        // 阶段 2: 真实抛物线起跳飞向桌面；终点直接取同一张场景蓝图的桌面高度。
        const t = (this.climbProgress - 0.28) / 0.57;
        const arc = Math.sin(t * Math.PI) * 28;
        this.petY = this.getDeskSurfaceOffset() * t - arc;
        this.currentAction = "jump";
        this.actionFrame = Math.min(2, Math.floor(t * 3));
      } else {
        // 阶段 3: 落在桌面上，缓冲下压
        this.petY = this.getDeskSurfaceOffset();
        this.onDesk = true;
        this.isClimbing = false;
        this.setAction("land", 320);
        this.landingProgress = 0.8;
      }
      return;
    }

    // 2. 跳下桌子物理插值 (Leap down from desk to floor)
    if (this.isJumpingDown) {
      this.jumpDownProgress += 0.035 * tick;
      const t = this.jumpDownProgress;
      if (t < 0.22) {
        this.currentAction = "pounce";
        this.actionFrame = Math.min(3, Math.floor((t / 0.22) * 4));
      } else if (t < 0.82) {
        const flightT = (t - 0.22) / 0.60;
        const arc = Math.sin(flightT * Math.PI) * 16;
        this.petY = this.getDeskSurfaceOffset() * (1 - flightT) - arc;
        this.currentAction = "jump";
        this.actionFrame = Math.min(2, Math.floor(flightT * 3));
      } else {
        this.petY = 0;
        this.onDesk = false;
        this.isJumpingDown = false;
        this.setAction("land", 320);
        this.landingProgress = 0.8;
      }
      return;
    }

    // 2b. 爬上猫爬架物理插值 (Climb Cat Tree)
    if (this.isClimbingCatTree) {
      this.climbTreeProgress += 0.024 * tick;
      if (this.climbTreeProgress < 0.28) {
        this.currentAction = "pounce";
        this.actionFrame = Math.min(3, Math.floor((this.climbTreeProgress / 0.28) * 4));
      } else if (this.climbTreeProgress < 0.85) {
        const t = (this.climbTreeProgress - 0.28) / 0.57;
        const arc = Math.sin(t * Math.PI) * 30;
        this.petY = this.getCatTreeSurfaceOffset() * t - arc;
        this.walkOffset += (-75 - this.walkOffset) * 0.08;
        this.currentAction = "jump";
        this.actionFrame = 1;
      } else {
        this.petY = this.getCatTreeSurfaceOffset();
        this.walkOffset = -75;
        this.onCatTree = true;
        this.isClimbingCatTree = false;
        this.setAction("land", 320);
        this.landingProgress = 0.8;
      }
      return;
    }

    // 2c. 从猫爬架跳下 (Jump down from Cat Tree)
    if (this.isJumpingDownTree) {
      this.jumpDownTreeProgress += 0.035 * tick;
      const t = this.jumpDownTreeProgress;
      if (t < 1.0) {
        const arc = Math.sin(t * Math.PI) * 16;
        this.petY = this.getCatTreeSurfaceOffset() * (1 - t) - arc;
        this.currentAction = "jump";
        this.actionFrame = 1;
      } else {
        this.petY = 0;
        this.onCatTree = false;
        this.isJumpingDownTree = false;
        this.setAction("land", 320);
        this.landingProgress = 0.8;
      }
      return;
    }

    // 3. 60帧丝滑猫式伸懒腰插值 (Smooth Cat Stretch)
    if (this.isStretching) {
      this.stretchProgress += 0.016 * tick;
      this.currentAction = "stretch";
      if (this.stretchProgress >= 1.0) {
        this.isStretching = false;
        this.stretchProgress = 0;
        this.setAction("idle", 0);
        if (this.autoLifeEnabled) {
          this.nextAutonomousAction();
        }
      }
      return;
    }

    // 4. 落地缓冲递减
    if (this.landingProgress > 0) {
      this.landingProgress = Math.max(0, this.landingProgress - 0.08 * tick);
    }

    if (this.blinkEffect > 0) this.blinkEffect = Math.max(0, this.blinkEffect - tick);
    if (this.tiltEffect > 0) this.tiltEffect = Math.max(0, this.tiltEffect - tick);
    if (this.shakeEffect > 0) this.shakeEffect = Math.max(0, this.shakeEffect - tick);

    // 5. 如果处于被鼠标拎起状态
    if (this.isDangling) {
      if (this.equipped.petId === "dog_french_fawn") {
        this.currentAction = "run";
        this.actionFrame = Math.floor((now - this.actionStartTime) / 65) % FAWN_FRENCHIE_FRAME_COUNTS.run;
      } else {
        this.currentAction = "dangle";
        this.actionFrame = (this.frameCount % 30 > 15) ? 1 : 0;
      }
      return;
    }

    // 6. 自由漫步物理位移推进与硬边界防御 (Walk Translation Physics & Strict Hard Clamp)
    if (this.currentAction === "walk") {
      const bound = this.getWalkBound();
      const dx = this.walkTarget - this.walkOffset;
      if (Math.abs(dx) > 1.5) {
        this.facing = dx > 0 ? 1 : -1;
        let speed = 0.95;
        if (this.equipped.petId === "dog_french_fawn") {
          const desired = 0.95 * Math.min(1, Math.abs(dx) / 14);
          this.walkVelocity += (desired - this.walkVelocity) * Math.min(1, 0.18 * tick);
          speed = this.walkVelocity;
        }
        const step = Math.sign(dx) * Math.min(Math.abs(dx), speed * tick);
        this.walkOffset += step;
      } else {
        this.walkOffset = this.walkTarget;
        this.walkVelocity = 0;
        // 走到终点，自然衔接下一个动作
        this.onWalkTargetReached();
      }

      // 绝不出画防御
      if (this.walkOffset > bound) {
        this.walkOffset = bound;
        this.walkTarget = bound;
        this.facing = -1;
        this.onWalkTargetReached();
      } else if (this.walkOffset < -bound) {
        this.walkOffset = -bound;
        this.walkTarget = -bound;
        this.facing = 1;
        this.onWalkTargetReached();
      }
    }

    // 7. 定格动作时长到期与快速自主行为轮转 (Fast Cadence Auto Life: 1.8s ~ 3.5s)
    if (this.actionDuration > 0) {
      if (now - this.actionStartTime > this.actionDuration) {
        this.actionDuration = 0;
        if (this.autoLifeEnabled) {
          this.nextAutonomousAction();
        } else {
          this.setAction(isFocusing ? "focusing" : "idle", 0);
        }
      }
    } else if (this.autoLifeEnabled && ["idle", "rest"].includes(this.currentAction)) {
      // 闲置待机超过 1.5 秒快速激活下一个动作，衔接流畅不发呆
      const idleTime = now - this.lastAutonomousActionTime;
      if (idleTime > 1500) {
        this.nextAutonomousAction();
      }
    }

    // 8. 定格动画帧节奏分频器 (Stop-Motion Frame Stepper)
    const isFawn = this.equipped.petId === "dog_french_fawn";
    const poseClock = isFawn ? Math.max(0, now - this.actionStartTime - this.actionFrameDelay) : now;
    if (this.currentAction === "walk") {
      this.actionFrame = Math.floor(poseClock / (isFawn ? 85 : 130)) % (isFawn ? FAWN_FRENCHIE_FRAME_COUNTS.walk : 4);
    } else if (this.currentAction === "run") {
      this.actionFrame = Math.floor(poseClock / (isFawn ? 65 : 90)) % (isFawn ? FAWN_FRENCHIE_FRAME_COUNTS.run : 4);
    } else if (this.currentAction === "sniff") {
      this.actionFrame = Math.floor(poseClock / 240) % FAWN_FRENCHIE_FRAME_COUNTS.sniff;
    } else if (this.currentAction === "bow") {
      this.actionFrame = Math.floor(poseClock / 220) % FAWN_FRENCHIE_FRAME_COUNTS.bow;
    } else if (this.currentAction === "rest") {
      this.actionFrame = [0, 0, 0, 2, 0, 1, 0, 3][Math.floor(poseClock / 300) % 8];
    } else if (isFawn && this.currentAction === "sit") {
      // Sit once and hold; replaying the descent would make the pet bounce.
      this.actionFrame = Math.min(3, Math.floor(poseClock / 160));
    } else if (isFawn && this.currentAction === "wag") {
      this.actionFrame = Math.floor(poseClock / 130) % 4;
    } else if (isFawn && this.currentAction === "curious") {
      this.actionFrame = [0, 1, 2, 2, 1, 3][Math.floor(poseClock / 220) % 6];
    } else if (isFawn && this.currentAction === "yawn") {
      this.actionFrame = Math.min(3, Math.floor(poseClock / 320));
    } else if (this.currentAction === "wash") {
      this.actionFrame = Math.floor((now / 220) % 4);
    } else if (this.currentAction === "sleep" || this.currentAction === "lie_desk") {
      this.actionFrame = Math.floor((now / 480) % 4);
    } else if (this.currentAction === "play") {
      this.actionFrame = Math.floor((now / 180) % 4);
    } else if (this.currentAction === "look") {
      this.actionFrame = Math.floor((now / 320) % 4);
    } else if (this.currentAction === "pounce") {
      this.actionFrame = Math.floor((now / 180) % 4);
    } else if (this.currentAction === "roll") {
      this.actionFrame = Math.floor((now / 200) % 4);
    } else if (this.currentAction === "stretch") {
      this.actionFrame = Math.floor(this.stretchProgress * 4) % 4;
    } else if (this.currentAction === "jump") {
      this.actionFrame = Math.min(2, Math.floor((now - this.actionStartTime) / 160));
    } else if (this.currentAction === "dangle") {
      this.actionFrame = (this.frameCount % 30 > 15) ? 1 : 0;
    } else if (this.currentAction === "land") {
      this.actionFrame = 0;
    } else if (this.currentAction === "idle" || this.currentAction === "focusing") {
      this.actionFrame = Math.floor((now / 480) % 4);
    } else {
      this.actionFrame = 0;
    }
  }

  setDuration(minutes) {
    if (this.state === "focusing") return;
    this.targetDuration = minutes * 60;
    this.remainingSeconds = this.targetDuration;
    this.updateDisplayTimer();
  }

  setAmbientType(type) {
    return this.catAudio.setAmbientType(type, this.state === "focusing");
  }

  setMuted(muted) {
    return this.catAudio.setMuted(muted);
  }

  toggleMute() {
    return this.catAudio.toggleMute();
  }

  startFocus() {
    if (this.state === "focusing") return;
    this.ensureTodayTodos();
    this.state = "focusing";
    this.remainingSeconds = this.targetDuration;
    this.startTime = Date.now();
    this.activeSessionTodoIds = this.todos.filter(todo => !todo.done).map(todo => todo.id);
    this.lastForegroundApp = "";
    this.lastSwitchTime = 0;

    this.catAudio.playMeow("gentle");

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state !== "focusing") return;
      this.remainingSeconds--;
      this.updateDisplayTimer();

      if (this.remainingSeconds <= 0) {
        this.completeFocus();
      }
    }, 1000);

    this.onStateChanged?.(this.state);
    this.onSubtitleTrigger?.("小木桌已搬来，推了推金丝眼镜：开始全神贯注吧！", "gentle");
  }

  abandonFocus() {
    if (this.state !== "focusing") return;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.state = "interrupted";
    this.stats.abandonedSessions += 1;
    this.saveStats();

    this.manualActionLock = Date.now() + 3200;
    this.shakeEffect = Math.max(this.shakeEffect || 0, 36);
    this.tiltEffect = Math.max(this.tiltEffect || 0, 42);
    this.setAction("look", 3200);
    this.catAudio.playMeow("whine");
    const trash = this.grantTrash();
    this.onSubtitleTrigger?.(`计时被提前关掉啦……${trash.name}先放进中断垃圾堆。`, "whine");
    this.onInterrupted?.(trash);
    this.onStateChanged?.(this.state);
  }

  completeFocus() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.state = "reward";

    this.ensureTodayTodos();
    const completedTodos = this.todos.filter(todo => (
      todo.done
      && todo.rewardGranted
      && Number(todo.completedAt) >= this.startTime
    ));
    const rewardsEarned = completedTodos
      .map(todo => GIFT_REGISTRY[todo.rewardId])
      .filter(Boolean);
    const growth = this.growCurrentPet();
    this.stats.totalFocusMinutes += Math.max(1, Math.round(this.targetDuration / 60));
    this.stats.completedSessions += 1;
    this.saveStats();

    this.catAudio.playMeow("purr");
    this.onCompleted?.({
      timeCompleted: true,
      growth,
      completedTodoCount: completedTodos.length,
      rewardsEarned,
    });
    this.onStateChanged?.(this.state);
  }

  resetToIdle() {
    this.state = "idle";
    this.remainingSeconds = this.targetDuration;
    this.updateDisplayTimer();
    this.onStateChanged?.(this.state);
  }

  updateDisplayTimer() {
    const min = Math.floor(this.remainingSeconds / 60);
    const sec = this.remainingSeconds % 60;
    const str = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    const timerEl = document.getElementById("focusTimerDisplay");
    if (timerEl) timerEl.textContent = str;

    const progressEl = document.getElementById("focusProgressBar");
    if (progressEl) {
      const pct = ((this.targetDuration - this.remainingSeconds) / this.targetDuration) * 100;
      progressEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }
  }

  equip(slot, itemId) {
    if (slot === "pet") {
      if (!PET_ARCHETYPES[itemId] || !this.unlockedItems[itemId]) return false;
      this.equipped.petId = itemId;
      this.saveEquipped();
      this.catAudio.playMeow("gentle");
      this.onWardrobeChanged?.();
      this.onGrowthChanged?.(this.getPetGrowthInfo(itemId));
      return true;
    }
    if (!ACCESSORIES_ENABLED) return false;
    if (!["head", "neck", "face", "skin"].includes(slot)) return false;
    if (itemId && (WARDROBE_ITEMS[itemId]?.slot !== slot || !this.unlockedItems[itemId])) return false;
    this.equipped[slot] = itemId;
    this.saveEquipped();
    this.catAudio.playMeow("gentle");
    this.onWardrobeChanged?.();
    return true;
  }

  canAfford(cost = {}) {
    if (!cost || Object.keys(cost).length === 0) return true;
    for (const [giftId, count] of Object.entries(cost)) {
      if ((this.giftBackpack[giftId] || 0) < count) return false;
    }
    return true;
  }

  purchaseItem(itemId, isPet = false) {
    if (!isPet && !ACCESSORIES_ENABLED) {
      return { success: false, reason: "accessories-disabled" };
    }
    const exists = isPet ? Boolean(PET_ARCHETYPES[itemId]) : Boolean(WARDROBE_ITEMS[itemId]);
    if (!exists) return { success: false, reason: "not-found" };

    const equipPurchasedItem = () => {
      if (isPet) this.equip("pet", itemId);
      else this.equip(WARDROBE_ITEMS[itemId].slot, itemId);
    };

    if (this.unlockedItems[itemId]) {
      equipPurchasedItem();
      return { success: true, alreadyOwned: true };
    }

    const cost = this.getUnlockCost(itemId);
    if (!this.canAfford(cost)) {
      return { success: false, reason: "insufficient-gifts", cost };
    }

    Object.entries(cost).forEach(([giftId, count]) => {
      this.giftBackpack[giftId] = Math.max(0, (this.giftBackpack[giftId] || 0) - count);
    });
    this.unlockedItems[itemId] = true;
    this.saveGiftBackpack();
    this.saveUnlockedItems();
    equipPurchasedItem();
    return { success: true, alreadyOwned: false, cost };
  }

  // =========================================================================
  // =========================================================================
  /**
   * 模块化房间家具与场景绘制系统：按需独立切换（小书桌 / 猫爬架 / 猫窝 / 极简纯净桌面）
   * 彻底杜绝所有物品堆叠挤在一块的混乱体验
   */
  drawPetContactShadow(ctx, cx, groundY, sceneType = this.currentFurnitureScene) {
    const isAirborne = this.isGroundJumping || this.isClimbing || this.isJumpingDown ||
      this.isClimbingCatTree || this.isJumpingDownTree || (this.isDangling && this.equipped.petId !== "dog_french_fawn");
    let surfaceOffset = 0;
    if (!isAirborne && sceneType === "desk" && this.onDesk) {
      surfaceOffset = this.getDeskSurfaceOffset();
    } else if (!isAirborne && sceneType === "cattree" && this.onCatTree) {
      surfaceOffset = this.getCatTreeSurfaceOffset();
    }

    const lift = Math.max(0, -this.petY - surfaceOffset);
    const halfWidth = isAirborne ? Math.max(12, 31 - Math.round(lift * 0.13)) : 31;
    const shadowX = Math.round(cx + this.walkOffset);
    const shadowY = Math.round(groundY + surfaceOffset);

    // 用阶梯状阴影代替悬浮的椭圆：宠物离地越高，阴影越短、越淡。
    ctx.save();
    ctx.globalAlpha = isAirborne ? Math.max(0.07, 0.20 - lift * 0.0015) : 0.18;
    ctx.fillStyle = "#6B584D";
    ctx.fillRect(shadowX - halfWidth + 7, shadowY - 2, (halfWidth - 7) * 2, 5);
    ctx.fillRect(shadowX - halfWidth + 2, shadowY - 1, (halfWidth - 2) * 2, 3);
    ctx.globalAlpha *= 0.65;
    ctx.fillStyle = "#A98F7B";
    ctx.fillRect(shadowX - halfWidth + 10, shadowY - 1, (halfWidth - 10) * 2, 2);
    ctx.restore();
  }

  drawSceneFurniture(ctx, cx, groundY, isFocusing, sipping, isCatAboveDesk = false, isCatOnTree = false, sceneType = this.currentFurnitureScene) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (sceneType === "cattree") {
      // 原木猫爬架：底座、猫屋、剑麻柱、跳台和悬挂玩具均采用独立像素层。
      const treeX = cx - 75;
      const topY = groundY + this.getCatTreeSurfaceOffset();
      const baseY = groundY - 13;
      const condoX = treeX - 48;
      const condoY = groundY - 77;

      // 宽底座与地面接触脚，给爬架稳定而不轻飘的重量感。
      ctx.fillStyle = "#4E3B34";
      ctx.fillRect(treeX - 58, baseY, 116, 13);
      ctx.fillStyle = "#B58C6D";
      ctx.fillRect(treeX - 54, baseY + 2, 108, 7);
      ctx.fillStyle = "#E2BE94";
      ctx.fillRect(treeX - 48, baseY + 3, 96, 2);
      ctx.fillStyle = "#6D5041";
      ctx.fillRect(treeX - 49, baseY + 10, 22, 3);
      ctx.fillRect(treeX + 27, baseY + 10, 22, 3);

      // 低层小屋与弧形入口。
      ctx.fillStyle = "#503B34";
      ctx.fillRect(condoX, condoY, 53, 65);
      ctx.fillStyle = "#C69770";
      ctx.fillRect(condoX + 4, condoY + 4, 45, 55);
      ctx.fillStyle = "#E9C59C";
      ctx.fillRect(condoX + 7, condoY + 7, 39, 4);
      ctx.fillStyle = "#9E7058";
      ctx.fillRect(condoX + 8, condoY + 48, 37, 8);
      ctx.fillStyle = "#49352F";
      ctx.fillRect(condoX + 16, condoY + 34, 21, 22);
      ctx.fillRect(condoX + 19, condoY + 29, 15, 7);
      ctx.fillStyle = "#806258";
      ctx.fillRect(condoX + 20, condoY + 32, 13, 3);

      // 剑麻主柱，横纹会在静态画面中保留真实的材质层次。
      const postX = treeX + 18;
      ctx.fillStyle = "#554239";
      ctx.fillRect(postX - 11, topY + 15, 23, groundY - topY - 26);
      ctx.fillStyle = "#D7B77F";
      ctx.fillRect(postX - 7, topY + 17, 15, groundY - topY - 30);
      for (let y = topY + 20; y < groundY - 28; y += 7) {
        ctx.fillStyle = y % 14 === 0 ? "#B98F60" : "#EDD09A";
        ctx.fillRect(postX - 7, y, 15, 2);
      }

      // 中层跳台与软垫。
      const midY = topY + 49;
      ctx.fillStyle = "#4E3B34";
      ctx.fillRect(treeX + 3, midY, 72, 10);
      ctx.fillStyle = "#C69770";
      ctx.fillRect(treeX + 7, midY + 2, 64, 5);
      ctx.fillStyle = "#F2D9B7";
      ctx.fillRect(treeX + 12, midY + 2, 54, 2);

      // 顶层瞭望台。它的最上边缘就是 getCatTreeSurfaceOffset() 定义的落点。
      ctx.fillStyle = "#4E3B34";
      ctx.fillRect(treeX - 54, topY, 108, 16);
      ctx.fillStyle = "#C69770";
      ctx.fillRect(treeX - 50, topY + 3, 100, 9);
      ctx.fillStyle = "#F4D8AD";
      ctx.fillRect(treeX - 44, topY + 3, 88, 3);
      ctx.fillStyle = "#9A6D57";
      ctx.fillRect(treeX - 47, topY + 12, 94, 3);

      // 流苏逗猫球。
      const ballSway = Math.round(Math.sin(this.frameCount * 0.08) * 4);
      ctx.strokeStyle = "#8D6B5D";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(treeX - 31, topY + 14);
      ctx.lineTo(treeX - 31 + ballSway, topY + 38);
      ctx.stroke();
      ctx.fillStyle = "#E78375";
      ctx.fillRect(treeX - 35 + ballSway, topY + 35, 8, 8);
      ctx.fillStyle = "#FFD0C6";
      ctx.fillRect(treeX - 33 + ballSway, topY + 36, 3, 3);
    } else if (sceneType === "bed") {
      // 羊羔绒猫窝、双格食盆和毛线球分开摆放，留出地面漫步空间。
      const bedX = cx - 38;
      const bedY = groundY - 23;
      ctx.fillStyle = "#765553";
      ctx.fillRect(bedX - 59, bedY - 13, 118, 25);
      ctx.fillStyle = "#D99BA6";
      ctx.fillRect(bedX - 54, bedY - 10, 108, 18);
      ctx.fillStyle = "#F8D7DA";
      ctx.fillRect(bedX - 46, bedY - 7, 92, 11);
      ctx.fillStyle = "#FFF3E7";
      ctx.fillRect(bedX - 33, bedY - 5, 66, 7);
      ctx.fillStyle = "#B77987";
      ctx.fillRect(bedX - 49, bedY + 8, 98, 4);

      const dishX = cx + 91;
      ctx.fillStyle = "#5C6D72";
      ctx.fillRect(dishX - 27, groundY - 20, 54, 12);
      ctx.fillStyle = "#E5EEF0";
      ctx.fillRect(dishX - 23, groundY - 18, 46, 7);
      ctx.fillStyle = "#E9A54B";
      ctx.fillRect(dishX - 19, groundY - 17, 16, 4);
      ctx.fillStyle = "#75C5E8";
      ctx.fillRect(dishX + 4, groundY - 17, 15, 4);

      const yarnX = cx - 118;
      const yarnY = groundY - 13;
      ctx.fillStyle = "#934B66";
      ctx.fillRect(yarnX - 7, yarnY - 7, 15, 15);
      ctx.fillStyle = "#F19AB5";
      ctx.fillRect(yarnX - 5, yarnY - 4, 11, 3);
      ctx.fillRect(yarnX - 3, yarnY + 2, 9, 3);
      ctx.strokeStyle = "#934B66";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(yarnX + 8, yarnY + 5);
      ctx.lineTo(yarnX + 24, yarnY + 11);
      ctx.stroke();
    } else if (sceneType === "clean") {
      // 极简场景只保留地毯，避免任何道具挡住自由漫步的宠物。
    } else {
      // 默认工位：带木纹、抽屉、显示器、书本、杯子和绿植的完整小书桌。
      const topY = groundY + this.getDeskSurfaceOffset();
      const left = cx - 142;
      const right = cx + 142;
      const legTop = topY + 17;
      const legBottom = groundY - 9;

      // 桌板：上层明亮木面、深色边沿和下方投影做出厚度。
      ctx.fillStyle = "#4A3832";
      ctx.fillRect(left, topY - 4, right - left, 21);
      ctx.fillStyle = "#956B58";
      ctx.fillRect(left + 4, topY, right - left - 8, 12);
      ctx.fillStyle = "#D2A882";
      ctx.fillRect(left + 8, topY + 2, right - left - 16, 3);
      ctx.fillStyle = "#754F43";
      ctx.fillRect(left + 5, topY + 13, right - left - 10, 4);
      ctx.fillStyle = "#B98767";
      ctx.fillRect(left + 24, topY + 7, 42, 1);
      ctx.fillRect(left + 178, topY + 8, 35, 1);

      // 两侧桌腿与横梁，一直落到场景地面，而不是停在半空。
      for (const legX of [left + 23, right - 37]) {
        ctx.fillStyle = "#4C3732";
        ctx.fillRect(legX, legTop, 18, legBottom - legTop + 9);
        ctx.fillStyle = "#80594B";
        ctx.fillRect(legX + 4, legTop, 10, legBottom - legTop + 3);
        ctx.fillStyle = "#B07B61";
        ctx.fillRect(legX + 5, legTop + 3, 2, legBottom - legTop - 5);
        ctx.fillStyle = "#4C3732";
        ctx.fillRect(legX - 4, legBottom, 26, 5);
      }
      ctx.fillStyle = "#5F433A";
      ctx.fillRect(left + 41, groundY - 28, right - left - 82, 8);
      ctx.fillStyle = "#A4735D";
      ctx.fillRect(left + 46, groundY - 26, right - left - 92, 3);

      // 右侧抽屉柜。
      ctx.fillStyle = "#533D35";
      ctx.fillRect(right - 84, topY + 18, 49, groundY - topY - 45);
      ctx.fillStyle = "#A7765E";
      ctx.fillRect(right - 80, topY + 22, 41, groundY - topY - 52);
      ctx.fillStyle = "#744E42";
      ctx.fillRect(right - 76, topY + 38, 33, 2);
      ctx.fillRect(right - 76, topY + 58, 33, 2);
      ctx.fillStyle = "#E1BE92";
      ctx.fillRect(right - 62, topY + 30, 8, 2);
      ctx.fillRect(right - 62, topY + 50, 8, 2);

      // 显示器位于桌后，屏幕使用克制的像素 UI，不会挡住桌宠的落点。
      const monitorX = cx + 28;
      const monitorY = topY - 67;
      ctx.fillStyle = "#3F3939";
      ctx.fillRect(monitorX, monitorY, 86, 58);
      ctx.fillStyle = "#202A32";
      ctx.fillRect(monitorX + 4, monitorY + 4, 78, 46);
      ctx.fillStyle = "#415A6C";
      ctx.fillRect(monitorX + 8, monitorY + 8, 70, 6);
      ctx.fillStyle = "#9CD5CE";
      ctx.fillRect(monitorX + 10, monitorY + 20, 26, 3);
      ctx.fillRect(monitorX + 10, monitorY + 27, 43, 3);
      ctx.fillStyle = "#EDB27D";
      ctx.fillRect(monitorX + 10, monitorY + 34, 17, 3);
      ctx.fillStyle = "#6D757A";
      ctx.fillRect(monitorX + 39, monitorY + 51, 8, 11);
      ctx.fillRect(monitorX + 27, monitorY + 61, 32, 4);

      // 左侧书本、陶杯与绿植，形成小而完整的学习角。
      const bookX = left + 33;
      ctx.fillStyle = "#526B86";
      ctx.fillRect(bookX, topY - 8, 30, 8);
      ctx.fillStyle = "#E4AE62";
      ctx.fillRect(bookX + 4, topY - 13, 27, 5);
      ctx.fillStyle = "#F5DBA2";
      ctx.fillRect(bookX + 7, topY - 16, 21, 3);

      const mugX = cx - 30;
      const mugY = topY - (sipping ? 14 : 11);
      ctx.fillStyle = "#6B4A43";
      ctx.fillRect(mugX - 2, mugY, 19, 15);
      ctx.fillStyle = "#F5E4C9";
      ctx.fillRect(mugX + 1, mugY + 2, 12, 10);
      ctx.fillStyle = "#A96E5B";
      ctx.fillRect(mugX + 13, mugY + 4, 6, 7);
      ctx.fillStyle = "#6E4A36";
      ctx.fillRect(mugX + 3, mugY + 3, 8, 2);
      if (isFocusing) {
        const steam = Math.round(Math.sin(this.frameCount * 0.1) * 2);
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.fillRect(mugX + 5 + steam, mugY - 8, 2, 5);
        ctx.fillRect(mugX + 8 - steam, mugY - 13, 2, 4);
      }

      const potX = right - 31;
      ctx.fillStyle = "#6A4B40";
      ctx.fillRect(potX, topY - 9, 19, 12);
      ctx.fillStyle = "#D37A58";
      ctx.fillRect(potX + 3, topY - 7, 13, 8);
      ctx.fillStyle = "#5E9A62";
      ctx.fillRect(potX + 5, topY - 18, 4, 12);
      ctx.fillRect(potX + 11, topY - 15, 4, 9);
      ctx.fillStyle = "#9DCB79";
      ctx.fillRect(potX + 2, topY - 13, 5, 4);
      ctx.fillRect(potX + 12, topY - 20, 5, 5);
    }

    ctx.restore();
  }

  drawRoomFurniture(ctx, cx, cy, isFocusing, sipping, isCatAboveDesk = false, isCatOnTree = false) {
    this.drawSceneFurniture(ctx, cx, cy, isFocusing, sipping, isCatAboveDesk, isCatOnTree, this.currentFurnitureScene);
  }

  drawCoStudyDesk(ctx, dx, dy, isFocusing, sipping) {
    this.drawSceneFurniture(ctx, dx, dy - 30, isFocusing, sipping, true, false, "desk");
  }

  bindStageCanvas(canvas) {
    this.stageCanvas = canvas;
    if (!this.stageCanvas) return;
    this.stageCtx = this.stageCanvas.getContext("2d");
    if (this.stageCtx) this.stageCtx.imageSmoothingEnabled = false;

    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  renderLoop() {
    this.frameCount++;
    this.drawStage();
    this.animFrameId = requestAnimationFrame(this.renderLoop);
  }

  drawStage() {
    if (!this.stageCanvas || !this.stageCtx) return;
    const ctx = this.stageCtx;
    const w = this.stageCanvas.width;
    const h = this.stageCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // 背景、地毯与宠物脚底共享同一条地面基线，杜绝未登上家具时的悬浮感。
    this.drawBackground(ctx, w, h);
    const groundY = Math.round(h / 2 + 75);
    this.drawRug(ctx, w / 2, groundY);

    const isFocusing = this.state === "focusing";
    const eyeBlink = this.frameCount % 220 > 212;
    const sipping = isFocusing && (this.frameCount % 400 > 360);

    const activePet = PET_ARCHETYPES[this.equipped.petId] || PET_ARCHETYPES.cat_white;
    const catX = Math.round(w / 2);
    // 第三代帧的根节点在脚底像素后一小格；补回这一格后脚掌正好落在地毯上。
    const catY = groundY + this.getPetFootInset(activePet.id);
    const isCatAboveDesk = this.onDesk || this.isClimbing || this.petY < -12;
    const isCatOnTree = this.onCatTree || this.isClimbingCatTree;

    // 家具在角色后层，接触阴影在家具表面上层，最后才绘制角色本身。
    this.drawSceneFurniture(ctx, catX, groundY, isFocusing, sipping, isCatAboveDesk, isCatOnTree, this.currentFurnitureScene);
    this.drawPetContactShadow(ctx, catX, groundY, this.currentFurnitureScene);
    this.drawPixelCompanionFrames(ctx, catX, catY, activePet, eyeBlink);
  }

  drawBackground(ctx, w, h) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, "#FFFDF7");
    grad.addColorStop(1, "#F4EDE2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  drawRug(ctx, rx, ry) {
    ctx.save();
    // 分层织物与像素滚边，让它像一块真实落在地上的小地毯，而非悬浮椭圆。
    ctx.fillStyle = "rgba(111, 90, 74, 0.10)";
    ctx.beginPath();
    ctx.ellipse(rx + 2, ry + 4, 118, 37, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#D7C8AF";
    ctx.beginPath();
    ctx.ellipse(rx, ry, 112, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#A9977D";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "#F1E5CF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 101, 28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(163, 139, 110, 0.30)";
    for (let x = rx - 55; x <= rx + 55; x += 12) {
      ctx.fillRect(x, ry - 1, 7, 2);
    }
    ctx.restore();
  }

  /**
   * 绘制全关节矢量宠物。动作由部件位置和关节角度构成，不读取旧贴图。
   */
  drawRiggedArchetype(ctx, cx, cy, pet, eyeBlink, sipping) {
    this.updateAction();
    const now = Date.now();
    let phase = (now % 1200) / 1200;
    if (this.currentAction === "walk") phase = (now % 560) / 560;
    else if (this.currentAction === "sleep" || this.currentAction === "lie_desk") phase = (now % 2600) / 2600;
    else if (this.currentAction === "wash") phase = (now % 900) / 900;
    else if (this.currentAction === "look") phase = (now % 1800) / 1800;
    else if (this.currentAction === "roll") {
      phase = Math.min(1, Math.max(0, (now - this.actionStartTime) / Math.max(1, this.actionDuration || 2400)));
    } else if (this.currentAction === "stretch") {
      phase = this.stretchProgress || ((now % 2400) / 2400);
    } else if (this.currentAction === "jump") {
      phase = Math.min(0.99, Math.max(0, this.actionFrame / 3));
    }

    drawCompanionRig(ctx, pet.id, {
      x: cx + this.walkOffset,
      y: cy + this.petY,
      action: this.currentAction,
      phase,
      blink: eyeBlink || this.blinkEffect > 0,
      facing: this.facing,
      scale: 0.94,
      sipping,
    });
  }

  /**
   * 第三代像素逐帧渲染器。每一个姿势都是独立绘制的 PNG 帧；Canvas 只做
   * 整像素位移、左右翻转与轻微旋转，绝不对角色做呼吸压缩或动作拉伸。
   */
  getEquippedAccessoryIds() {
    if (!ACCESSORIES_ENABLED) return [];
    return ["skin", "neck", "head", "face"]
      .map(slot => this.equipped?.[slot])
      .filter(itemId => itemId && itemId !== "default" && WARDROBE_ITEMS[itemId]);
  }

  drawAnchoredPixelAccessories(ctx, targetSize, petId, action) {
    if (!ACCESSORIES_ENABLED) return [];
    const pose = ACCESSORY_ACTION_POSES[action];
    if (!pose) return [];

    const pet = PET_ARCHETYPES[petId] || PET_ARCHETYPES.cat_white;
    const shapeProfile = ACCESSORY_SHAPE_PROFILES[COMPANION_RIG_STYLES[petId]?.shape || "round"]
      || ACCESSORY_SHAPE_PROFILES.round;
    const speciesOffsetY = pet.species === "fox" ? 10 : pet.species === "wolf" ? 3 : 0;
    const drawn = [];

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const petScale = targetSize / 170;
    ctx.scale(petScale, petScale);
    ctx.translate(pose.x, pose.y + speciesOffsetY + (shapeProfile.y || 0));
    ctx.rotate(pose.rotation || 0);

    ["skin", "neck", "head", "face"].forEach((slot) => {
      const itemId = this.equipped?.[slot];
      const definition = PIXEL_ACCESSORY_ASSETS[itemId];
      if (!definition || definition.slot !== slot) return;
      const img = getPixelAccessoryImage(itemId);
      if (!img?.complete || !img.naturalWidth) return;

      const trim = getPixelAccessoryTrim(itemId, img);
      const slotAnchor = ACCESSORY_SLOT_ANCHORS[slot];
      const scale = (shapeProfile[slot] || 1) * (pose.scale || 1);
      const width = definition.width * scale;
      const height = width * (trim.height / Math.max(1, trim.width));
      const anchorX = slotAnchor.x + (definition.offsetX || 0);
      const anchorY = slotAnchor.y + (definition.offsetY || 0);
      let drawY = anchorY - (height / 2);
      if (definition.align === "bottom") drawY = anchorY - height;
      if (definition.align === "top") drawY = anchorY;

      ctx.drawImage(
        img,
        trim.x,
        trim.y,
        trim.width,
        trim.height,
        anchorX - (width / 2),
        drawY,
        width,
        height,
      );
      drawn.push(itemId);
    });

    ctx.restore();
    return drawn;
  }

  // 仅保留用于旧存档代码兼容；第五代渲染器不再调用这些固定几何图形。
  drawEquippedAccessories(ctx, targetSize, petId) {
    const equippedIds = this.getEquippedAccessoryIds();
    if (!equippedIds.length) return equippedIds;

    const species = PET_ARCHETYPES[petId]?.species || "cat";
    const action = this.currentAction || "idle";
    const pose = {
      walk: { x: 0, y: 2, r: -0.02 },
      jump: { x: 0, y: -2, r: -0.05 },
      pounce: { x: 0, y: 3, r: 0.04 },
      land: { x: 0, y: 6, r: 0 },
      roll: { x: 1, y: 8, r: 0.13 },
      sleep: { x: 0, y: 7, r: 0 },
      stretch: { x: 0, y: 4, r: -0.04 },
      lie_desk: { x: 0, y: 6, r: 0 },
    }[action] || { x: 0, y: 0, r: 0 };
    const speciesY = species === "fox" ? 9 : species === "wolf" ? 3 : 0;
    const outline = "#3f3438";
    const fillStroke = (fill, width = 2.4) => {
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    const ellipse = (x, y, rx, ry, fill, rotation = 0) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
      fillStroke(fill);
    };
    const polygon = (points, fill) => {
      ctx.beginPath();
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.closePath();
      fillStroke(fill);
    };
    const line = (points, color, width = 2) => {
      ctx.beginPath();
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    ctx.save();
    const scale = targetSize / 170;
    ctx.scale(scale, scale);
    ctx.translate(pose.x, pose.y + speciesY);
    ctx.rotate(pose.r);

    const skin = this.equipped?.skin;
    if (skin === "skin_barista") {
      polygon([[-34, -49], [34, -49], [28, -5], [-28, -5]], "#785344");
      ctx.fillStyle = "#f2d8b3"; ctx.fillRect(-19, -26, 38, 16);
      line([[-10, -18], [10, -18]], "#9d6d50", 1.5);
    } else if (skin === "skin_detective") {
      polygon([[-34, -48], [34, -48], [29, -4], [-29, -4]], "#b18b61");
      line([[0, -47], [0, -5]], "#6b5141", 2);
      ellipse(-10, -28, 2.2, 2.2, "#5c4639"); ellipse(10, -28, 2.2, 2.2, "#5c4639");
    } else if (skin === "skin_pajamas") {
      polygon([[-35, -48], [35, -48], [29, -4], [-29, -4]], "#334475");
      [[-19,-34],[12,-40],[21,-18],[-7,-15]].forEach(([x,y]) => {
        ctx.fillStyle = "#f8d77a"; ctx.fillRect(x, y, 3, 3);
      });
      line([[0, -47], [0, -5]], "#e9e2cf", 2);
    }

    const neck = this.equipped?.neck;
    if (neck === "red_scarf") {
      ellipse(0, -52, 34, 8, "#c94e4e");
      polygon([[13,-50],[31,-36],[23,-13],[7,-42]], "#d95a55");
      line([[15,-36],[25,-30]], "#f4a09b", 2);
    } else if (neck === "plaid_bowtie") {
      polygon([[-4,-49],[-24,-60],[-25,-42],[-4,-47]], "#a85b4f");
      polygon([[4,-49],[24,-60],[25,-42],[4,-47]], "#a85b4f");
      ellipse(0, -49, 6, 6, "#e2b07b");
      line([[-18,-55],[-11,-44]], "#efd6b5", 1.4); line([[11,-55],[18,-44]], "#efd6b5", 1.4);
    } else if (neck === "bell_ribbon") {
      ellipse(0, -53, 33, 5, "#da6f78");
      ellipse(0, -44, 7, 7, "#e5b642");
      ctx.fillStyle = outline; ctx.fillRect(-1.5, -41, 3, 4);
    } else if (neck === "detective_cape") {
      polygon([[-37,-50],[37,-50],[44,-13],[0,-24],[-44,-13]], "#987655");
      line([[-31,-44],[31,-44]], "#59463c", 2);
      line([[-22,-47],[-18,-22],[0,-46],[5,-23],[23,-47],[27,-18]], "#d4bb91", 1.4);
    }

    const headY = -118;
    const head = this.equipped?.head;
    if (head === "straw_hat") {
      ellipse(0, headY + 5, 48, 9, "#e7c979");
      polygon([[-29,headY+2],[-22,headY-20],[20,headY-20],[30,headY+2]], "#efd584");
      line([[-27,headY-2],[27,headY-2]], "#5fa991", 5);
    } else if (head === "beret") {
      ellipse(-4, headY - 3, 34, 18, "#9e4352", -0.12);
      line([[-5,headY-21],[-1,headY-27]], "#66313b", 3);
    } else if (head === "scholar_cap") {
      polygon([[-42,headY-9],[0,headY-27],[42,headY-9],[0,headY+7]], "#31394f");
      ctx.fillStyle = "#31394f"; ctx.fillRect(-27, headY - 8, 54, 16);
      line([[29,headY-10],[35,headY+11]], "#e9be4b", 2.4);
      ellipse(35, headY + 14, 3.5, 5, "#e9be4b");
    } else if (head === "bear_beanie") {
      ellipse(-22, headY - 12, 11, 11, "#bb8a61"); ellipse(22, headY - 12, 11, 11, "#bb8a61");
      ellipse(0, headY + 1, 34, 24, "#c99b70");
      line([[-30,headY+11],[30,headY+11]], "#f0cfad", 5);
    } else if (head === "detective_hat") {
      ellipse(0, headY + 4, 43, 10, "#947450");
      polygon([[-29,headY+1],[-20,headY-20],[0,headY-11],[20,headY-20],[29,headY+1]], "#ad8b62");
      line([[-21,headY-10],[23,headY-1]], "#5d4939", 2);
    }

    const faceY = -81;
    const face = this.equipped?.face;
    if (face === "round_glasses") {
      ellipse(-18, faceY, 13, 12, "rgba(255,255,255,0.18)");
      ellipse(18, faceY, 13, 12, "rgba(255,255,255,0.18)");
      line([[-5,faceY],[5,faceY]], "#b68a45", 2.8);
    } else if (face === "cool_shades") {
      polygon([[-34,faceY-8],[-4,faceY-6],[-8,faceY+9],[-29,faceY+7]], "#29313e");
      polygon([[4,faceY-6],[34,faceY-8],[29,faceY+7],[8,faceY+9]], "#29313e");
      line([[-4,faceY-4],[4,faceY-4]], "#29313e", 3);
      line([[-27,faceY-2],[-13,faceY-4]], "#7bbbd0", 2);
    } else if (face === "blush_flower") {
      [-31, 31].forEach(x => {
        for (let i = 0; i < 5; i++) {
          const a = (Math.PI * 2 * i) / 5;
          ellipse(x + Math.cos(a) * 4, faceY + 10 + Math.sin(a) * 4, 3, 2.3, "#ef8fa5", a);
        }
        ellipse(x, faceY + 10, 2.4, 2.4, "#f6cf65");
      });
    }

    ctx.restore();
    return equippedIds;
  }

  drawPixelCompanionFrames(ctx, cx, cy, pet, eyeBlink) {
    this.updateAction();

    let action = this.currentAction || "idle";
    let frame = this.actionFrame || 0;
    if (this.isGroundJumping || this.isClimbing || this.isJumpingDown || this.isClimbingCatTree || this.isJumpingDownTree) {
      if (action === "pounce") {
        frame = Math.min(3, frame);
      } else if (action === "land") {
        frame = 0;
      } else {
        action = "jump";
        frame = Math.min(2, frame);
      }
    } else if ((action === "idle" || action === "focusing") && (eyeBlink || this.blinkEffect > 0)) {
      frame = 1;
    }

    let img = null;
    const now = Date.now();
    if (this.visualTransition) {
      const elapsed = now - this.visualTransition.startTime;
      if (elapsed < this.visualTransition.duration) {
        const sequence = this.visualTransition.frameSequence;
        const count = sequence?.length || FAWN_TRANSITION_COUNTS[this.visualTransition.clip] || PIXEL_V4_TRANSITION_FRAME_COUNTS[this.visualTransition.clip] || 1;
        const index = Math.min(count - 1, Math.floor((elapsed / this.visualTransition.duration) * count));
        const transitionFrame = sequence ? sequence[index] : index;
        img = getPetTransitionFrameImage(pet.id, this.visualTransition.clip, transitionFrame);
      } else {
        this.visualTransition = null;
      }
    }
    if (!img && Object.hasOwn(PIXEL_V4_TRANSITION_FRAME_COUNTS, action) && ["pounce", "jump", "land"].includes(action)) {
      img = getPetTransitionFrameImage(pet.id, action, frame);
    }
    if (!img) img = getPetActionFrameImage(pet.id, action, frame);
    if (!img || !img.complete || img.naturalWidth === 0) {
      const previous = this.lastReadyPetFrame;
      if (previous?.petId === pet.id) img = previous.img;
      else img = getPetActionFrameImage(pet.id, "idle", 0);
      if (!img?.complete || !img.naturalWidth) return false;
    }
    this.lastReadyPetFrame = { petId: pet.id, img };

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(
      Math.round(cx + this.walkOffset),
      Math.round(cy + this.petY),
    );

    if (this.isDangling && pet.id !== "dog_french_fawn") {
      ctx.rotate(Math.sin(this.frameCount * 0.1) * 0.06);
    } else if (this.tiltEffect > 0) {
      ctx.rotate((this.facing >= 0 ? 1 : -1) * 0.10);
    } else if (this.shakeEffect > 0) {
      ctx.rotate(Math.sin(this.shakeEffect * 1.5) * 0.08);
    }

    ctx.scale(this.facing >= 0 ? 1 : -1, 1);
    const targetSize = 170 * this.getPetGrowthInfo(pet.id).scale;
    ctx.drawImage(
      img,
      -targetSize / 2,
      -targetSize * (232 / 256),
      targetSize,
      targetSize,
    );
    this.drawAnchoredPixelAccessories(ctx, targetSize, pet.id, action);
    ctx.restore();
    return true;
  }

  /**
   * 绘制原版高清透明 Sprite 图像及多动作定格帧与物理表现
   */
  drawPixelArchetype(ctx, cx, cy, pet, eyeBlink, sipping) {
    // 兼容旧调用名，但统一进入第三代像素逐帧渲染器。
    return this.drawPixelCompanionFrames(ctx, cx, cy, pet, eyeBlink);
    /* c8 ignore start -- legacy renderer kept only for save-data compatibility */
    this.updateAction();
    // 帧动画已经提供了完整姿势。禁止再用 canvas 拉伸、压扁或旋转
    // 去“补动作”，否则会重新变成用户看到的贴图橡皮筋效果。
    const usesPoseFrames = !["idle", "focusing"].includes(this.currentAction);

    // 平滑转体插值 (Smooth Turning Interpolation)
    if (this.renderFacingScale === undefined) this.renderFacingScale = this.facing || 1;
    this.renderFacingScale += (this.facing - this.renderFacingScale) * 0.28;

    // 优先尝试获取当前动作对应的定格帧图像 (跳跃蓄力与缓冲使用真实 jump / land 帧)
    let img = null;
    if (this.isClimbing || this.isJumpingDown || this.isClimbingCatTree || this.isJumpingDownTree) {
      if (this.currentAction === "pounce") {
        img = getPetActionFrameImage(pet.id, "jump", 0); // 蓄力下压姿态
      } else if (this.currentAction === "land") {
        img = getPetActionFrameImage(pet.id, "land", 0); // 落地肉垫缓冲姿态
      } else {
        img = getPetActionFrameImage(pet.id, "jump", this.actionFrame); // 腾跃姿态
      }
    } else if (this.currentAction !== "idle" && this.currentAction !== "focusing") {
      img = getPetActionFrameImage(pet.id, this.currentAction, this.actionFrame);
    } else {
      img = getPetActionFrameImage(pet.id, "idle", 0);
    }
    // 已重设计角色在资源加载期间保持透明，不再闪回旧像素立绘。
    if (!img || !img.complete || img.naturalWidth === 0) {
      img = REDESIGNED_COMPANIONS.has(pet.id)
        ? getPetActionFrameImage(pet.id, "idle", 0)
        : getPetSpriteImage(pet.id);
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.save();
    ctx.imageSmoothingEnabled = Boolean(img.__lumpaSmooth);

    // 60FPS 丝滑猫式伸懒腰 (Organic Cat Stretch Matrix Deformations)
    let stretchScaleX = 1;
    let stretchScaleY = 1;
    let stretchY = 0;
    let stretchTilt = 0;

    if (this.isStretching && !usesPoseFrames) {
      const p = this.stretchProgress;
      if (p < 0.45) {
        // 阶段 1: 前爪前伸，下巴贴地，后腰翘起 (Downward Dog Cat Stretch)
        const t = p / 0.45;
        const ease = Math.sin(t * Math.PI * 0.5);
        stretchY = ease * 10;
        stretchScaleX = 1 + ease * 0.22;
        stretchScaleY = 1 - ease * 0.18;
        stretchTilt = this.facing * ease * 0.12;
      } else if (p < 0.80) {
        // 阶段 2: 脊椎高高拱起如小圆穹顶 (Spine Arch Dome)
        const t = (p - 0.45) / 0.35;
        const ease = Math.sin(t * Math.PI);
        stretchY = -ease * 14;
        stretchScaleY = 1 + ease * 0.25;
        stretchScaleX = 1 - ease * 0.14;
      } else {
        // 阶段 3: 抖动毛皮放松身体 (Coat Shake & Relax)
        const t = (p - 0.80) / 0.20;
        const shake = Math.sin(t * 8 * Math.PI) * (1 - t) * 0.08;
        stretchTilt = shake;
      }
    }

    // 趴桌子姿态：身姿下沉扁平化、下巴贴桌闭目享受
    if (this.currentAction === "lie_desk" && !usesPoseFrames) {
      stretchScaleX *= 1.22;
      stretchScaleY *= 0.72;
      stretchY += 16;
    }

    // 走路四足迈步起伏节奏与微晃步伐物理 (Walking Step Bobbing & Cadence)
    const isMoving = (this.currentAction === "walk");
    const walkBob = !usesPoseFrames && isMoving ? (this.actionFrame % 2 === 0 ? -2 : 1) : 0;
    const walkTilt = !usesPoseFrames && isMoving ? (this.actionFrame % 2 === 0 ? this.facing * 0.03 : -this.facing * 0.015) : 0;

    // 自主巡游真实位移叠加 + 爬桌/下桌垂直位移 + 伸懒腰形变垂直位移 - 走路起伏
    ctx.translate(cx + this.walkOffset, cy + this.petY + stretchY - walkBob);

    // 步伐微晃倾斜
    if (walkTilt !== 0) {
      ctx.rotate(walkTilt);
    }

    // 伸懒腰躯干倾斜
    if (stretchTilt !== 0) {
      ctx.rotate(stretchTilt);
    }

    // 鼠标拎起时的钟摆摆动物理效果 (Dangle Pendulum Physics)
    if (this.isDangling) {
      const sway = Math.sin(this.frameCount * 0.1) * 0.08;
      ctx.rotate(sway);
    }

    // 专属微动作形变 (歪头与甩头)
    if (this.tiltEffect > 0) {
      ctx.rotate(this.facing * 0.18);
    }
    if (this.shakeEffect > 0) {
      ctx.rotate(Math.sin(this.shakeEffect * 1.5) * 0.15);
    }

    // 面朝方向平滑转体插值 (向左看/向右看具备透视翻转动画)
    ctx.scale(this.renderFacingScale, 1);

    // 呼吸形变 (Squash & Stretch)
    const breathSpeed = this.currentAction === "sleep" ? 0.03 : 0.06;
    let breathScaleY = usesPoseFrames ? 1 : 1 + (Math.sin(this.frameCount * breathSpeed) * 0.025);
    let breathScaleX = usesPoseFrames ? 1 : 1 - (Math.sin(this.frameCount * breathSpeed) * 0.015);

    // 落地受冲击缓冲形变
    if (this.landingProgress > 0 && !usesPoseFrames) {
      breathScaleY -= this.landingProgress * 0.16;
      breathScaleX += this.landingProgress * 0.16;
    }

    ctx.scale(breathScaleX * stretchScaleX, breathScaleY * stretchScaleY);

    // 接触地平面基准线完美归一化：消除任何上下跳动与怪异抽搐
    const targetSize = 135;
    const drawX = -targetSize * 0.5;
    const drawY = -targetSize * (236 / 256);

    ctx.drawImage(img, drawX, drawY, targetSize, targetSize);

    // 眨眼覆层 (在原图眼部面部正确定位)
    const isBlinking = eyeBlink || this.blinkEffect > 0;
    if ((this.currentAction === "idle" || this.currentAction === "focusing") && isBlinking) {
      ctx.fillStyle = "rgba(40, 35, 30, 0.85)";
      const eyeH = 3.5;
      const eyeW = 9;
      const eyeY = -73;
      ctx.fillRect(-12, eyeY, eyeW, eyeH);
      ctx.fillRect(8, eyeY, eyeW, eyeH);
    }

    ctx.restore();
    /* c8 ignore stop */
  }

  drawCoStudyDesk(ctx, dx, dy, isFocusing, sipping) {
    this.drawRoomFurniture(ctx, dx, dy - 30, isFocusing, sipping, true, false);
  }
}

if (typeof window !== "undefined") {
  window.FocusEngine = FocusEngine;
  window.CatAudioSynthesizer = CatAudioSynthesizer;
  window.FocusConstants = {
    PET_ARCHETYPES,
    PIXEL_COMPANION_IDS,
    PIXEL_V3_FRAME_COUNTS,
    PIXEL_V4_TRANSITION_FRAME_COUNTS,
    ACCESSORIES_ENABLED,
    PIXEL_ACCESSORY_ASSETS,
    ACCESSORY_ACTION_POSES,
    WARDROBE_ITEMS,
    GIFT_REGISTRY,
    UNLOCK_RECIPES,
    TRASH_REGISTRY
  };
}
