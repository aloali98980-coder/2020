import { ensureClubEmpire } from "./state.js";

export function detectOwnershipConflicts(s) {
  const empire = ensureClubEmpire(s), clubs = empire.ownedClubs;
  const out = [];
  for (let i=0;i<clubs.length;i++) for(let j=i+1;j<clubs.length;j++) {
    const a=clubs[i],b=clubs[j];
    if ((a.competition && a.competition===b.competition) || (!a.competition && !b.competition)) out.push({type:"same-competition",clubs:[a.clubId,b.clubId],severity:65});
    if (a.city && a.city===b.city) out.push({type:"family-derby",clubs:[a.clubId,b.clubId],severity:85});
  }
  if (clubs.length>1 && s.politics?.presidency?.inOffice) out.push({type:"federation-control",clubs:clubs.map(x=>x.clubId),severity:100});
  if (clubs.some(x=>x.budget>(s.finance?.cash||0))) out.push({type:"original-fan-jealousy",clubs:[s.clubId],severity:55});
  empire.conflicts = [...empire.conflicts.filter(x=>x.type==="fan-revolt"),...out]; return out;
}
export function saleQuote(s, clubId, { percentage=100, beautify=false, publicOffering=false }={}) {
  const club=ensureClubEmpire(s).ownedClubs.find(x=>x.clubId===clubId); if(!club) throw Error("Club not owned");
  percentage=Math.max(1,Math.min(100,Number(percentage)||100));
  const gross=Math.round(club.value*percentage/100*(beautify?1.12:1));
  const tax=Math.round(gross*0.12),commission=Math.round(gross*(publicOffering?0.035:0.025));
  return {clubId,percentage,gross,tax,commission,net:gross-tax-commission,beautify,publicOffering,insiderRisk:beautify||publicOffering};
}
export function sellClub(s,clubId,options={}) { const empire=ensureClubEmpire(s),q=saleQuote(s,clubId,options),club=empire.ownedClubs.find(x=>x.clubId===clubId); s.empire.personal+=q.net; club.ownership-=q.percentage; club.control=club.ownership>=49 && options.retainControl!==false; if(club.ownership<=0) empire.ownedClubs=empire.ownedClubs.filter(x=>x!==club); empire.sales.push({...q,date:s.date,buyer:options.buyer||"ai-bidder"}); return q; }
export function portfolioValue(s){const e=ensureClubEmpire(s);const clubs=e.ownedClubs.reduce((n,c)=>n+c.value*c.ownership/100,0);const shares=(s.stockMarket?.portfolio?.positions||[]).reduce((n,p)=>{const l=s.stockMarket.listings.find(x=>x.id===p.listingId);return n+(l?.price||0)*p.shares;},0);return Math.round(clubs+shares);}
export function createHoldingCompany(s,name){const e=ensureClubEmpire(s);e.holding={name:String(name).trim().slice(0,60),createdOn:s.date,clubIds:e.ownedClubs.map(x=>x.clubId),heirId:s.dynasty?.heir?.id||s.empire?.family?.heirId||null};return e.holding;}
export function inheritPortfolio(s,heirId){const e=ensureClubEmpire(s);e.holding??={name:"Club Empire Holding",clubIds:e.ownedClubs.map(x=>x.clubId)};e.holding.heirId=heirId;e.ownedClubs.forEach(c=>c.inheritedBy=heirId);return e.ownedClubs;}
