// Independent, deterministic game estimates. No scraped/proprietary ratings.
const bound=(n,min=15,max=99)=>Math.max(min,Math.min(max,n));
export function hash(text){let n=2166136261;for(const c of String(text)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
export const seedUnit=(key,salt)=>hash(key+'|'+salt)/4294967296;
const SHAPES={GK:[-28,-7,-40,2,-7,8],CB:[-5,-7,-27,12,2,5],RB:[9,0,-18,5,10,0],LB:[9,0,-18,5,10,0],DM:[-3,8,-17,9,7,7],CM:[0,10,-7,0,8,7],AM:[4,13,4,-25,-1,10],LW:[13,5,8,-30,1,2],RW:[13,5,8,-30,1,2],ST:[6,-8,15,-34,1,5]};
// starDensity (0..1) = share of the player's market already covered by editorial star profiles (0.18).
// Where the well-known starters are listed explicitly, the remaining unlisted players are, by construction,
// the lesser-known ones: their seeded spread is narrowed and shifted down so squad players do not outrank stars.
export function estimateAbility({key,age,position='CM',level=65,star=null,starDensity=0}){
 const d=Math.min(1,Math.max(0,starDensity)/.3);
 const variation=(seedUnit(key,'ability')-.5)*20*(1-.2*d)-3*d;
 const agePenalty=age<24?(24-age)*1.1:age>(position==='GK'?34:30)?(age-(position==='GK'?34:30))*.65:0;
 const rating=Math.round(bound(star?.rating??level+variation-agePenalty,38,94));
 const profile=SHAPES[position]||SHAPES.CM;const keys=['pace','passing','shooting','defending','stamina','decisions'];
 const attributes=Object.fromEntries(keys.map((k,i)=>[k,Math.round(bound(rating+profile[i]+(seedUnit(key,k)-.5)*10))]));
 if(age>29){attributes.pace=Math.round(bound(attributes.pace-(age-29)*(position==='GK'?.5:1.5)));attributes.stamina=Math.round(bound(attributes.stamina-(age-29)*.8));}
 Object.assign(attributes,star?.attributes||{});
 const naturalFitness=55+Math.floor(seedUnit(key,'fitness')*40),professionalism=45+Math.floor(seedUnit(key,'professionalism')*50);
 const potential=Math.min(96,Math.max(rating,star?.potential??rating+(age<24?5+Math.floor(seedUnit(key,'potential')*14):age<28?3:0)));
 return {rating,potential,attributes,naturalFitness,professionalism,developmentRate:Math.round((.65+seedUnit(key,'development')*.7)*1000)/1000,injurySusceptibility:15+Math.floor(seedUnit(key,'injuries')*60),...(star?{abilityMethod:'editorial-estimate'}:{}),abilityVersion:1};
}
export function modelPosition(group,key){if(group==='GK')return 'GK';const roles=group==='DF'?['CB','CB','RB','LB']:group==='FW'?['ST','LW','RW']:['CM','CM','DM','AM'];return roles[hash(key)%roles.length];}
export function developmentGain(p,{coach=0,training=1,minutes=0,injured=false}={}){if(p.age>=27||p.rating>=p.potential||injured)return 0;return Math.min(p.potential-p.rating,.08*(p.developmentRate||1)*(.5+(p.professionalism??70)/100)*(1+coach/100+training/8)*(1+Math.min(minutes,5)/10));}
