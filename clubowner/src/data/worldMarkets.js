import rows from './worldMarkets.json' with {type:'json'};
export const MARKETS=rows.map(([id,nameAr,name,wiki,discoveryCode,level])=>({id,nameAr,name,wiki,level}));
export const marketBy=id=>MARKETS.find(m=>m.id===id);
export const ALL_MARKETS=MARKETS.map(m=>m.id);
