Quake2.Entities.Static = function (models, descriptor) {
  const position = {
    x: descriptor.origin[0],
    y: descriptor.origin[1],
    z: descriptor.origin[2],
  };
  const angle = descriptor.angle || 0;
  this._model = models.spawn(
      Quake2.Entities.Static._MODEL_MAP[descriptor.classname], position, angle);
  this._model.setSkin(Quake2.Entities.Static._SKIN_MAP[descriptor.classname]);
  this._model.play(Quake2.Entities.Static._ANIMATION_MAP[descriptor.classname]);
};

Quake2.Entities.Static._MODEL_MAP = {
  'ammo_bullets': 'items/ammo/bullets/medium',
  'ammo_cells': 'items/ammo/cells/medium',
  'ammo_grenades': 'items/ammo/grenades/medium',
  'ammo_rockets': 'items/ammo/rockets/medium',
  'ammo_shells': 'items/ammo/shells/medium',
  'ammo_slugs': 'items/ammo/slugs/medium',
  'item_adrenaline': 'items/adrenal',
  'item_armor_combat': 'items/armor/combat',
  'item_armor_jacket': 'items/armor/jacket',
  'item_armor_shard': 'items/armor/shard',
  'item_breather': 'items/breather',
  'item_enviro': 'items/enviro',
  'item_health': 'items/healing/medium',
  'item_health_large': 'items/healing/large',
  'item_health_mega': 'items/mega_h',
  'item_health_small': 'items/healing/stimpack',
  'item_invulnerability': 'items/invulner',
  'item_pack': 'items/pack',
  'item_quad': 'items/quaddama',
  'item_silencer': 'items/silencer',
  'misc_banner': 'objects/banner',
  'misc_gib_head': 'objects/gibs/head',
  'weapon_bfg': 'weapons/g_bfg',
  'weapon_chaingun': 'weapons/g_chain',
  'weapon_grenadelauncher': 'weapons/g_launch',
  'weapon_hyperblaster': 'weapons/g_hyperb',
  'weapon_machinegun': 'weapons/g_machn',
  'weapon_railgun': 'weapons/g_rail',
  'weapon_rocketlauncher': 'weapons/g_rocket',
  'weapon_shotgun': 'weapons/g_shotg',
  'weapon_supershotgun': 'weapons/g_shotg2',
};

Quake2.Entities.Static._SKIN_MAP = {
  'ammo_bullets': 'models/items/ammo/bullets/medium/skin',
  'ammo_cells': 'models/items/ammo/cells/medium/skin',
  'ammo_grenades': 'models/items/ammo/grenades/medium/skin',
  'ammo_rockets': 'models/items/ammo/rockets/medium/skin',
  'ammo_shells': 'models/items/ammo/shells/medium/skin',
  'ammo_slugs': 'models/items/ammo/slugs/medium/skin',
  'item_adrenaline': 'models/items/adrenal/skin',
  'item_armor_combat': 'models/items/armor/combat/skin',
  'item_armor_jacket': 'models/items/armor/jacket/skin',
  'item_armor_shard': 'models/items/armor/shard/skin',
  'item_breather': 'models/items/breather/skin',
  'item_enviro': 'models/items/enviro/skin',
  'item_health': 'models/items/healing/medium/skin',
  'item_health_large': 'models/items/healing/large/skin',
  'item_health_mega': 'models/items/mega_h/skin',
  'item_health_small': 'models/items/healing/stimpack/skin',
  'item_invulnerability': 'models/items/invulner/skin',
  'item_pack': 'models/items/pack/skin',
  'item_quad': 'models/items/quaddama/skin',
  'item_silencer': 'models/items/silencer/skin',
  'misc_banner': 'models/objects/banner/skin',
  'misc_gib_head': 'models/objects/gibs/head/skin',
  'weapon_bfg': 'models/weapons/g_bfg/skin',
  'weapon_chaingun': 'models/weapons/g_chain/skin',
  'weapon_grenadelauncher': 'models/weapons/g_launch/skin',
  'weapon_hyperblaster': 'models/weapons/g_hyperb/skin',
  'weapon_machinegun': 'models/weapons/g_machn/skin',
  'weapon_railgun': 'models/weapons/g_rail/skin',
  'weapon_rocketlauncher': 'models/weapons/g_rocket/skin',
  'weapon_shotgun': 'models/weapons/g_shotg/skin',
  'weapon_supershotgun': 'models/weapons/g_shotg2/skin',
};

Quake2.Entities.Static._ANIMATION_MAP = {
  'ammo_bullets': 'bullets',
  'ammo_cells': 'cells',
  'ammo_grenades': 'grenade',
  'ammo_rockets': 'rockets',
  'ammo_shells': 'shells',
  'ammo_slugs': 'slugs',
  'item_adrenaline': 'adrenal',
  'item_armor_combat': 'combat',
  'item_armor_jacket': 'armor',
  'item_armor_shard': 'shard',
  'item_breather': 'breather',
  'item_enviro': 'enviro',
  'item_health': 'medium',
  'item_health_large': 'large',
  'item_health_mega': 'mega',
  'item_health_small': 'stimpack',
  'item_invulnerability': 'invulner',
  'item_pack': 'pack',
  'item_quad': 'quaddama',
  'item_silencer': 'silencer',
  'misc_banner': 'frame',
  'misc_gib_head': 'head',
  'weapon_bfg': 'g_bfg',
  'weapon_chaingun': 'g_chain',
  'weapon_grenadelauncher': 'g_launch',
  'weapon_hyperblaster': 'g_hyperb',
  'weapon_machinegun': 'g_machn',
  'weapon_railgun': 'g_rail',
  'weapon_rocketlauncher': 'g_rocket',
  'weapon_shotgun': 'g_shotd',
  'weapon_supershotgun': 'g_shotg',
};

// TODO: this way we load all of them, always. Find a better way.
Quake2.Entities.Static.MODELS = [
  'items/ammo/bullets/medium',
  'items/ammo/cells/medium',
  'items/ammo/grenades/medium',
  'items/ammo/rockets/medium',
  'items/ammo/shells/medium',
  'items/ammo/slugs/medium',
  'items/adrenal',
  'items/armor/combat',
  'items/armor/jacket',
  'items/armor/shard',
  'items/breather',
  'items/enviro',
  'items/healing/medium',
  'items/healing/large',
  'items/mega_h',
  'items/healing/stimpack',
  'items/invulner',
  'items/pack',
  'items/quaddama',
  'items/silencer',
  'objects/banner',
  'objects/gibs/head',
  'weapons/g_bfg',
  'weapons/g_chain',
  'weapons/g_launch',
  'weapons/g_hyperb',
  'weapons/g_machn',
  'weapons/g_rail',
  'weapons/g_rocket',
  'weapons/g_shotg',
  'weapons/g_shotg2',
];

Quake2.Entities.Static.prototype.tick = function () {};

Quake2.Entities.dictionary['ammo_bullets'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['ammo_cells'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['ammo_grenades'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['ammo_rockets'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['ammo_shells'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['ammo_slugs'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_adrenaline'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_armor_combat'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_armor_jacket'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_armor_shard'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_breather'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_enviro'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_health'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_health_large'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_health_mega'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_health_small'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_invulnerability'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_pack'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_quad'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['item_silencer'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['misc_banner'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['misc_gib_head'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_bfg'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_chaingun'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_grenadelauncher'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_hyperblaster'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_machinegun'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_railgun'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_rocketlauncher'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_shotgun'] = Quake2.Entities.Static;
Quake2.Entities.dictionary['weapon_supershotgun'] = Quake2.Entities.Static;
