import rows from './world/players.json' with {type:'json'};
import clubs from './world/clubs.json' with {type:'json'};
import manifest from './world/manifest.json' with {type:'json'};
import {marketBy} from '../worldMarkets.js';
import {STAR_PROFILES} from '../starProfiles.js';
import {estimateAbility,modelPosition,seedUnit} from '../../models/ability.js';
export const WORLD_MANIFEST=manifest;
export const WORLD_CLUBS=clubs;
const clubIndex=new Map(clubs.map(c=>[c.id,c]));
const LEGACY={'Al Ahly SC':'ahly','Zamalek SC':'zamalek','Al Masry SC':'masry','Al Ittihad Alexandria Club':'ittihad','Al Ittihad Alexandria SC':'ittihad','Pyramids FC':'pyramids','ENPPI SC':'enppi','Ceramica Cleopatra FC':'ceramica','Ismaily SC':'ismaily','Manchester City F.C.':'city','Al Nassr FC':'nassr'};
export const gameClubId=c=>LEGACY[c?.wiki]||c?.id;
export function worldCoverage(){return [...new Set(rows.map(p=>p.league))].map(id=>({id,players:rows.filter(p=>p.league===id).length,clubs:clubs.filter(c=>c.league===id).length,withPlayers:clubs.filter(c=>c.league===id&&c.importedCount>0).length}));}
// Seeded, explicit simulation age for rows without a published birthday (still flagged ageEstimated).
// Bates(3) bell curve: mean 25.5, sd ≈4, clamped to 18–36; goalkeepers skew ~1.5 years older.
export function estimatedAge(row){const u=(seedUnit(row.id,'age1')+seedUnit(row.id,'age2')+seedUnit(row.id,'age3'))/3;const a=25.5+(u-.5)*24+(row.positionGroup==='GK'?1.5:0);return Math.max(18,Math.min(36,Math.round(a)));}
const STAR_DENSITY=(()=>{const t={},s={};for(const r of rows){t[r.league]=(t[r.league]||0)+1;if(STAR_PROFILES[r.wiki])s[r.league]=(s[r.league]||0)+1;}return Object.fromEntries(Object.keys(t).map(l=>[l,(s[l]||0)/t[l]]));})();
export const starDensity=league=>STAR_DENSITY[league]||0;
// 0.20: per-player provenance (source page, birthday source, licence, estimated-field list) is no
// longer copied onto every saved player object — it is looked up here by pack id when displayed.
// That removes ~460 bytes × 23,000 players from every save without losing any attribution.
export const WORLD_START='2026-09-24';
export const WORLD_ESTIMATED_FIELDS=Object.freeze(['rating','attributes','potential','salary','value','contract','foot','position-detail','professionalism','naturalFitness']);
let PROVENANCE=null;
export function worldProvenance(id){
 if(!PROVENANCE){PROVENANCE=new Map();for(const row of rows){const club=clubIndex.get(row.clubId);PROVENANCE.set(row.id,{sourceUrl:row.sourceUrl||club?.sourceUrl||null,biographyUrl:row.biographyUrl||null,sourceSeasonText:club?.sourceDateText||'',birthDate:!!row.birthDate});}}
 return PROVENANCE.get(id)||null;
}
export function worldPlayers(leagues){const enabled=new Set(leagues);return rows.filter(row=>enabled.has(row.league)).map(row=>{
 const club=clubIndex.get(row.clubId),star=STAR_PROFILES[row.wiki]||null;
 const start='2026-09-24';let age=estimatedAge(row);if(row.birthDate){const d=new Date(row.birthDate+'T12:00:00Z');age=2026-d.getUTCFullYear()-((9<(d.getUTCMonth()+1))||(9===(d.getUTCMonth()+1)&&24<d.getUTCDate())?1:0);}
 const position=star?.position||modelPosition(row.positionGroup,row.id);
 const ability=estimateAbility({key:row.id,age,position,level:marketBy(row.league)?.level||64,star,starDensity:STAR_DENSITY[row.league]||0});
 const salary=Math.round((ability.rating-30)**2*(row.league==='eg'?80:row.league==='sa'?150:170)/1000)*1000;
 return {id:row.id,name:star?.nameAr||row.nameAr||row.name,nameLatin:row.name,clubId:gameClubId(club),clubName:club?.name||'',league:row.league,position,age,ageReference:age,ageReferenceDate:start,birthDate:row.birthDate,ageEstimated:!row.birthDate,...ability,foot:seedUnit(row.id,'foot')<.22?'يسرى':'يمنى',nationality:row.nationality||'غير موثقة',value:Math.round((ability.rating-30)**2*22000*Math.max(.2,1-Math.max(0,age-28)*.075)/10000)*10000,salary,morale:80,fitness:95,contractEnd:'2028-06-30',role:'مداورة',attributes:ability.attributes,appearances:0,goals:0,fictional:false,status:'active',careerInterest:Math.floor(seedUnit(row.id,'career')*100),careerHistory:[],lastAgingMonth:null,injuryUntil:null};
 });}

// 0.19: Arabic display name -> published Latin name, for presentation-layer translation (EN/FR).
let NAME_MAP=null;
export function worldNameMap(){if(NAME_MAP)return NAME_MAP;NAME_MAP=new Map();for(const r of rows){if(!r.name)continue;const star=STAR_PROFILES[r.wiki];if(star?.nameAr)NAME_MAP.set(star.nameAr,r.name);if(r.nameAr&&r.nameAr!==r.name)NAME_MAP.set(r.nameAr,r.name);}for(const c of clubs){if(c.nameAr&&c.name&&c.nameAr!==c.name)NAME_MAP.set(c.nameAr,c.name);}return NAME_MAP;}
