const ASSET_VARIABLES = {
  '--asset-dawn-village': 'assets/art/dawn-village.png',
  '--asset-sprite-atlas': 'assets/art/sprite-atlas.png',
  '--asset-app-icon-master': 'assets/art/app-icon-master.png',
  '--asset-vanadis-village-hero': 'assets/art/vanadis-village-hero.webp',
  '--asset-vanadis-market-bulletin': 'assets/art/vanadis-market-bulletin.webp',
  '--asset-vanadis-houses-atlas': 'assets/art/vanadis/houses/atlas.png',
  '--asset-manager-base': 'assets/art/vanadis/character/manager-base.png',
  '--asset-manager-fullbody': 'assets/art/vanadis/character/manager-fullbody.png',
  '--asset-wardrobe-ledger-bg': 'assets/art/vanadis/wardrobe/equipment-ledger-bg.jpg',
} as const;

export function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.replace(/^\/+/, '')}`;
}

export function configureAssetCssVariables(root: HTMLElement = document.documentElement) {
  for (const [name, path] of Object.entries(ASSET_VARIABLES)) {
    root.style.setProperty(name, `url("${assetUrl(path)}")`);
  }
}
