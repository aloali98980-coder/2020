import "./styles/sportsCity.css";
import "./styles/stockMarket.css";
import { buildCityFacility } from "./services/cityFacilities.js";
import { startStadium, chooseOldGround, nameStadium, stadiumQuote } from "./services/sportsCity.js";
import { startIntake, chooseCandidate } from "./services/talent/academy.js";
import {
  requestMission,
  followPlayer,
  toggleShortlist,
} from "./services/talent/scouting.js";
import { setTraining } from "./services/talent/training.js";
import { setPlayerRole } from "./services/playerRoles.js";
import {
  requestLoan,
  answerLoan,
  recallLoan,
  buyLoanOption,
} from "./services/loans.js";
import { loanForm, loanReview } from "./features/management/loans.js";
import { setTactics } from "./services/tactics.js";
import { DIVISIONS } from "./data/expandedCatalog.js";
import {
  commerceView,
  managementView,
  pressView,
  competitionsView,
  coachContractModal,
} from "./features/expanded.js";
import { EXPANDED_CLUBS, extendedClub } from "./data/expandedCatalog.js";
import {
  businessOpen,
  stockShirts,
  setPrices,
  categoryPrices,
  setCategoryPrices,
  setMatchPremium,
  sellSubscriptions,
  friendly,
} from "./services/commerce.js";
import {
  appointCoach,
  dismissCoach,
  renewCoach,
  setTactic,
  toggleLineup,
  pressAnswer,
  answerBid,
  scoutPlayer,
} from "./services/clubManagement.js";
import { ALL_MARKETS } from "./data/worldMarkets.js";
import { databaseView } from "./features/database.js";
import { clubBrowserView } from "./features/clubBrowser.js";
import {
  getLanguage,
  setLanguage,
  translateDOM,
  translateText,
  tr,
} from "./i18n/index.js";
import {
  careersView,
  hireStaffForm,
  scoutTaskForm,
} from "./features/careers.js";
import {
  hireStaff,
  dismissStaff,
  trainStaff,
  scoutAssignment,
} from "./services/staff.js";
import { retirementDecision } from "./services/careers.js";
import {
  enrollDynastyAcademy,
  haveChild,
  leaveDynastyAcademy,
  marryOwner,
  divorceOwner,
  setAcademyFocus,
  setAcademyMentor,
  setAcademyPosition,
  setDynastyHeir,
  setSuccessionEligibility,
  resolveRetirementOffer,
  setUpbringing,
} from "./services/dynasty.js";
import { resolveDynastyEvent } from "./services/dynastyEvents.js";
import {
  promoteDynastyPlayer,
  reconcileSiblings,
  setCareerPath,
} from "./services/dynastyCareers.js";
import { resolveClubEvent } from "./services/clubEvents.js";
import { sourcesView } from "./features/dataSources.js";
import { guaranteedWages } from "./services/contractClauses.js";
import { registerOffline } from "./platform/offline.js";
import { installHelp } from "./platform/install.js";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/features.css";
import "./styles/responsive.css";
import "./styles/readability.css";
import "./styles/mobile.css";
import "./styles/dashboard.css";
import { applyPerformanceMode } from "./core/device.js";
import "./styles/tokens.css";
import "./styles/motion.css";
import "./styles/dynasty.css";
import "./styles/politics.css";
import "./styles/celebrations.css";
import "./styles/awards.css";
import "./styles/gifts.css";
import "./styles/ultras.css";
import "./styles/transferMarket.css";
import "./styles/playerExchange.css";
import { createGame } from "./core/game.js";
import {
  getState,
  setState,
  commit,
  isSaving,
  saveStatus,
  onSaveStatus,
  flushSave,
  hasUnsavedChanges,
  replaceState,
  discardPendingSave,
} from "./core/store.js";
import { loadGame, exportGame, importGame } from "./services/save.js";
import {
  getSession,
  isAuthenticated,
  register as authRegister,
  login as authLogin,
  logout as authLogout,
} from "./services/auth.js";
import {
  uploadSaveToCloud,
  fetchLatestCloudSave,
  downloadCloudSave,
  listCloudSaves,
  deleteCloudSave,
  compareCloudWithLocal,
} from "./services/cloud.js";

import { advanceTime } from "./services/time.js";
import { pendingActions, resolveInfo } from "./services/inbox.js";
import { matchReportModal } from "./features/matchReport.js";
import { showHighlightsScreen } from "./features/matchHighlights.js";
import { showCelebrationScreen } from "./features/celebrations.js";
import {
  celebrationSnapshot,
  markCelebrationSeen,
  pendingCelebrations,
  trackCelebrationEvents,
} from "./services/celebrations.js";
import { awardsView, showAwardCeremony } from "./features/awards.js";
import { giftsView } from "./features/gifts.js";
import { branchesView } from "./features/branches.js";
import {
  pendingCeremony,
  markCeremonySeen,
  campaignFanVote,
  resolveAwardDemand,
  resolveCoachDemand,
} from "./services/awards.js";
import { ultrasView } from "./features/ultras.js";
import {
  fulfilSupporterDemand,
  imposeUltrasStadiumSanction,
  launchChant,
  organizeAwaySupport,
  pressureRivalSupporters,
  respondToSupporterDemand,
  resolveUltrasEvent,
  stageTifo,
  recordTicketPriceChange,
} from "./services/ultras.js";
import { paletteItems, paletteOverlay } from "./features/palette.js";
import { markStep, hideOnboarding } from "./features/onboarding.js";
import {
  writeSlot,
  readSlot,
  deleteSlot,
  listSlots,
} from "./services/slots.js";
import {
  playedOwnFixtures,
  reportFor,
} from "./services/matchReport.js";
import {
  submitOffer,
  acceptClub,
  rejectNegotiation,
  signPlayer,
  renewPlayer,
} from "./services/transfers.js";
import {
  acceptSaleOffer,
  counterSaleOffer,
  rejectSaleOffer,
  requestPlayerTransfer,
  startPlayerAuction,
} from "./services/transferNegotiation.js";
import {
  completePlayerExchange,
  proposePlayerExchange,
  rejectPlayerExchange,
  suggestedExchangeCash,
} from "./services/playerExchange.js";
import { startProject, toggleFacilityStaff } from "./services/facilities.js";
import {
  offersFor,
  signSponsor,
  resolveSponsor,
  negotiateSponsor,
  answerSponsorDeal,
} from "./services/sponsors.js";
import { takeLoan, wages } from "./services/finance.js";
// 0.53 hotfix «زرار المليار»: رفع سقف الرواتب بمبلغ حر + معاينة قبل/بعد.
import { raiseWageBudget, roundWageRaise, wageRaisePreview } from "./services/wageOverride.js";
import { vaultMove, VAULT_AMOUNTS, VAULT_TAPS, VAULT_TAP_WINDOW_MS, ensureVault } from "./services/vault.js";
import { setupView } from "./features/setup.js";
import { shell, NAV_GROUPS, NAV_BY_ID, navLabel, toggleNavGroup } from "./components/shell.js";
import { dashboardView } from "./features/dashboard.js";
import { inboxView } from "./features/inbox.js";
import {
  playersView,
  playerDetail,
  offerForm,
  contractForm,
} from "./features/players.js";
import { saleAuctionView, saleNegotiationView } from "./features/transferMarket.js";
import {
  playerExchangeDealView,
  playerExchangePanel,
  playerExchangeView,
} from "./features/playerExchange.js";
import { facilitiesView, facilityDetail } from "./features/facilities.js";
import {
  sponsorsView,
  sponsorOffers,
  sponsorDetail,
  sponsorNegotiate,
  sponsorDealResult,
} from "./features/sponsors.js";
import { financeView, wageRaiseModal } from "./features/finance.js";
import { stockMarketView } from "./features/stockMarket.js";
import { boardView } from "./features/board.js";
import { staffView } from "./features/staff.js";
import {
  startNegotiation, negotiate, cancelNegotiation, fireEmployee, renewEmployee,
  promoteEmployee, raiseEmployee, respondPoach, resolveMeetingRequest,
} from "./services/staff/staffCorp.js";
import { startHqUpgrade } from "./services/staff/hq.js";
import { fileLegalCase, resolveLegalCase } from "./services/staff/legal.js";
import { setPhilosophy, setFreedom, resolveDeal } from "./services/staff/sporting.js";
import { assignScout } from "./services/staff/scouts.js";
import { setCurriculum } from "./services/staff/academy.js";
import { launchCampaign } from "./services/staff/marketing.js";
import { publishContent, derbyCampaign, resolveCrisis } from "./services/staff/social.js";
import { worldView } from "./features/world.js";
import { settingsView } from "./features/settings.js";
import { achievementsView } from "./features/achievements.js";
import { absenceBanner } from "./features/absence.js";
import { legendLogView } from "./features/legendLog.js";
import { seasonHarvestView } from "./features/seasonHarvest.js";
import { markAbsenceSeen } from "./services/absence.js";
import { setNotify } from "./services/settingsHub.js";
import { setSectionInfoHidden, showAllSectionInfo } from "./services/sectionInfo.js";
import { sectionInfoCard } from "./features/sectionInfo.js";
import {
  irreversibleWarning,
  startVacation,
  endVacation,
} from "./services/protection.js";
import {
  irreversibleModal,
  vacationReturnModal,
} from "./features/protection.js";
import { dynastyView } from "./features/dynasty.js";
import { politicsView } from "./features/politics.js";
import { POLITICAL_BLOCS } from "./data/politicsCatalog.js";
import { formAlliance, politicalClub } from "./services/politics/state.js";
import {
  visitClub,
  holdConference,
  makeCampaignPromise,
  fundCampaign,
  debate as politicalDebate,
  offerCandidateAlliance,
  triggerElectionCampaign,
} from "./services/politics/campaign.js";
import {
  donateToClub,
  donationAvailable,
  donationPreview,
} from "./services/politics/donations.js";
import {
  bargainBill,
  proposeBill,
  resolveBill,
} from "./services/politics/council.js";
import {
  createSupportFund,
  grantFromSupportFund,
  runFinancialAudit,
} from "./services/politics/associationFinance.js";
import {
  appointCommitteeChair,
  resolveDisciplineCase,
  setCommitteePolicy,
} from "./services/politics/committees.js";
import {
  createAssociationTournament,
  playAssociationTournamentRound,
} from "./services/politics/competitions.js";
import {
  addressOpposition,
  holdConfidenceVote,
} from "./services/politics/opposition.js";
import {
  conductIntegrityAudit,
  openIntegrityInvestigation,
  resolveIntegrityInvestigation,
  submitAssetDeclaration,
} from "./services/politics/integrity.js";
import {
  holdDiplomaticMission,
  secureExecutiveSeat,
  submitHostingBid,
} from "./services/politics/foreign.js";
import {
  resignOffice,
  resolveLegacyTrial,
} from "./services/politics/legacy.js";
import { resolvePoliticalEvent } from "./services/politics/events.js";
import {
  legendsView,
  legendDetailModal,
  legendReleaseModal,
  legendRenewModal,
  DEFAULT_LEGEND_FILTERS,
} from "./features/legends.js";
import {
  signLegend,
  releaseLegend,
  renewLegend,
  setLegendPlayerMode,
} from "./services/legends.js";
import {
  openModal,
  closeModal,
  toast,
  showError,
  bindModalKeyboard,
} from "./ui/modal.js";
import { icon } from "./components/icons.js";
import { badge, button, infoNote } from "./components/shared.js";
import { money, num, esc, date, setDisplayCurrency, cur } from "./ui/format.js";
import { ASSETS } from "./data/catalog.js";
import { findPerson } from "./services/retired.js";
import { APP_VERSION } from "./data/version.js";
import { playInstantFriendly } from "./services/instantFriendly.js";
import {
  playMatchSequence,
  playCelebrationAudio,
  setAudioEnabled,
  setAudioMuted,
  setAudioVolume,
  unlockAudio,
} from "./services/audio.js";
import { getCupDraw } from "./services/cupDraw.js";
import { cupDrawModal } from "./features/cupDraw.js";
import { youthIntakeModal } from "./features/youthIntake.js";
import { executeYouthIntakeDecisions } from "./services/youthIntake.js";
import { acceptDeadlineBid, declineDeadlineBid } from "./services/deadlineDay.js";
import { blackFilesView } from "./features/blackFiles.js";
import * as BlackService from "./services/blackFiles.js";
import * as ReleaseService from "./services/releaseClause.js";
import { empireView } from "./features/empire.js";
import { setLifestyle, repayDebt } from "./services/empire/wealth.js";
import {
  takeFromClub,
  transferToClub,
  proposeProject,
  drawStatus,
} from "./services/empire/transfers.js";
const requireBlack = () => BlackService;
const requireRelease = () => ReleaseService;
const app = document.getElementById("app");
const ui = {
  route: "dashboard",
  setupClub: "ahly",
  setupConfig: {
    difficulty: "normal",
    database: "world",
    expanded: true,
    ownerStory: "selfmade",
  },
  owner: "",
  leagues: [...ALL_MARKETS],
  inboxFilter: "all",
  message: null,
  playerFilters: { search: "", pos: "all", league: "all" },
  financeTab: "ledger",
  worldTab: "table",
  clubLeague: null,
  branchCountry: null,
  clubClub: null,
  clubQuery: "",
  legendFilters: { ...DEFAULT_LEGEND_FILTERS },
  legendOffer: {},
  empireTab: "wealth",
  marketTab: "overview",
  marketListing: null,
  marketQuery: "",
  staffTab: "org",
  politicsTab: "overview",
  palette: { open: false, q: "", sel: 0, items: [] },
};
let pendingImport = null;
let actionBusy = false;
let lastRenderedRoute = null;
// الثيم: تفضيل متصفح (مثل اللغة) يُطبق فورًا ويُحفظ خارج الحفظة.
const resolveTheme = (pref) =>
  pref === "light"
    ? "light"
    : pref === "system"
      ? matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : "dark";
function applyThemePref(pref) {
  try {
    localStorage.setItem("clubowner.theme", pref);
  } catch {}
  const theme = resolveTheme(pref);
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#f2f6fb" : "#0a1322");
}
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => {
  try {
    if ((localStorage.getItem("clubowner.theme") || "dark") === "system")
      document.documentElement.dataset.theme = resolveTheme("system");
  } catch {}
});
// رندر متجمع لحقول البحث: يتجنب إعادة بناء الشاشة مع كل حرف على الهاتف.
let searchRenderTimer = 0;
function renderSearchSoon() {
  clearTimeout(searchRenderTimer);
  searchRenderTimer = setTimeout(() => {
    const active = document.activeElement;
    const id = active?.id;
    const pos = active?.selectionStart ?? null;
    render();
    if (!id) return;
    const input = document.getElementById(id);
    if (!input) return;
    input.focus();
    if (pos !== null) input.setSelectionRange(pos, pos);
  }, 120);
}
function render() {
  const s = getState();
  if (s) {
    // تفضيلات العرض تُطبق قبل بناء الشاشات: نمط الأرقام وتقليل الحركة.
    document.body.classList.toggle(
      "reduce-motion",
      !!s.preferences?.reduceMotion,
    );
  }
  if (!s) {
    app.innerHTML = setupView(
      ui.setupClub,
      ui.owner,
      ui.leagues,
      ui.setupConfig,
    );
    app.firstElementChild?.classList.add("page-enter");
    lastRenderedRoute = "setup";
    translateDOM(app);
    document.title = "Empire FC";
    return;
  }
  const views = {
    dashboard: () => `${absenceBanner(s)}${dashboardView(s)}`,
    inbox: () => inboxView(s, ui.inboxFilter, ui.message),
    squad: () => playersView(s, false, ui.playerFilters),
    transfers: () => playersView(s, true, ui.playerFilters),
    facilities: () => facilitiesView(s),
    sponsors: () => sponsorsView(s),
    finance: () => financeView(s, ui.financeTab),
    market: () =>
      stockMarketView(s, {
        tab: ui.marketTab,
        selectedId: ui.marketListing,
        query: ui.marketQuery,
      }),
    board: () => boardView(s),
    politics: () => politicsView(s, ui.politicsTab),
    staff: () => staffView(s, ui.staffTab, getLanguage()),
    ultras: () => ultrasView(s),
    world: () =>
      s.expansion
        ? competitionsView(s, ui.expandedDivision)
        : worldView(s, ui.worldTab),
    commerce: () => commerceView(s),
    management: () => managementView(s),
    press: () => pressView(s),
    black: () => blackFilesView(s),
    empire: () => empireView(s, ui.empireTab),
    legends: () => legendsView(s, ui.legendFilters),
    awards: () => awardsView(s),
    gifts: () => giftsView(s),
    branches: () => branchesView(s, ui.branchCountry),
    achievements: () => achievementsView(s),
    legacy: () => legendLogView(s),
    harvest: () => seasonHarvestView(s),
    dynasty: () => dynastyView(s),
    settings: () => settingsView(s),
    database: () => databaseView(),
    clubs: () =>
      clubBrowserView(s, {
        league: ui.clubLeague,
        club: ui.clubClub,
        q: ui.clubQuery,
      }),
    careers: () => careersView(s, ui.talentPlayer),
  };
  app.innerHTML = shell(
    s,
    ui.route,
    `${sectionInfoCard(s, ui.route)}${(views[ui.route] || views.dashboard)()}`,
  );
  if (ui.route !== lastRenderedRoute)
    app.querySelector("#main-content")?.classList.add("page-enter");
  lastRenderedRoute = ui.route;
  translateDOM(app);
  paintSaveIndicator();
  document.title = navLabel(ui.route) + " | Empire FC";
  document.title = translateText(document.title);
}
function navigate(route) {
  closeModal();
  closePalette();
  ui.route = route;
  if (["squad", "transfers"].includes(route))
    ui.playerFilters = { search: "", pos: "all", league: "all" };
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
// البحث السريع: طبقة مستقلة فوق التطبيق، تُحدَّث وحدها دون إعادة رندر الشاشة الحالية.
function renderPalette() {
  const root = document.getElementById("palette-root");
  if (!root) return;
  const s = getState();
  if (!ui.palette.open || !s) {
    root.innerHTML = "";
    return;
  }
  root.innerHTML = paletteOverlay(s, ui.palette);
  const input = root.querySelector("#palette-input");
  input?.focus();
  if (input) input.setSelectionRange(input.value.length, input.value.length);
}
function openPalette() {
  if (!getState()) return;
  ui.palette = { open: true, q: "", sel: 0, items: paletteItems(getState(), "") };
  renderPalette();
}
function closePalette() {
  if (!ui.palette.open) return;
  ui.palette.open = false;
  renderPalette();
}
function paletteQuery(q) {
  ui.palette.q = q;
  ui.palette.sel = 0;
  ui.palette.items = paletteItems(getState(), q);
  renderPalette();
}
function paletteMove(d) {
  const n = ui.palette.items.length;
  if (!n) return;
  ui.palette.sel = (ui.palette.sel + d + n) % n;
  renderPalette();
  document
    .querySelector(".palette-item.sel")
    ?.scrollIntoView({ block: "nearest" });
}
function paletteActivate(i) {
  const item = ui.palette.items[i];
  if (!item) return;
  closePalette();
  if (item.type === "screen") navigate(item.id);
  else showPlayer(item.id);
}
// 0.49: the decision is applied and shown immediately; persisting runs in the background
// (core/store.js) and only the topbar indicator reflects it — nothing is blocked or dimmed.
async function apply(operation, text) {
  let r;
  try {
    r = await commit(operation);
  } catch (e) {
    render();
    throw e;
  }
  render();
  if (text) toast(text);
  return r;
}
function paintSaveIndicator(st = saveStatus()) {
  const busy = st.status === "pending" || st.status === "saving";
  document.body.classList.toggle("save-pending", busy);
  document.body.classList.toggle("save-failed", st.status === "error");
  const el = document.querySelector(".save-indicator");
  if (!el) return;
  const label = {
    saved: tr("محفوظ محليًا", "Saved locally", "Sauvegarde locale"),
    pending: tr("بانتظار الحفظ…", "Waiting to save…", "En attente d'enregistrement…"),
    saving: tr("جارٍ الحفظ في الخلفية…", "Saving in the background…", "Enregistrement en arrière-plan…"),
    error: tr("تعذر الحفظ — اضغط لإعادة المحاولة", "Save failed — tap to retry", "Échec de l'enregistrement — touchez pour réessayer"),
  }[st.status];
  el.dataset.state = st.status;
  el.innerHTML = `<i></i> ${esc(label)}`;
  el.title = st.error || "";
  if (st.status === "error") {
    el.dataset.action = "save-retry";
    el.setAttribute("role", "button");
    el.tabIndex = 0;
  } else {
    delete el.dataset.action;
    el.setAttribute("role", "status");
    el.removeAttribute("tabindex");
  }
}
onSaveStatus(paintSaveIndicator);
function showCelebrationQueue(records, onDone = () => {}) {
  if (!records.length) return onDone();
  const save = getState();
  const record = save?.celebrations?.find((item) => item.id === records[0].id);
  if (!save || !record) return showCelebrationQueue(records.slice(1), onDone);
  playCelebrationAudio(save, record.kind);
  showCelebrationScreen(save, record, records.length, async () => {
    await apply((state) => markCelebrationSeen(state, record.id));
    showCelebrationQueue(records.slice(1), onDone);
  });
}

// 0.42: حفل الجوائز يُعرض بعد مشاهد الاحتفالات وقبل التقارير.
function showCeremonyIfPending(onDone = () => {}) {
  const save = getState();
  const ceremony = save?.awards?.ceremony;
  if (!save || !ceremony || ceremony.seen) return onDone();
  showAwardCeremony(save, ceremony, async () => {
    await apply((state) => markCeremonySeen(state));
    onDone();
  });
}

async function runTime(resume = false) {
  const days = resume
    ? null
    : Number(document.getElementById("advance-days")?.value || 7);
  const stateBefore = getState(),
    playedBefore = new Set(
      stateBefore ? playedOwnFixtures(stateBefore).map((f) => f.id) : [],
    ),
    celebrationBefore = stateBefore ? celebrationSnapshot(stateBefore) : null;
  const r = await apply((s) => {
    const result = advanceTime(s, days);
    const celebrations = result.advanced
      ? trackCelebrationEvents(s, celebrationBefore)
      : [];
    if (result.advanced) markStep(s, "week");
    return { ...result, celebrationIds: celebrations.map((item) => item.id) };
  });
  const s = getState();
  const fresh = s
    ? playedOwnFixtures(s).filter((f) => !playedBefore.has(f.id))
    : [];
  const finishAdvance = () => {
    // Sound is still presentation-only. When a trophy scene follows the match,
    // its fanfare replaces overlapping match cues for a cleaner celebration.
    if (fresh.length && !r.celebrationIds?.length)
      playMatchSequence(s, fresh[fresh.length - 1]);
    // 0.24: شاشة لقطات الماتش أولاً، ثم تقرير الماتش الكامل.
    if (s && s.preferences?.autoMatchReport !== false && fresh.length) {
      const report = reportFor(s, fresh[fresh.length - 1]);
      showHighlightsScreen(s, report, () => {
        openModal(matchReportModal(s, report));
      });
    }
    if (r.blocked) {
      ui.route = "inbox";
      ui.inboxFilter = "required";
      ui.message = pendingActions(getState())[0]?.id;
      render();
      toast(
        r.advanced
          ? `تقدمنا ${num(r.advanced)} أيام. الوقت متوقف لقرارك.`
          : "فيه قرار مهم محتاج ردك قبل تمرير الوقت.",
      );
    } else
      toast(
        r.match
          ? "توقفت المحاكاة بعد المباراة. النتيجة في بريدك."
          : `تم تمرير ${num(r.advanced)} ${r.advanced === 1 ? "يوم" : "أيام"} وحفظ اللعبة.`,
      );
  };
  const pending = s ? pendingCelebrations(s) : [];
  const afterCelebrations = () => showCeremonyIfPending(finishAdvance);
  if (pending.length) showCelebrationQueue(pending, afterCelebrations);
  else afterCelebrations();
}
function showPlayer(id) {
  const s = getState(),
    p = findPerson(s, id);
  if (p) openModal(playerDetail(s, p));
}
function showContract(ref, renew = false) {
  openModal(contractForm(getState(), ref, renew));
  updateCalculations();
}
function showOffers(id) {
  openModal(sponsorOffers(getState(), id), true);
}
function chooseImport() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.gz,application/json,application/gzip";
  input.onchange = async () => {
    if (!input.files?.[0]) return;
    try {
      pendingImport = await importGame(input.files[0]);
      openModal(
        `<span class="eyebrow">نسخة احتياطية سليمة</span><h2>استيراد الحفظة؟</h2><p class="muted">التاريخ ${esc(pendingImport.date)}. سيتم استبدال الحفظة النشطة على هذا المتصفح. صدّر الحالية أولًا لو محتاجها.</p><div class="modal-actions">${button("استيراد والمتابعة", "confirm-import", "", "primary")}${getState() ? button("تصدير الحالية أولًا", "export-save", "", "secondary") : ""}</div>`,
      );
    } catch (e) {
      toast("تعذر الاستيراد: " + e.message, true);
    }
  };
  input.click();
}
function updateCalculations() {
  const s = getState(),
    offer = document.querySelector("#offer-form"),
    contract = document.querySelector("#contract-form"),
    donation = document.querySelector("#politics-donation-form"),
    raiseForm = document.querySelector("#wage-raise-form");
  // 0.53 hotfix «زرار المليار»: معاينة حية «قبل → بعد» قبل اعتماد الرفعة.
  if (raiseForm) {
    // 0.53 hotfix «خانة المليار»: نفس تقريب الخدمة — المعاينة تعرض المبلغ المعتمد.
    const amount = roundWageRaise(raiseForm.elements.amount.value) ?? 0;
    const line = document.getElementById("wage-raise-summary");
    if (line) {
      try {
        const p = wageRaisePreview(s, amount);
        line.innerHTML = `<div><span>${tr("السقف قبل الرفعة", "Ceiling before the raise", "Plafond avant le relèvement")}</span><strong>${money(p.budgetBefore)} ${cur()}</strong></div><div><span>${tr("بعد الرفعة فورًا", "After the raise, at once", "Après le relèvement, aussitôt")}</span><strong class="green">${money(p.budgetAfter)} ${cur()}</strong></div><div><span>${tr("المبلغ المضاف", "Amount added", "Montant ajouté")}</span><b>+ ${money(p.amount)} ${cur()}</b></div><small>${p.over ? `${tr("الفجوة المتبقية", "Remaining shortfall", "Écart restant")}: ${money(p.gap)} ${cur()} — ${tr("الرفعة إضافة بحتة بلا غرامة ولا خصم.", "the raise is a pure addition with no fine and no deduction.", "le relèvement est un ajout pur, sans amende ni retenue.")}` : tr("الفاتورة الحالية تحت السقف بعد الرفعة، وكل رفعة تُسجَّل قبل/بعد بلا أي عقوبة.", "The current bill sits under the ceiling after the raise, and every raise is logged before/after with no penalty at all.", "La masse actuelle reste sous le plafond après le relèvement, et chaque relèvement est consigné avant/après, sans sanction.")}</small>`;
      } catch (err) {
        line.innerHTML = `<small>${esc(err.message)}</small>`;
      }
    }
  }
  if (donation) {
    // معاينة حية: كم نقطة امتنان (أي كم صوتًا محتملًا) سيضيف هذا المبلغ الآن؟
    const amount = Math.round(Number(donation.elements.amount.value) || 0);
    const clubId = donation.dataset.club;
    const line = document.getElementById("donation-summary");
    if (line) {
      try {
        const p = donationPreview(s, clubId, amount);
        line.innerHTML = `<div><span>${tr("الامتنان المتوقع", "Expected gratitude", "Reconnaissance attendue")}</span><strong>+${num(p.gratitude)}</strong></div><div><span>${tr("التأييد بعد التبرع", "Support after the donation", "Soutien après le don")}</span><strong>${num(Math.round(p.supportAfter))}%</strong></div><div><span>${tr("المتبقي من ثروتك", "Left of your fortune", "Reste de votre fortune")}</span><strong>${money(Math.max(0, donationAvailable(s) - amount))} ${cur()}</strong></div><small>${p.capped ? tr("التأييد قريب من سقفه، فالامتنان المتبقي محدود.", "Support is near its ceiling, so the remaining gratitude is limited.", "Le soutien approche de son plafond ; la reconnaissance restante est limitée.") : tr("التأييد يرتفع فورًا، والتبرع لا يُنتج أي شبهة أو عقوبة.", "Support rises at once, and the donation produces no suspicion or penalty.", "Le soutien monte aussitôt, sans soupçon ni sanction.")}</small>`;
      } catch (err) {
        line.innerHTML = `<small>${esc(err.message)}</small>`;
      }
    }
  }
  if (offer) {
    const fee = Number(offer.elements.fee.value),
      percent = Number(offer.elements.upfront.value);
    document.getElementById("offer-summary").innerHTML =
      `<div><span>المقدم عند التوقيع</span><strong>${money(Math.round((fee * percent) / 100))} ${cur()}</strong></div><div><span>باقي قيمة الانتقال</span><strong>${money(fee - Math.round((fee * percent) / 100))} ${cur()}</strong></div><small>لم يتم الخصم. لا يشمل المبلغ عقد اللاعب أو الوكيل.</small>`;
  }
  if (contract) {
    const salary = Number(contract.elements.salary.value),
      bonus = Number(contract.elements.bonus.value),
      years = Number(contract.elements.years.value),
      renew = contract.dataset.renew === "true";
    const n = renew
      ? null
      : s.negotiations.find((n) => n.id === contract.dataset.ref);
    const upfront = n ? Math.round((n.fee * n.upfrontPercent) / 100) : 0,
      agent = n ? Math.round(n.fee * 0.03) : 0,
      now = upfront + agent + bonus,
      total =
        (n?.fee || 0) +
        agent +
        bonus +
        guaranteedWages(
          salary,
          years,
          Number(contract.elements.annualRaisePct.value),
        );
    document.getElementById("contract-summary").innerHTML =
      `<div><span>المطلوب من الخزينة الآن</span><strong class="${now > s.finance.cash ? "red" : "green"}">${money(now)} ${cur()}</strong></div><div><span>إجمالي الالتزام خلال العقد</span><strong>${money(total)} ${cur()}</strong></div>${n ? `<div><span>عمولة الوكيل (3%)</span><b>${money(agent)} ${cur()}</b></div>` : ""}<small>يشمل ${renew ? "العقد الجديد والمكافأة" : "رسوم الانتقال والمرتب والمكافأة والوكيل"}. الرصيد المتاح ${money(s.finance.cash)} ${cur()}.</small>`;
  }
  if (offer) translateDOM(document.getElementById("offer-summary"));
  if (contract) {
    const summary = document.getElementById("contract-summary");
    summary.innerHTML += `<small>${tr("التكلفة المضمونة تشمل الزيادة السنوية ولا تشمل مكافآت المشاركات والأهداف المتغيرة. وعد الأساسي: المشاركة في 60% من المباريات خلال أول 60 يومًا؛ المخالفة تخفض المعنويات 12 نقطة. الشرط الجزائي يسمح لك بدفعه عند شراء لاعب من السوق؛ بيع لاعبيك للمنافسين غير متاح بعد.", "Guaranteed cost includes annual raises but excludes variable appearance and goal bonuses. Regular role: appear in 60% of matches during the first 60 days or lose 12 morale. A market player’s release clause can be activated when buying; AI purchases of your players are not yet enabled.", "Le coût garanti inclut les hausses annuelles, pas les primes variables. Titulaire : participer à 60 % des matchs des 60 premiers jours, sinon perte de 12 points de moral. La clause d’un joueur du marché peut être activée à l’achat ; ventes à l’IA non disponibles.")}</small>`;
    translateDOM(summary);
  }
}
function authModalContent(activeTab = "login", error = "") {
  return `<span class="eyebrow">حساب المالك والمزامنة</span>
  <h2>${activeTab === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}</h2>
  ${error ? `<div class="info-note" style="border-inline-start-color: var(--red); margin-bottom: 15px;"><span>${esc(error)}</span></div>` : ""}
  <div class="auth-tabs">
    <button type="button" class="auth-tab ${activeTab === "login" ? "active" : ""}" data-action="auth-tab-login">تسجيل الدخول</button>
    <button type="button" class="auth-tab ${activeTab === "register" ? "active" : ""}" data-action="auth-tab-register">إنشاء حساب جديد</button>
  </div>
  ${activeTab === "login" ? `
    <form id="auth-login-form">
      <div class="form-grid">
        <label class="field">
          <span>البريد الإلكتروني أو اسم المستخدم</span>
          <input type="text" name="identifier" required autocomplete="username" placeholder="name@example.com">
        </label>
        <label class="field">
          <span>كلمة المرور</span>
          <input type="password" name="password" required autocomplete="current-password" placeholder="••••••••">
        </label>
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn primary">تسجيل الدخول</button>
        ${button("إلغاء", "close-modal", "", "ghost")}
      </div>
    </form>
  ` : `
    <form id="auth-register-form">
      <div class="form-grid">
        <label class="field">
          <span>البريد الإلكتروني</span>
          <input type="email" name="email" required autocomplete="email" placeholder="name@example.com">
        </label>
        <label class="field">
          <span>اسم المستخدم (اسم المالك)</span>
          <input type="text" name="username" required autocomplete="nickname" placeholder="الاسم الذي يظهر في حسابك">
        </label>
        <label class="field">
          <span>كلمة المرور (6 أحرف على الأقل)</span>
          <input type="password" name="password" minlength="6" required autocomplete="new-password" placeholder="••••••••">
        </label>
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn primary">إنشاء الحساب والمتابعة</button>
        ${button("إلغاء", "close-modal", "", "ghost")}
      </div>
    </form>
  `}`;
}


// ── الخزنة الموحدة: نافذة التحويل + دفتر الحركات الأخيرة ──────────────────
let vaultTaps = [];
function vaultModalHtml() {
  const s = getState();
  const log = s ? ensureVault(s).log : [];
  const amountRow = (to) =>
    VAULT_AMOUNTS.map((a) =>
      button(`${money(a)} ${cur()}`, "vault-move", `${to}:${a}`, a >= 1_000_000_000 ? "primary" : "soft"),
    ).join("");
  const rows = log.length
    ? log
        .slice(0, 8)
        .map(
          (e) =>
            `<li><span>${e.date}</span><span>${e.to === "club" ? tr("← إلى النادي", "→ to the club", "→ au club") : tr("→ إلى الشخصية", "→ to personal", "→ au personnel")}</span><b>${money(e.amount)} ${cur()}</b></li>`,
        )
        .join("")
    : `<li class="muted">${tr("لا حركات بعد.", "No movements yet.", "Aucun mouvement pour l’instant.")}</li>`;
  return `<h2>${tr("الخزنة الموحدة 🤫", "The unified vault 🤫", "Le coffre unifié 🤫")}</h2>
    <p class="muted">${tr("تحويل داخلي بين خزينة النادي وخزنتك الشخصية. التحويل إلى النادي بلا قيود، والسحب إلى الشخصي يخضع لسقف الثقة والفاصل الثلاثي.", "An internal transfer between the club treasury and your personal vault. Moves to the club are unrestricted; draws to personal follow the trust cap and the three-month gap.", "Un transfert interne entre la trésorerie du club et votre coffre personnel. Les versements au club sont libres ; les prélèvements vers le personnel suivent le plafond de confiance et l’intervalle de trois mois.")}</p>
    <div class="vault-dest"><strong>${tr("إلى خزينة النادي", "To the club treasury", "Vers la trésorerie du club")}</strong><div class="modal-actions vault-grid">${amountRow("club")}</div></div>
    <div class="vault-dest"><strong>${tr("إلى الخزنة الشخصية", "To your personal vault", "Vers votre coffre personnel")}</strong><div class="modal-actions vault-grid">${amountRow("personal")}</div></div>
    <h3>${tr("الدفتر", "Ledger", "Registre")}</h3><ul class="vault-log">${rows}</ul>
    <div class="modal-actions">${button(tr("إغلاق الخزنة", "Close the vault", "Fermer le coffre"), "modal-close", "", "ghost")}</div>`;
}

function lootModalHtml({ amount, project, status, from }) {
  const reasons = status.reasonTexts.map((x) => `<li>${x}</li>`).join("");
  const action = "loot-confirm";
  const payload = `${amount}:${project || ""}:${from}`;
  return `<h2>${tr("هذا نهب!", "This is looting!", "C’est du pillage !")}</h2>
    <p>${tr("سحب", "Drawing", "Prélèvement de")} ${money(amount)} ${cur()} ${tr("خارج القواعد:", "outside the rules:", "hors des règles :")}</p>
    <ul class="muted">${reasons}</ul>
    <p>${tr("التنفيذ يرفع الحرارة (الشبهات) ويخفض ثقة الجمعية، ويفتح خطر الفصل.", "Proceeding raises heat (suspicion), lowers assembly trust and opens a dismissal risk.", "Poursuivre fait monter la pression (soupçons), baisse la confiance de l’assemblée et ouvre un risque de révocation.")}</p>
    <div class="modal-actions">${button(tr("تنفيذ النهب", "Proceed with looting", "Poursuivre le pillage"), action, payload, "primary")}${button(tr("إلغاء", "Cancel", "Annuler"), "modal-close", "", "ghost")}</div>`;
}

// الهدايا 0.46: تأكيد صريح قبل أي هدية على خط الغرباء 🔥 — الكلفة والأثر والشبهات معلنة قبل الدفع.
function giftStrangerConfirmModal(kind, amount, target) {
  const isPress = kind === "journalist";
  const suspicion = Math.round((amount / 1_000_000) * (isPress ? 1.2 : 1.5) * 10) / 10;
  const channel = isPress
    ? tr("مصداقية الإدارة في الصحافة", "press credibility", "la crédibilité presse")
    : tr(`علاقة ${target}`, `the ${target} relationship`, `la relation ${target}`);
  const payload = `${kind}:${amount}:${target || ""}`;
  return `<h2>${tr("هدية تُحسب رشوة 🔥", "A gift that counts as a bribe 🔥", "Un cadeau qui compte comme un pot-de-vin 🔥")}</h2>
    <p>${tr("ستدفع", "You will pay", "Vous paierez")} <b>${money(amount)} ${cur()}</b> ${tr("من ثروتك الشخصية.", "from your personal fortune.", "de votre fortune personnelle.")}</p>
    <p>${tr("الأثر:", "The effect:", "L'effet :")} ${channel} ${tr("يتحسن فورًا.", "improves at once.", "s'améliore aussitôt.")} ${tr("الثمن:", "The cost:", "Le prix :")} +${num(suspicion)}% ${tr("على مؤشر الشبهات في الملفات السوداء، بلا تراجع.", "on the black-files suspicion meter, with no undo.", "sur les soupçons des dossiers noirs, sans retour.")}</p>
    <p class="muted">${tr("تذكير: عدم الإهداء ليس له أي عقوبة — هذا الخط اختيار حر تمامًا.", "Reminder: not giving carries no penalty — this line is entirely optional.", "Rappel : ne pas donner n'a aucune conséquence — cette ligne reste tout à fait facultative.")}</p>
    <div class="modal-actions">${button(tr("ادفع الهدية", "Pay the gift", "Payer le cadeau"), "gift-stranger-confirm", payload, "primary")}${button(tr("تراجع", "Step back", "Renoncer"), "modal-close", "", "ghost")}</div>`;
}

function openGiftStrangerConfirm(kind, amount, target) {
  openModal(giftStrangerConfirmModal(kind, amount, target), true);
}

function updateExchangeBuilder(form, forceAutoBalance = false) {
  const selected = (side) => [
    ...form.querySelectorAll(`[data-exchange-side="${side}"]:checked`),
  ];
  const outgoing = selected("outgoing");
  const incoming = selected("incoming");
  const outgoingIds = outgoing.map((input) => input.value);
  const incomingIds = incoming.map((input) => input.value);
  const cashInput = form.elements.cash;
  if (forceAutoBalance || cashInput.dataset.manual !== "true") {
    cashInput.value = String(suggestedExchangeCash(getState(), outgoingIds, incomingIds));
    cashInput.dataset.manual = "false";
  }
  const outgoingValue = outgoing.reduce((sum, input) => sum + Number(input.dataset.value || 0), 0);
  const incomingValue = incoming.reduce((sum, input) => sum + Number(input.dataset.value || 0), 0);
  const cash = Number(cashInput.value || 0);
  const sent = outgoingValue + Math.max(0, cash);
  const received = incomingValue + Math.max(0, -cash);
  const gap = Math.round((Math.abs(sent - received) / Math.max(1, sent, received)) * 100);
  const summary = form.querySelector("[data-exchange-summary]");
  if (summary)
    summary.textContent = `${tr("القيمة الخارجة", "Value given", "Valeur donnée")}: ${money(outgoingValue)} ${cur()} · ${tr("القيمة الداخلة", "Value received", "Valeur reçue")}: ${money(incomingValue)} ${cur()} · ${tr("فرق القيمة", "Value gap", "Écart de valeur")}: ${num(gap)}%`;
}
const actions = {
  "market-tab": (el) => {
    ui.marketTab = el.dataset.id || "overview";
    render();
  },
  "market-buy": async (el) => {
    const quantity = Number(document.getElementById("market-trade-quantity")?.value);
    const { buyShares } = await import("./services/stockMarket/trading.js");
    await apply(
      (s) => buyShares(s, el.dataset.id, quantity),
      tr(
        "تم شراء الأسهم من ثروتك الشخصية.",
        "Shares bought from your personal wealth.",
        "Actions achetées avec votre fortune personnelle.",
      ),
    );
  },
  "market-sell": async (el) => {
    const quantity = Number(document.getElementById("market-trade-quantity")?.value);
    const { sellShares } = await import("./services/stockMarket/trading.js");
    await apply(
      (s) => sellShares(s, el.dataset.id, quantity),
      tr(
        "تم بيع الأسهم وإعادة العائد إلى ثروتك.",
        "Shares sold and proceeds returned to your wealth.",
        "Actions vendues et produit reversé à votre fortune.",
      ),
    );
  },
  "market-plan-secret": async (el) => {
    const { planInsideInformation } = await import(
      "./services/stockMarket/insider.js"
    );
    await apply(
      (s) => planInsideInformation(s, el.dataset.id, el.dataset.kind),
      tr(
        "سُجلت المعلومة السرية قبل الإعلان.",
        "The secret information was recorded before disclosure.",
        "L’information secrète a été enregistrée avant publication.",
      ),
    );
  },
  "market-insider-buy": async (el) => {
    const quantity = Number(
      document.getElementById(`inside-qty-${el.dataset.id}`)?.value,
    );
    const { tradeOnInsideInformation } = await import(
      "./services/stockMarket/insider.js"
    );
    await apply(
      (s) => tradeOnInsideInformation(s, el.dataset.id, "buy", quantity),
      tr(
        "تداولت قبل الإعلان؛ الهيئة قد تربط التوقيت بك.",
        "You traded before disclosure; the regulator may connect the timing to you.",
        "Vous avez négocié avant publication ; le régulateur peut relier le timing à vous.",
      ),
    );
  },
  "market-insider-sell": async (el) => {
    const quantity = Number(
      document.getElementById(`inside-qty-${el.dataset.id}`)?.value,
    );
    const { tradeOnInsideInformation } = await import(
      "./services/stockMarket/insider.js"
    );
    await apply(
      (s) => tradeOnInsideInformation(s, el.dataset.id, "sell", quantity),
      tr(
        "تداولت قبل الإعلان؛ الهيئة قد تربط التوقيت بك.",
        "You traded before disclosure; the regulator may connect the timing to you.",
        "Vous avez négocié avant publication ; le régulateur peut relier le timing à vous.",
      ),
    );
  },
  "market-pump-dump": async (el) => {
    const quantity = Number(
      document.getElementById("market-manip-quantity")?.value,
    );
    const budget = Number(document.getElementById("market-rumor-budget")?.value);
    const { startPumpAndDump } = await import(
      "./services/stockMarket/manipulation.js"
    );
    await apply(
      (s) => startPumpAndDump(s, el.dataset.id, quantity, budget),
      tr(
        "بدأت حملة السوق؛ الربح كبير والجريمة أكبر إن كُشفت.",
        "The market campaign started; the profit is huge and so is the crime if exposed.",
        "La campagne de marché a commencé ; le gain est énorme, tout comme le crime s’il est découvert.",
      ),
    );
  },
  "market-bear-rumor": async (el) => {
    const budget = Number(document.getElementById("market-rumor-budget")?.value);
    const { launchRumorCampaign } = await import(
      "./services/stockMarket/manipulation.js"
    );
    await apply(
      (s) =>
        launchRumorCampaign(s, el.dataset.id, {
          direction: "bear",
          budget,
        }),
      tr(
        "انطلقت حرب الشائعات الهابطة.",
        "The bearish rumour war has begun.",
        "La guerre de rumeurs baissières a commencé.",
      ),
    );
  },
  "market-short-poach": async (el) => {
    const quantity = Number(
      document.getElementById("market-manip-quantity")?.value,
    );
    const { shortBeforePoach } = await import(
      "./services/stockMarket/manipulation.js"
    );
    await apply(
      (s) => shortBeforePoach(s, el.dataset.id, quantity),
      tr(
        "بعت المنافس على المكشوف قبل خطة خطف نجمه.",
        "You shorted the rival before the star-poaching plan.",
        "Vous avez vendu le rival à découvert avant le projet de recruter sa star.",
      ),
    );
  },
  "market-dump": async (el) => {
    const { dumpCampaign } = await import(
      "./services/stockMarket/manipulation.js"
    );
    await apply(
      (s) => dumpCampaign(s, el.dataset.id),
      tr(
        "بعت بعد التضخيم؛ أثر العملية صار في ملف الهيئة.",
        "You sold after the pump; the operation is now in the regulator’s file.",
        "Vous avez vendu après le gonflement ; l’opération figure désormais au dossier du régulateur.",
      ),
    );
  },
  "market-close-short": async (el) => {
    const { closeShortPosition } = await import(
      "./services/stockMarket/manipulation.js"
    );
    await apply(
      (s) => closeShortPosition(s, el.dataset.id),
      tr(
        "أُغلق مركز البيع المكشوف.",
        "Short position closed.",
        "Position vendeuse clôturée.",
      ),
    );
  },
  "market-audit": async () => {
    const { runMarketAudit } = await import(
      "./services/stockMarket/regulation.js"
    );
    await apply(
      (s) => runMarketAudit(s, { source: "voluntary" }),
      tr(
        "اكتمل التدقيق الرقابي.",
        "The regulatory audit is complete.",
        "L’audit réglementaire est terminé.",
      ),
    );
  },
  "market-case-response": async (el) => {
    const { respondToMarketInvestigation } = await import(
      "./services/stockMarket/regulation.js"
    );
    await apply(
      (s) =>
        respondToMarketInvestigation(
          s,
          el.dataset.id,
          el.dataset.response,
        ),
      tr(
        "حُسم التحقيق وسُجلت العقوبة.",
        "The investigation was resolved and the sanction recorded.",
        "L’enquête est close et la sanction enregistrée.",
      ),
    );
  },
  "market-betting-ipo": async () => {
    const percent = Number(document.getElementById("market-betting-ipo-percent")?.value);
    const discount = Number(document.getElementById("market-betting-ipo-discount")?.value);
    const { launchBettingIPO } = await import("./services/stockMarket/ipo.js");
    await apply(
      (s) => launchBettingIPO(s, { percent, discount }),
      tr(
        "تم إدراج شركة المراهنات وإيداع الحصيلة في ثروتك الشخصية.",
        "The betting company was listed and proceeds entered your personal wealth.",
        "La société de paris a été cotée et le produit a rejoint votre fortune personnelle.",
      ),
    );
  },
  "market-betting-secondary": async () => {
    const percent = Number(document.getElementById("market-betting-secondary-percent")?.value);
    const { secondaryBettingOffering } = await import("./services/stockMarket/ipo.js");
    await apply(
      (s) => secondaryBettingOffering(s, percent),
      tr(
        "بعت حصة إضافية من الشركة عبر السوق.",
        "You sold an additional company stake through the market.",
        "Vous avez vendu une participation supplémentaire sur le marché.",
      ),
    );
  },
  "market-club-ipo": async () => {
    const percent = Number(document.getElementById("market-club-ipo-percent")?.value);
    const discount = Number(document.getElementById("market-club-ipo-discount")?.value);
    const { listOwnClub } = await import("./services/stockMarket/ipo.js");
    await apply(
      (s) => listOwnClub(s, { percent, discount }),
      tr(
        "دخلت حصيلة الاكتتاب خزينة النادي وأصبح للجماهير ضغط ربعي.",
        "IPO proceeds entered the club treasury and fans now exert quarterly pressure.",
        "Le produit de l’introduction a rejoint la trésorerie et les supporters exercent désormais une pression trimestrielle.",
      ),
    );
  },
  "market-event-choice": async (el) => {
    const { resolveStockMarketEvent } = await import("./services/stockMarket/events.js");
    await apply(
      (s) => resolveStockMarketEvent(s, el.dataset.id),
      tr(
        "حُسم حدث السوق وسُجل أثره.",
        "The market event was resolved and its effect recorded.",
        "L’événement de marché est résolu et son effet enregistré.",
      ),
    );
  },
  "market-select": (el) => {
    ui.marketListing = el.dataset.id || null;
    render();
    document.querySelector(".market-focus-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  },
  // الخزنة الموحدة 0.43: تُفتح بخمس نقرات متتالية خلال 3 ثوانٍ على شارة الإصدار (لا نقرة واحدة).
  "secret-vault": () => {
    const now = Date.now();
    vaultTaps = vaultTaps.filter((t) => now - t <= VAULT_TAP_WINDOW_MS);
    vaultTaps.push(now);
    if (vaultTaps.length < VAULT_TAPS) return;
    vaultTaps = [];
    openModal(vaultModalHtml());
  },
  "vault-move": async (el) => {
    const [to, amountRaw] = String(el.dataset.id).split(":");
    const amount = Number(amountRaw);
    await apply((s) => vaultMove(s, { to, amount }));
    toast(
      to === "club"
        ? `${tr("تم تحويل", "Moved", "Transféré")} ${money(amount)} ${cur()} ${tr("إلى خزينة النادي", "to the club treasury", "vers la trésorerie du club")}`
        : `${tr("تم تحويل", "Moved", "Transféré")} ${money(amount)} ${cur()} ${tr("إلى خزنتك الشخصية", "to your personal vault", "vers votre coffre personnel")}`,
    );
    openModal(vaultModalHtml());
  },
  // تأكيد النهب صراحةً بعد تحذير «هذا نهب!» (data-id = المبلغ:المشروع)
  "loot-confirm": async (el) => {
    const [amountRaw, projectRaw, from] = String(el.dataset.id).split(":");
    const amount = Number(amountRaw);
    const project = projectRaw || null;
    const text = tr("تم السحب، وسُجل النهب في الدفاتر.", "Drawn — the looting is recorded in the ledger.", "Prélevé — le pillage est enregistré dans le registre.");
    await apply((s) => takeFromClub(s, amount, { project, confirmLoot: true }), text);
    closeModal();
  },
  // القائمة الجانبية: طي/فتح مجموعة وحفظ الحالة في المتصفح.
  "nav-group-toggle": (el) => {
    toggleNavGroup(el.dataset.id);
    render();
  },
  "modal-close": () => closeModal(),
  "instant-friendly": async () => {
    let reportData = null;
    let fixture = null;
    await apply((s) => {
      const res = playInstantFriendly(s);
      reportData = res.report;
      fixture = res.fixture;
      markStep(s, "friendly");
    });
    const s = getState();
    if (fixture) playMatchSequence(s, fixture);
    if (reportData) {
      showHighlightsScreen(s, reportData, () => {
        openModal(matchReportModal(s, reportData));
      });
    }
  },
  "view-cup-draw": async (el) => {
    const drawId = el?.dataset?.drawId || el?.dataset?.id;
    const s = getState();
    const draw = getCupDraw(s, drawId) || s?.latestDraw;
    if (draw) openModal(cupDrawModal(s, draw), true);
  },
  "go-awards": async () => navigate("awards"),
  // 0.46 (القسم 7): إخفاء بطاقة التعريف لقسم، وإعادتها كلها من الإعدادات.
  "info-hide": async (el) => apply((state) => setSectionInfoHidden(state, el.dataset.id, true)),
  "info-show-all": async () => apply((state) => showAllSectionInfo(state), tr("تمت إعادة بطاقات الشرح.", "Info cards are back.", "Cartes d'information rétablies.")),
  // 0.46: «تم الاطلاع» يحدّث آخر زيارة فيختفي الملخص حتى غياب جديد.
  "absence-seen": async () => apply((state) => markAbsenceSeen(state)),
  // 0.46: وضع الإجازة وتقرير العودة.
  "vacation-start": async () => apply((state) => startVacation(state), tr("بدأ وضع الإجازة.", "Holiday mode is on.", "Mode vacances activé.")),
  "vacation-end": async () => {
    let out = null;
    await apply((state) => {
      out = endVacation(state);
    });
    if (out) openModal(vacationReturnModal(out));
  },
  "view-ceremony": async () => {
    const s = getState();
    const ceremony = s?.awards?.ceremony;
    if (ceremony)
      showAwardCeremony(s, ceremony, async () => {
        await apply((state) => markCeremonySeen(state));
        render();
      });
  },
  "fan-campaign": async () =>
    apply(
      (s) => campaignFanVote(s),
      tr(
        "انطلقت حملتك الدعائية لمرشحك — التفاعل يتصاعد.",
        "Your campaign is live — engagement is climbing.",
        "Votre campagne est lancée — l’engagement monte.",
      ),
    ),
  "award-demand-raise": async (el) =>
    apply(
      (s) => resolveAwardDemand(s, el.dataset.id, "raise"),
      tr(
        "قُبلت الزيادة وحُسّن عقد الفائز.",
        "The raise was approved and the winner’s deal improved.",
        "L’augmentation est accordée et le contrat amélioré.",
      ),
    ),
  "award-demand-improve": async (el) =>
    apply(
      (s) => resolveAwardDemand(s, el.dataset.id, "improve"),
      tr(
        "حُسّن عقد الفائز بالمعقول.",
        "The winner’s deal improved moderately.",
        "Le contrat du vainqueur est modestement amélioré.",
      ),
    ),
  "award-demand-refuse": async (el) =>
    apply(
      (s) => resolveAwardDemand(s, el.dataset.id, "refuse"),
      tr(
        "رُفض المطلب — المعنويات تأثرت.",
        "The demand was refused — morale dropped.",
        "La demande est refusée — le moral baisse.",
      ),
    ),
  "coach-demand-raise": async (el) =>
    apply(
      (s) => resolveCoachDemand(s, el.dataset.id, "raise"),
      tr(
        "رُفِع راتب المدرب وامتد عقده.",
        "The coach’s salary rose and the contract extended.",
        "Le salaire de l’entraîneur augmente et son contrat est prolongé.",
      ),
    ),
  "coach-demand-refuse": async (el) =>
    apply(
      (s) => resolveCoachDemand(s, el.dataset.id, "refuse"),
      tr(
        "رُفض مطلب المدرب — الثقة تأثرت.",
        "The coach’s demand was refused — confidence dropped.",
        "La demande est refusée — la confiance baisse.",
      ),
    ),
  "open-youth-intake": async () => {
    const s = getState();
    openModal(youthIntakeModal(s), true);
  },
  "confirm-youth-intake": async () => {
    const root = document.querySelector(".youth-intake-modal");
    if (!root) return;
    const decisions = {};
    root.querySelectorAll(".youth-candidate-card").forEach((card) => {
      const pId = card.dataset.playerId;
      const checked = card.querySelector(`input[name="youth-dec-${pId}"]:checked`);
      if (pId && checked) decisions[pId] = checked.value;
    });
    await apply((s) => executeYouthIntakeDecisions(s, decisions));
    closeModal();
    toast(tr("تم اعتماد قرارات دفعة الناشئين بنجاح", "Youth intake decisions confirmed successfully", "Décisions de la promotion confirmées avec succès"));
  },
  "accept-deadline-bid": async (el) => {
    const id = el.dataset.id;
    await apply((s) => acceptDeadlineBid(s, id));
    toast(tr("تمت الموافقة على بيع اللاعب في اللحظات الأخيرة", "Accepted last-minute player sale", "Vente de dernière minute acceptée"));
    render();
  },
  "decline-deadline-bid": async (el) => {
    const id = el.dataset.id;
    await apply((s) => declineDeadlineBid(s, id));
    toast(tr("تم رفض العرض العاجل", "Declined urgent offer", "Offre urgente refusée"));
    render();
  },
  "business-open": async (el) => apply((s) => businessOpen(s, el.dataset.id)),
  "sell-subscriptions": async () => apply((s) => sellSubscriptions(s)),
  "commercial-friendly": async () => apply((s) => friendly(s)),
  "appoint-coach": async (el) =>
    openModal(coachContractModal(getState(), el.dataset.id, "appoint")),
  "renew-coach": async () =>
    openModal(coachContractModal(getState(), null, "renew")),
  "dismiss-coach": async () => apply((s) => dismissCoach(s)),
  "legend-detail": async (el) => {
    ui.legendOffer = { id: el.dataset.id };
    openModal(
      legendDetailModal(getState(), el.dataset.id, ui.legendOffer),
      true,
    );
  },
  "legend-page": async (el) => {
    ui.legendFilters.page = Number(el.dataset.id) || 1;
    render();
  },
  "legend-release": async (el) =>
    openModal(legendReleaseModal(getState(), el.dataset.id)),
  "confirm-legend-release": async (el) => {
    await apply(
      (s) => releaseLegend(s, el.dataset.id),
      "تم إنهاء عقد الأسطورة.",
    );
    closeModal();
  },
  "legend-renew": async (el) =>
    openModal(legendRenewModal(getState(), el.dataset.id)),
  "toggle-lineup": async (el) => apply((s) => toggleLineup(s, el.dataset.id)),
  "press-support": async (el) =>
    apply((s) => pressAnswer(s, el.dataset.id, "support")),
  "press-demand": async (el) =>
    apply((s) => pressAnswer(s, el.dataset.id, "demand")),
  "press-quiet": async (el) =>
    apply((s) => pressAnswer(s, el.dataset.id, "quiet")),
  "press-delegate": async () =>
    apply((s) => {
      s.press.delegate = !s.press.delegate;
    }),
  "ultras-event-choice": async (el) =>
    apply((s) => resolveUltrasEvent(s, el.dataset.event, el.dataset.id)),
  "ultras-demand-choice": async (el) =>
    apply((s) => respondToSupporterDemand(s, el.dataset.id)),
  "ultras-tifo": async (el) => apply((s) => stageTifo(s, el.dataset.id || null)),
  "ultras-away": async (el) => apply((s) => organizeAwaySupport(s, el.dataset.id || null)),
  "ultras-chant": async () => apply((s) => launchChant(s)),
  "ultras-pressure": async () => {
    const rivalId = document.getElementById("ultras-rival-select")?.value;
    if (rivalId) await apply((s) => pressureRivalSupporters(s, rivalId));
  },
  "ultras-sanction": async (el) =>
    apply((s) => imposeUltrasStadiumSanction(s, el.dataset.id)),
  "go-ultras": async () => navigate("ultras"),
  "bid-accept": async (el) => apply((s) => answerBid(s, el.dataset.id, true)),
  "bid-reject": async (el) => apply((s) => answerBid(s, el.dataset.id, false)),
  "talent-intake": async () => apply((s) => startIntake(s)),
  "talent-promote": async (el) =>
    apply((s) => chooseCandidate(s, el.dataset.id, true)),
  "talent-release": async (el) =>
    apply((s) => chooseCandidate(s, el.dataset.id, false)),
  "talent-follow": async (el) => apply((s) => followPlayer(s, el.dataset.id)),
  "talent-shortlist": async (el) =>
    apply((s) => toggleShortlist(s, el.dataset.id)),
  "go-talent": async () => {
    ui.route = "careers";
    render();
  },
  // 0.26: من البريد إلى لائحة الجمعية العمومية، ويُعلَّم بند الأونبوردنج تلقائيًا.
  "go-board": async () => {
    const s = getState();
    if (s) await apply((state) => markStep(state, "board"));
    navigate("board");
  },
  "politics-tab": async (el) => {
    ui.politicsTab = el.dataset.id || "overview";
    render();
  },
  "politics-event-choice": async (el) =>
    apply(
      (s) => resolvePoliticalEvent(s, el.dataset.id),
      tr(
        "حُسم الحدث وأضيفت آثاره إلى السجل السياسي.",
        "The event was resolved and its effects were added to the political record.",
        "L’événement est tranché et ses effets sont ajoutés au registre politique.",
      ),
    ),
  // التبرعات 0.50: نافذة بمبلغ حر + معاينة امتنان حية قبل الدفع، وبلا أي عقوبة.
  "politics-donate": async (el) => {
    const s = getState();
    const clubId = el.dataset.id;
    const club = s.politics.clubs.find((row) => row.clubId === clubId);
    const available = donationAvailable(s);
    openModal(
      `<h2>${tr("تبرع علني", "Public donation", "Don public")} · ${esc(extendedClub(clubId)?.name || clubId)}</h2><p class="muted">${tr("المبلغ حر تمامًا ومن ثروتك الشخصية. النادي يشكرك علنًا، وامتنانه يرفع تأييده لك، والتأييد يظهر مباشرة في أصواته داخل الاقتراع — بلا شبهات ولا حرارة ولا أي عقوبة.", "The amount is entirely up to you and comes from your personal fortune. The club thanks you publicly, its gratitude raises its support for you, and that support shows directly in its votes at the ballot — with no suspicion, heat, or penalty.", "Le montant est totalement libre et provient de votre fortune personnelle. Le club vous remercie publiquement, sa reconnaissance renforce son soutien, et ce soutien apparaît directement dans ses votes — sans soupçon, pression ni sanction.")}</p>
      <form id="politics-donation-form" data-club="${esc(clubId)}">
        <label class="field"><span>${tr("المبلغ", "Amount", "Montant")} (${tr("متاح", "available", "disponible")}: ${money(available)} ${cur()})</span><input name="amount" type="number" min="50000" max="${Math.max(50_000, available)}" step="any" value="${Math.min(1_000_000, Math.max(50_000, available))}" required></label>
        <div class="politics-donation-quick">${[500_000, 2_000_000, 10_000_000]
          .filter((value) => value <= available)
          .map((value) => `<button type="button" class="btn ghost small" data-action="politics-donation-set" data-id="${value}">${money(value)} ${cur()}</button>`)
          .join("")}</div>
        <div id="donation-summary" class="politics-donation-preview"></div>
        <div class="modal-actions">${button(tr("إلغاء", "Cancel", "Annuler"), "close-modal", "", "secondary")}<button type="submit" class="btn primary" ${available < 50_000 ? "disabled" : ""}>${tr("تبرع الآن", "Donate now", "Donner maintenant")}</button></div>
      </form>
      <small class="muted">${tr("أقل مبلغ 50 ألف، ولا يوجد سقف غير ما تملكه. التأييد الحالي", "The minimum is 50,000 and the only ceiling is what you own. Current support", "Le minimum est de 50 000 et le seul plafond est votre fortune. Soutien actuel")}: ${num(Math.round(club?.support ?? 0))}%</small>`,
    );
    updateCalculations();
  },
  "politics-donation-set": async (el) => {
    const input = document
      .getElementById("politics-donation-form")
      ?.querySelector("input[name=amount]");
    if (input) {
      input.value = el.dataset.id;
      updateCalculations();
    }
  },
  "politics-start-campaign": async () =>
    apply(
      (s) => triggerElectionCampaign(s),
      tr(
        "انطلقت حملتك الانتخابية لرئاسة الاتحاد.",
        "Your football association presidential campaign has begun.",
        "Votre campagne pour la présidence de la fédération est lancée.",
      ),
    ),
  "politics-visit": async (el) =>
    apply(
      (s) => visitClub(s, el.dataset.id),
      tr(
        "تمت الزيارة وسُجل أثرها على الموقف والميزانية الشخصية.",
        "Visit recorded; its support and personal-budget effects are logged.",
        "Visite enregistrée ; son effet sur le soutien et le budget personnel est consigné.",
      ),
    ),
  "politics-conference": async (el) =>
    apply(
      (s) => holdConference(s, el.dataset.id),
      tr(
        "انتهى المؤتمر، وتغيرت مواقف أندية التكتل.",
        "The conference ended; clubs in the bloc shifted their positions.",
        "La conférence est terminée ; les positions des clubs du bloc ont évolué.",
      ),
    ),
  "politics-promise": async (el) =>
    apply(
      (s) => {
        const club = politicalClub(s, el.dataset.id);
        if (!club)
          throw new Error(
            tr(
              "النادي غير موجود في الخريطة السياسية.",
              "That club is missing from the political map.",
              "Ce club manque sur la carte politique.",
            ),
          );
        return makeCampaignPromise(s, el.dataset.id, club.demandId);
      },
      tr(
        "سُجل الوعد بمطلب محدد، وسيُحاسبك النادي عليه.",
        "A specific promise was recorded; the club will hold you to it.",
        "L’engagement est enregistré ; le club vous demandera des comptes.",
      ),
    ),
  "politics-form-bloc": async (el) =>
    apply(
      (s) => {
        const members = s.politics.clubs
          .filter((club) => club.bloc === el.dataset.id)
          .map((club) => club.clubId);
        return formAlliance(
          s,
          members,
          POLITICAL_BLOCS[el.dataset.id]?.ar || "تكتل الأندية",
        );
      },
      tr(
        "تأسس التكتل وأُسندت عضويته إلى الأندية المختارة.",
        "The bloc was formed and its club membership recorded.",
        "Le bloc est constitué et ses membres sont enregistrés.",
      ),
    ),
  "politics-alliance": async (el) => {
    const result = await apply((s) => offerCandidateAlliance(s, el.dataset.id));
    toast(
      result?.accepted
        ? tr(
            "قُبل التحالف الانتخابي وأُعلن التأييد.",
            "The electoral alliance was accepted and publicly endorsed.",
            "L’alliance électorale est acceptée et le soutien est annoncé.",
          )
        : tr(
            "لم يقبل المنافس بعد؛ تحسنت العلاقة قليلًا وبقي باب التفاوض مفتوحًا.",
            "The rival has not accepted yet; relations improved slightly and talks remain open.",
            "L’adversaire n’a pas encore accepté ; la relation s’améliore légèrement et la négociation reste ouverte.",
          ),
    );
  },
  "politics-propose-law": async (el) =>
    apply(
      (s) => proposeBill(s, el.dataset.id),
      tr(
        "قُدّمت اللائحة إلى المجلس وبدأت المداولة.",
        "The bill was introduced and council debate has begun.",
        "Le texte est présenté et le débat du conseil commence.",
      ),
    ),
  "politics-vote-bill": async (el) =>
    apply(
      (s) => resolveBill(s, el.dataset.id),
      tr(
        "سُجل الاقتراع العلني ونتيجة اللائحة.",
        "The public ballot and bill result have been recorded.",
        "Le scrutin public et le résultat du texte sont enregistrés.",
      ),
    ),
  "politics-financial-audit": async () =>
    apply(
      (s) => runFinancialAudit(s),
      tr(
        "اكتملت مراجعة الحسابات وسُجلت نتيجتها.",
        "The financial audit is complete and its result has been recorded.",
        "L’audit financier est terminé et son résultat est enregistré.",
      ),
    ),
  "politics-discipline-ruling": async (el) => {
    const [caseId, verdict] = (el.dataset.id || "").split("|");
    await apply(
      (s) => resolveDisciplineCase(s, caseId, verdict),
      tr(
        "صدر قرار لجنة الانضباط ووُثق في السجل العام.",
        "The disciplinary committee ruling was recorded in the public log.",
        "La décision disciplinaire a été enregistrée au registre public.",
      ),
    );
  },
  "politics-tournament-advance": async (el) =>
    apply(
      (s) => playAssociationTournamentRound(s, el.dataset.id),
      tr(
        "اكتملت الجولة وسُجلت النتائج والترتيب أو المتأهلون.",
        "The round is complete; results, standings or qualifiers are recorded.",
        "La journée est terminée ; résultats, classement ou qualifiés sont enregistrés.",
      ),
    ),
  "politics-confidence-vote": async () =>
    apply(
      (s) => holdConfidenceVote(s),
      tr(
        "اكتمل اقتراع الثقة بالأسماء وحُفظت نتيجته.",
        "The named confidence vote is complete and its result is saved.",
        "Le vote de confiance nominatif est terminé et son résultat est enregistré.",
      ),
    ),
  "politics-integrity-declare": async () =>
    apply(
      (s) => submitAssetDeclaration(s),
      tr(
        "قُدم إقرار الأصول وأضيف إلى السجل العام.",
        "The asset declaration was filed in the public record.",
        "La déclaration d’actifs est inscrite au registre public.",
      ),
    ),
  "politics-integrity-audit": async () =>
    apply(
      (s) => conductIntegrityAudit(s),
      tr(
        "اكتمل تدقيق النزاهة والتطابق المالي.",
        "The integrity and financial audit is complete.",
        "L’audit d’intégrité et de rapprochement financier est terminé.",
      ),
    ),
  "politics-integrity-decision": async (el) => {
    const [investigationId, decision] = (el.dataset.id || "").split("|");
    await apply(
      (s) => resolveIntegrityInvestigation(s, investigationId, decision),
      tr(
        "سُجل قرار التحقيق وأدلته في ملف الاتحاد.",
        "The investigation ruling and evidence were recorded in the association file.",
        "La décision d’enquête et les preuves sont inscrites au dossier de la fédération.",
      ),
    );
  },
  "politics-legacy-trial": async (el) => {
    const response = el.dataset.id || "";
    await apply(
      (s) => resolveLegacyTrial(s, response),
      tr(
        "صدر الحكم النهائي وأُضيف إلى سجل الإرث.",
        "The final ruling was added to the legacy record.",
        "Le verdict final est ajouté au registre d’héritage.",
      ),
    );
  },
  "politics-office-resign": async () => {
    if (
      !confirm(
        tr(
          "هل تريد إنهاء ولايتك وتوثيق إرثك السياسي؟",
          "End your term and archive your political legacy?",
          "Mettre fin à votre mandat et archiver votre héritage politique ?",
        ),
      )
    )
      return;
    await apply(
      (s) => resignOffice(s),
      tr(
        "انتهت ولايتك وأُرشف سجلها.",
        "Your term ended and its record was archived.",
        "Votre mandat prend fin et son dossier est archivé.",
      ),
    );
  },
  "go-black": async () => {
    navigate("black");
  },
  "black-op": async (el) => {
    const opId = el.dataset.id;
    await apply((s) => {
      const { doOperation } = requireBlack();
      return doOperation(s, opId);
    }, "تم تنفيذ العملية عبر الوسيط.");
  },
  "black-cut": async () => {
    await apply((s) => {
      const { cutMiddlemen } = requireBlack();
      return cutMiddlemen(s);
    }, "تم قطع الوسطاء.");
  },
  "break-clause": async (el) => {
    const playerId = el.dataset.id;
    await apply((s) => {
      const { breakReleaseClause } = requireRelease();
      return breakReleaseClause(s, playerId);
    }, "تم كسر الشرط الجزائي — التفاوض مع اللاعب مباشرة.");
    showContract(`release-${getState().nextId-1}-${playerId}`.replace(/.*release-/, "release-").includes("release-") ? "" : "", false);
    // افتح عقد اللاعب عبر التفاوض الأخير
    const s = getState();
    const last = [...s.negotiations].reverse().find((n) => n.playerId === playerId && n.stage === "personal");
    if (last) showContract(last.id, false);
  },
  "loan-open": async (el) => openModal(loanForm(getState(), el.dataset.id)),
  "loan-out-open": async () =>
    openModal(
      loanForm(getState(), document.getElementById("loan-out-player").value),
    ),
  "loan-review": async (el) => openModal(loanReview(getState(), el.dataset.id)),
  "loan-accept": async (el) => {
    await apply((s) => answerLoan(s, el.dataset.id, true));
    closeModal();
  },
  "loan-reject": async (el) => {
    await apply((s) => answerLoan(s, el.dataset.id, false));
    closeModal();
  },
  "loan-recall": async (el) => apply((s) => recallLoan(s, el.dataset.id)),
  "loan-buy": async (el) => apply((s) => buyLoanOption(s, el.dataset.id)),
  "incoming-loan": async () => {
    const id = document.getElementById("prospect-id").value;
    openModal(loanForm(getState(), id));
  },
  "prospect-report": async () => {
    const id = document.getElementById("prospect-id").value;
    await apply((s) => scoutPlayer(s, id));
  },
  "markets-all": async () => {
    ui.owner = document.getElementById("owner-name")?.value || "";
    ui.leagues =
      ui.setupConfig.database === "world"
        ? [...ALL_MARKETS]
        : ["eg", "en", "sa"];
    render();
  },
  "markets-egypt": async () => {
    ui.owner = document.getElementById("owner-name")?.value || "";
    ui.leagues = ["eg"];
    render();
  },
  "database-info": async () => openModal(databaseView(), true),
  "players-page": async (el) => {
    ui.playerFilters.page = Number(el.dataset.id);
    render();
  },
  "data-sources": async () => openModal(databaseView() + sourcesView(), true),
  "event-choice": async (el) =>
    await apply(
      (s) => resolveClubEvent(s, el.dataset.id, el.dataset.choice),
      "تم تسجيل قرارك.",
    ),
  "retire-prepare": async (el) =>
    await apply(
      (s) => retirementDecision(s, el.dataset.id, "prepare"),
      "تم تسجيل قرارك.",
    ),
  "retire-extend": async (el) =>
    await apply(
      (s) => retirementDecision(s, el.dataset.id, "extend"),
      "تم تسجيل قرارك.",
    ),
  "retire-respect": async (el) =>
    await apply(
      (s) => retirementDecision(s, el.dataset.id, "respect"),
      "تم تسجيل قرارك.",
    ),
  "hire-staff": async (el) =>
    openModal(hireStaffForm(getState(), el.dataset.id)),
  "staff-course": async (el) =>
    openModal(
      `<h2>دورة تطوير</h2><p>${tr("6 نقاط للمهارة الأساسية حتى حد 95. لا تضمن الدورة زيادة المرتب.", "Adds 6 points to the main skill, up to 95. Salary is unchanged.", "Ajoute 6 points à la compétence principale, jusqu’à 95. Salaire inchangé.")}</p><div class="modal-actions">${button(`الموافقة على دورة 21 يومًا مقابل ${money(100000)} ${cur()}`, "confirm-staff-course", el.dataset.id, "primary")}</div>`,
    ),
  "confirm-staff-course": async (el) => {
    await apply((s) => trainStaff(s, el.dataset.id));
    closeModal();
  },
  "staff-dismiss": async (el) =>
    openModal(
      `<h2>إنهاء العقد</h2><p>تعويض الإنهاء: شهران من المرتب.</p><strong>${money(getState().staff.find((p) => p.id === el.dataset.id).salary * 2)} ${cur()}</strong><div class="modal-actions">${button("إنهاء العقد", "confirm-staff-dismiss", el.dataset.id, "primary")}</div>`,
    ),
  "confirm-staff-dismiss": async (el) => {
    await apply((s) => dismissStaff(s, el.dataset.id));
    closeModal();
  },
  "scout-task": async (el) =>
    openModal(scoutTaskForm(getState(), el.dataset.id)),
  "install-guide": async () => openModal(installHelp()),
  "select-club": async (el) => {
    ui.owner = document.getElementById("owner-name")?.value || "";
    ui.leagues = [
      ...document.querySelectorAll('input[name="league"]:checked'),
    ].map((x) => x.value);
    ui.setupClub = el.dataset.id;
    render();
  },
  "start-game": async () => {
    const owner = document.getElementById("owner-name").value,
      leagues = [
        ...document.querySelectorAll('input[name="league"]:checked'),
      ].map((x) => x.value);
    const s = createGame({
      clubId: ui.setupClub,
      owner,
      leagues,
      ...ui.setupConfig,
      language: getLanguage(),
      ownerStory: ui.setupConfig.ownerStory || "selfmade",
    });
    await replaceState(s);
    ui.route = "dashboard";
    render();
    window.scrollTo(0, 0);
    toast("أهلًا بيك. مشروعك بدأ، والحفظ التلقائي شغال.");
  },
  advance: async () => runTime(false),
  resume: async () => runTime(true),
  "match-report": async (el) => {
    const s = getState();
    const f = playedOwnFixtures(s).find((x) => x.id === el.dataset.id);
    if (f) openModal(matchReportModal(s, reportFor(s, f)));
  },
  "palette-open": () => openPalette(),
  "palette-close": () => closePalette(),
  "palette-select": (el) => paletteActivate(Number(el.dataset.idx) || 0),
  "copy-email": async () => {
    try {
      await navigator.clipboard.writeText("Madabeh777@gmail.com");
      toast(
        tr(
          "تم نسخ البريد الإلكتروني.",
          "Email address copied.",
          "E-mail copié.",
        ),
      );
    } catch {
      toast("Madabeh777@gmail.com");
    }
  },
  "wipe-data": async () =>
    openModal(
      `<h2>${tr("مسح كل البيانات المحلية؟", "Wipe all local data?", "Effacer toutes les données locales ?")}</h2><p class="muted">${tr("سيُحذف من هذا المتصفح نهائيًا: الحفظة النشطة، كل خانات الحفظ، والنسخ الاحتياطية. لا يمكن التراجع عن هذه الخطوة.", "Permanently deleted from this browser: the active save, every save slot, and backups. This cannot be undone.", "Suppression définitive sur ce navigateur : sauvegarde active, tous les emplacements et copies. Irréversible.")}</p><div class="modal-actions">${button(tr("مسح نهائي الآن", "Wipe everything now", "Tout effacer"), "wipe-data-confirm", "", "danger")}${button(tr("إلغاء", "Cancel", "Annuler"), "close-modal", "", "secondary")}</div>`,
    ),
  "wipe-data-confirm": async () => {
    document.body.classList.add("saving-game");
    try {
      await discardPendingSave();
      const dbs = ["clubowner.world.saves", "clubowner.slots"];
      await Promise.all(
        dbs.map(
          (name) =>
            new Promise((resolve) => {
              if (!globalThis.indexedDB) return resolve();
              const r = indexedDB.deleteDatabase(name);
              r.onsuccess = r.onerror = r.onblocked = () => resolve();
            }),
        ),
      );
      for (const key of Object.keys(localStorage))
        if (key.startsWith("clubowner")) localStorage.removeItem(key);
    } catch (e) {
      document.body.classList.remove("saving-game");
      showError(e.message);
      return;
    }
    location.reload();
  },
  "onboarding-dismiss": () => {
    hideOnboarding(getState());
    render();
  },
  "save-retry": async () => {
    try {
      await flushSave();
      toast(tr("تم الحفظ.", "Saved.", "Enregistré."));
    } catch (e) {
      showError(e.message);
    }
  },
  "slot-save": async () => {
    const s = getState();
    if (!s) return;
    const name = document.getElementById("slot-name")?.value || "";
    document.body.classList.add("saving-game");
    try {
      await writeSlot(s, name);
      toast("تم حفظ الخانة بمعزل عن الحفظة النشطة.");
    } catch (e) {
      showError(e.message);
    } finally {
      document.body.classList.remove("saving-game");
    }
    render();
  },
  "slot-load": async (el) => {
    const meta = listSlots().find((x) => x.id === el.dataset.id);
    if (!meta) return;
    openModal(
      `<h2>${tr(`تحميل خانة «${meta.name}»؟`, `Load slot “${meta.name}”?`, `Charger l'emplacement « ${meta.name} » ?`)}</h2><p class="muted">${tr(`سيتم استبدال الحفظة النشطة بهذه اللقطة (${meta.clubName} · ${meta.date}).`, `The active save will be replaced by this snapshot (${meta.clubName} · ${meta.date}).`, `La sauvegarde active sera remplacée par cet instantané (${meta.clubName} · ${meta.date}).`)} ${tr("صدّر الحالية أولًا إن أردت الاحتفاظ بنسخة خارجية.", "Export the current one first if you want an external copy.", "Exportez d'abord la sauvegarde actuelle pour une copie externe.")}</p><div class="modal-actions">${button(tr("تحميل واستبدال", "Load and replace", "Charger et remplacer"), "slot-load-confirm", meta.id, "primary")}${button(tr("إلغاء", "Cancel", "Annuler"), "close-modal", "", "secondary")}</div>`,
    );
  },
  "slot-load-confirm": async (el) => {
    document.body.classList.add("saving-game");
    let state = null;
    try {
      state = await readSlot(el.dataset.id);
      await replaceState(state);
    } catch (e) {
      document.body.classList.remove("saving-game");
      showError(e.message);
      return;
    }
    document.body.classList.remove("saving-game");
    setLanguage(state.preferences?.language || getLanguage());
    closeModal();
    // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة.
    location.reload();
  },
  "slot-delete": async (el) => {
    try {
      await deleteSlot(el.dataset.id);
      toast("حُذفت الخانة.");
    } catch (e) {
      showError(e.message);
    }
    render();
  },
  "open-message": async (el) => {
    const dynastyDecision = getState().inbox.some(
      (message) =>
        message.id === el.dataset.id &&
        ["dynasty-event", "dynasty-retirement"].includes(message.kind),
    );
    await apply((s) => {
      const m = s.inbox.find((m) => m.id === el.dataset.id);
      if (m) m.read = true;
    });
    if (dynastyDecision) {
      navigate("dynasty");
      return;
    }
    ui.message = el.dataset.id;
    ui.route = "inbox";
    ui.inboxFilter = "all";
    render();
    if (innerWidth < 760)
      document
        .querySelector(".message-detail")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  },
  "inbox-filter": async (el) => {
    ui.inboxFilter = el.dataset.id;
    ui.message = null;
    render();
  },
  "read-all": async () =>
    await apply(
      (s) => s.inbox.forEach((m) => (m.read = true)),
      "تم تعليم كل الرسائل كمقروءة. القرارات المطلوبة ما زالت نشطة.",
    ),
  resolve: async (el) => {
    await apply((s) => resolveInfo(s, el.dataset.id), "تم تسجيل قرارك.");
  },
  "go-finance": async (el) => {
    navigate("finance");
    toast("راجع التمويل، ثم عُد للبريد لتأكيد التعامل مع تنبيه السيولة.");
  },
  "club-open": async (el) => {
    ui.clubClub = el.dataset.id;
    render();
    document
      .querySelector(".club-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  },
  "player-detail": async (el) => showPlayer(el.dataset.id),
  "transfer-offer": async (el) => {
    const s = getState(),
      p = s.players.find((p) => p.id === el.dataset.id);
    openModal(offerForm(s, p));
    updateCalculations();
  },
  "request-player-transfer": async (el) => {
    await apply((s) => requestPlayerTransfer(s, el.dataset.id));
    const s = getState(),
      p = s.players.find((item) => item.id === el.dataset.id);
    if (p) openModal(playerDetail(s, p));
  },
  "start-player-auction": async (el) => {
    const auction = await apply((s) => startPlayerAuction(s, el.dataset.id));
    if (auction) openModal(saleAuctionView(getState(), auction.id), true);
  },
  "sale-auction-detail": async (el) =>
    openModal(saleAuctionView(getState(), el.dataset.id), true),
  "sale-negotiate": async (el) =>
    openModal(saleNegotiationView(getState(), el.dataset.id), true),
  "sale-accept": async (el) => {
    const result = await apply((s) => acceptSaleOffer(s, el.dataset.id));
    closeModal();
    if (result?.status === "sold")
      toast(tr("تمت الصفقة وفق الشروط المتفق عليها.", "Sale completed on the agreed terms.", "Vente conclue selon les conditions convenues."));
  },
  "sale-reject": async (el) => {
    await apply((s) => rejectSaleOffer(s, el.dataset.id));
    closeModal();
  },
  "player-exchange-builder": async () => {
    const opponentId = document.getElementById("player-exchange-opponent")?.value;
    if (opponentId)
      openModal(playerExchangeView(getState(), opponentId), true);
  },
  "exchange-auto-balance": (el) => {
    const form = el.closest("#player-exchange-form");
    if (form) updateExchangeBuilder(form, true);
  },
  "player-exchange-view": async (el) =>
    openModal(playerExchangeDealView(getState(), el.dataset.id), true),
  "player-exchange-accept": async (el) => {
    const id = el.dataset.id;
    const result = await apply((s) => completePlayerExchange(s, id));
    if (result?.status === "completed") {
      closeModal();
      toast(tr("اكتمل تبادل اللاعبين بنجاح.", "The player exchange was completed.", "L’échange de joueurs est terminé."));
    } else {
      openModal(playerExchangeDealView(getState(), id), true);
    }
  },
  "player-exchange-reject": async (el) => {
    await apply((s) => rejectPlayerExchange(s, el.dataset.id));
    closeModal();
  },
  "accept-club": async (el) => {
    // 0.46: قرار لا رجعة فيه (نجم أو ملايين) يحتاج تأكيدًا صريحًا قبل التنفيذ.
    const st = getState();
    const neg = st?.negotiations.find((x) => x.id === el.dataset.id);
    const warn = neg
      ? irreversibleWarning(st, {
          player: st.players.find((x) => x.id === neg.playerId),
          fee: neg.counter || 0,
        })
      : null;
    if (warn && !el.dataset.confirmed) {
      openModal(
        irreversibleModal({
          title: tr("تأكيد الصفقة", "Confirm the deal", "Confirmer le transfert"),
          warning: warn,
          action: "accept-club",
          id: el.dataset.id,
        }),
      );
      return;
    }
    closeModal();
    await apply(
      (s) => acceptClub(s, el.dataset.id),
      "تم الاتفاق مع النادي. باقي عقد اللاعب.",
    );
    showContract(el.dataset.id);
  },
  "reject-transfer": async (el) => {
    await apply(
      (s) => rejectNegotiation(s, el.dataset.id),
      "تم إنهاء التفاوض بدون خصم أموال.",
    );
  },
  "player-contract": async (el) => showContract(el.dataset.id),
  "renew-player": async (el) => showContract(el.dataset.id, true),
  "release-break-salary": async (el) => {
    await apply(
      (s) => BlackService.counterReleaseClauseBreak(s, el.dataset.id, "salary"),
      tr(
        "تم رفع الراتب وتحصين اللاعب من كسر الشرط الجزائي 🛡️",
        "Salary raised and player protected from the release clause break 🛡️",
        "Salaire augmenté et joueur protégé contre l'activation de la clause 🛡️",
      ),
    );
  },
  "release-break-renew": async (el) => {
    await apply(
      (s) => BlackService.counterReleaseClauseBreak(s, el.dataset.id, "renew"),
      tr(
        "تم تجديد العقد وتحصين اللاعب من كسر الشرط الجزائي 🛡️",
        "Contract renewed and player protected from the release clause break 🛡️",
        "Contrat prolongé et joueur protégé contre l'activation de la clause 🛡️",
      ),
    );
  },
  "release-break-clause": async (el) => {
    await apply(
      (s) => BlackService.counterReleaseClauseBreak(s, el.dataset.id, "clause"),
      tr(
        "تم رفع الشرط الجزائي وإحباط محاولة الكسر 🛡️",
        "Release clause raised and break attempt foiled 🛡️",
        "Clause libératoire relevée et tentative d'activation déjouée 🛡️",
      ),
    );
  },
  "facility-detail": async (el) =>
    openModal(facilityDetail(getState(), el.dataset.id)),
  "toggle-staff": async (el) => {
    await apply(
      (s) => toggleFacilityStaff(s, el.dataset.id),
      "تم تحديث طاقم المنشأة.",
    );
    openModal(facilityDetail(getState(), el.dataset.id));
  },
  "sponsor-offers": async (el) => showOffers(el.dataset.id),
  "sponsor-detail": async (el) =>
    openModal(sponsorDetail(getState(), el.dataset.id)),
  "confirm-sponsor": async (el) => {
    const s = getState(),
      offer = offersFor(s, el.dataset.asset).find(
        (o) => o.sponsorId === el.dataset.id,
      ),
      sp = resolveSponsor(offer.sponsorId),
      asset = ASSETS.find((x) => x.id === offer.assetId);
    openModal(
      `<span class="eyebrow">قبل الالتزام</span><h2>${sp.name} × ${asset.name}</h2><p class="muted">عقد 360 يومًا بقيمة ${money(offer.amount)} ${cur()}، ومقدم ${money(Math.floor(offer.amount * 0.25))} ${cur()}. تشمل مكافآت أداء موحدة تُصرف تلقائيًا.</p><div class="effect-card"><h4>الحقوق والالتزامات</h4><p>سيتم حجز ${asset.name} طوال مدة العقد. ${offer.exclusive ? "العقد حصري لقطاع " + sp.sector + "؛ يمنع التعاقد مع منافس في نفس القطاع." : "بدون حصرية قطاع؛ مساحة الإعلان نفسها محجوزة لهذا الشريك فقط."}</p><small>الباقي على 11 دفعة متساوية تقريبًا كل 30 يومًا. الفسخ المبكر غير متاح في هذه النسخة.</small></div><div class="modal-actions"><button class="btn primary" data-action="sign-sponsor" data-id="${sp.id}" data-asset="${asset.id}">توقيع العقد واستلام المقدم ${icon("check", 17)}</button></div>`,
    );
  },
  "sign-sponsor": async (el) => {
    await apply((s) => {
      const offer = offersFor(s, el.dataset.asset).find(
        (o) => o.sponsorId === el.dataset.id,
      );
      signSponsor(s, offer);
      markStep(s, "sponsor");
    }, "تم توقيع الرعاية وإيداع المقدم في الخزينة.");
    closeModal();
  },
  "negotiate-sponsor": async (el) =>
    openModal(sponsorNegotiate(getState(), el.dataset.asset, el.dataset.id)),
  "sponsor-demand": async (el) => {
    let deal = null;
    await apply((s) => {
      deal = negotiateSponsor(
        s,
        el.dataset.asset,
        el.dataset.id,
        Number(el.dataset.raise),
      );
    });
    if (deal) openModal(sponsorDealResult(getState(), deal));
  },
  "sign-sponsor-deal": async (el) => {
    await apply((s) => {
      const offer = answerSponsorDeal(s, el.dataset.id, true);
      signSponsor(s, offer);
    }, "تم توقيع الرعاية بالقيمة المتفاوض عليها وإيداع المقدم.");
    closeModal();
  },
  "finance-tab": async (el) => {
    ui.financeTab = el.dataset.id;
    render();
  },
  "staff-tab": async (el) => {
    ui.staffTab = el.dataset.id;
    render();
  },
  "staff-neg-start": async (el) =>
    apply((s) => startNegotiation(s, el.dataset.id), tr("بدأ التفاوض — 3 جولات.", "Negotiation started — 3 rounds.", "Négociation lancée — 3 tours.")),
  "staff-neg-cancel": async () =>
    apply((s) => cancelNegotiation(s)),
  "staff-fire": async (el) =>
    apply((s) => fireEmployee(s, el.dataset.id), tr("أُنهي العقد.", "Contract terminated.", "Contrat résilié.")),
  "staff-renew": async (el) =>
    apply((s) => renewEmployee(s, el.dataset.id, 2, 5), tr("جُدد العقد سنتين.", "Renewed for 2 years.", "Renouvelé pour 2 ans.")),
  "staff-promote": async (el) =>
    apply((s) => promoteEmployee(s, el.dataset.id), tr("تمت الترقية.", "Promoted.", "Promotion accordée.")),
  "staff-raise": async (el) =>
    apply((s) => raiseEmployee(s, el.dataset.id, 10), tr("تمت الزيادة.", "Raise granted.", "Augmentation accordée.")),
  "staff-poach": async (el) =>
    apply((s) => respondPoach(s, el.dataset.id, el.dataset.how)),
  "staff-req": async (el) =>
    apply((s) => resolveMeetingRequest(s, el.dataset.id, el.dataset.how === "yes")),
  "staff-hq-up": async () =>
    apply((s) => startHqUpgrade(s), tr("بدأ بناء المقر.", "HQ construction started.", "Chantier du siège lancé.")),
  "staff-legal-act": async (el) =>
    apply((s) => resolveLegalCase(s, el.dataset.id, el.dataset.how)),
  "staff-phil": async (el) =>
    apply((s) => setPhilosophy(s, el.dataset.id)),
  "staff-deal": async (el) =>
    apply((s) => resolveDeal(s, el.dataset.id, el.dataset.how === "yes")),
  "staff-social-content": async (el) =>
    apply((s) => publishContent(s, el.dataset.id)),
  "staff-social-derby": async () =>
    apply(derbyCampaign),
  "staff-social-crisis": async (el) =>
    apply((s) => resolveCrisis(s, el.dataset.how)),
  "world-tab": async (el) => {
    ui.worldTab = el.dataset.id;
    render();
  },
  "loan-modal": async () =>
    openModal(
      `<span class="eyebrow">تمويل تجريبي ثابت</span><h2>مساحة أكبر للسيولة… والتزام جديد</h2><div class="profile-stats"><div><small>المبلغ المستلم</small><strong>5 ملايين ${cur()}</strong></div><div><small>إجمالي السداد</small><strong>5٫4 مليون ${cur()}</strong></div><div><small>الدفعة كل 30 يومًا</small><strong>450 ألف ${cur()}</strong></div></div><p class="muted">12 دفعة تشمل تكلفة تمويل ثابتة 400 ألف جنيه. حد أقصى قرضان خلال الحفظة التجريبية. لا يتضمن نموذج فائدة مركبة أو شروط بنك حقيقي.</p>${infoNote("التمويل مش إيراد تشغيلي. القسط بيتسدد تلقائيًا حتى لو أدى لعجز في السيولة.")}<div class="modal-actions">${button("اعتماد التمويل", "take-loan", "", "primary")}</div>`,
    ),
  "take-loan": async () => {
    await apply(takeLoan, "تم إيداع التمويل وجدولة الأقساط.");
    closeModal();
  },
  "ticket-price": async () => {
    const s = getState(),
      prices = categoryPrices(s);
    openModal(
      `<h2>تسعير تذاكر المباريات</h2><p class="muted">السعر الأعلى يرفع العائد لكل مشجع، لكنه يقلل الطلب. المقصورة أقل تأثرًا بالغلاء من العادية. أصحاب الاشتراكات يشغلون مقاعد العادية أولًا ولا يُحصّلون مرتين.</p><form id="ticket-form"><div class="form-grid"><label class="field"><span>العادية (70% من السعة)</span><input type="number" name="price" value="${s.ticketPrice}" min="50" max="500" required></label><label class="field"><span>الأولى (20% · 40–2000)</span><input type="number" name="first" value="${prices.first}" min="40" max="2000" required></label><label class="field"><span>المقصورة (10% · 100–5000)</span><input type="number" name="vip" value="${prices.vip}" min="100" max="5000" required></label><label class="field"><span>علاوة المباراة البيتية القادمة</span><select name="premium"><option value="0">بدون علاوة</option><option value="25">+25% مباراة كبيرة</option><option value="50">+50% قمة</option><option value="100">+100% ديربي ناري</option></select></label></div><div class="modal-actions"><button type="submit" class="btn primary">حفظ أسعار التذاكر</button></div></form>`,
    );
  },
  // 0.53 hotfix «زرار المليار»: نافذة مبلغ حر (من 1 حتى مليار) ترفع السقف فورًا.
  "wage-budget-raise": async () => {
    openModal(wageRaiseModal(getState()));
    updateCalculations();
  },
  "wage-raise-quick": async (el) => {
    const input = document
      .getElementById("wage-raise-form")
      ?.querySelector("input[name=amount]");
    if (input) {
      input.value = el.dataset.id;
      updateCalculations();
    }
  },
  // 0.52 — «أوافق كمالك!»: تجاوز سقف الرواتب فورًا، إضافة بحتة بلا أي عقوبة.
  "wage-override-approve": async () => {
    const { approveOwnerWageOverride } = await import("./services/wageOverride.js");
    await apply(
      (s) => approveOwnerWageOverride(s),
      tr(
        "أوافق كمالك! سقف الرواتب ارتفع فورًا.",
        "I approve as owner! The wage cap rose at once.",
        "J’approuve en tant que propriétaire ! Le plafond a été relevé aussitôt.",
      ),
    );
  },
  "export-save": async () => {
    await exportGame(getState());
    toast("تم تجهيز ملف الحفظ للتنزيل.");
  },
  "import-save": chooseImport,
  "confirm-import": async () => {
    if (!pendingImport) return;
    await replaceState(pendingImport);
    setLanguage(pendingImport.preferences.language);
    pendingImport = null;
    closeModal();
    ui.route = "dashboard";
    render();
    toast("تم استيراد الحفظة.");
  },
  "new-game": async () =>
    openModal(
      `<h2>تبدأ حكاية جديدة؟</h2><p class="muted">الحفظة الجديدة هتستبدل الحالية عند بدء اللعب. صدّر الحالية لو حابب ترجع لها.</p><div class="modal-actions">${button("تصدير الحالية", "export-save", "", "secondary")}${button("اختيار نادي جديد", "confirm-new", "", "danger")}</div>`,
    ),
  "confirm-new": async () => {
    closeModal();
    setState(null);
    render();
    window.scrollTo(0, 0);
  },
  "modal-inbox": async () => navigate("inbox"),
  "empire-tab": async (el) => {
    ui.empireTab = el.dataset.tab || "wealth";
    render();
  },
  "city-build": async (el) => apply((s) => buildCityFacility(s, el.dataset.id), tr("بُنيت المنشأة.", "Facility built.", "Installation construite.")),
  "city-old": async (el) => apply((s) => chooseOldGround(s, el.dataset.id), tr("تقرر مصير الملعب القديم.", "Old ground allocated.", "Ancien stade réaffecté.")),
  "city-name": async (el) => apply((s) => nameStadium(s, el.dataset.id), tr("حُسمت حقوق الاسم.", "Naming rights settled.", "Droits de dénomination attribués.")),
  "empire-buy-asset": async (el) => {
    const { buyAsset } = await import("./services/empire/assets.js");
    await apply(
      (s) => buyAsset(s, el.dataset.id),
      "تم شراء الأصل وإضافته إلى إمبراطوريتك.",
    );
  },
  "empire-sell-asset": async (el) => {
    const { sellAsset } = await import("./services/empire/assets.js");
    // 0.46: بيع أصل بملايين لا رجعة فيه: تأكيد أولًا.
    const st = getState();
    const owned = st?.empire?.assets?.find((a) => a.id === el.dataset.id);
    const warn = owned ? irreversibleWarning(st, { fee: owned.sellValue || 0 }) : null;
    if (warn && !el.dataset.confirmed) {
      openModal(
        irreversibleModal({
          title: tr("تأكيد بيع الأصل", "Confirm the sale", "Confirmer la vente"),
          warning: warn,
          action: "empire-sell-asset",
          id: el.dataset.id,
        }),
      );
      return;
    }
    closeModal();
    await apply(
      (s) => sellAsset(s, el.dataset.id),
      "تم بيع الأصل وإضافة قيمته إلى ثروتك.",
    );
  },
  "empire-propose": async (el) => {
    const { propose } = await import("./services/empire/family.js");
    await apply((s) => propose(s, el.dataset.id), "تمت الخطوبة بنجاح.");
  },
  "empire-marry": async (el) => {
    const { marry } = await import("./services/empire/family.js");
    await apply((s) => marry(s, el.dataset.id), "تم الفرح. عقبال المئة سنة.");
  },
  "empire-gift": async (el) => {
    const { giveGift } = await import("./services/empire/family.js");
    await apply((s) => giveGift(s, el.dataset.id), "وصلت الهدية وأسعدت البيت.");
  },
  "empire-divorce": async (el) => {
    const { divorce } = await import("./services/empire/family.js");
    await apply((s) => divorce(s), "تم الطلاق ودُفعت التسوية.");
  },
  "empire-invest": async (el) => {
    const { invest } = await import("./services/empire/investments.js");
    const amount = Math.round(
      Number(document.getElementById("inv-amt-" + el.dataset.id)?.value),
    );
    await apply((s) => invest(s, el.dataset.id, amount), "تم استثمار المبلغ.");
  },
  "empire-withdraw": async (el) => {
    const { withdraw } = await import("./services/empire/investments.js");
    const amount = Math.round(
      Number(document.getElementById("inv-amt-" + el.dataset.id)?.value),
    );
    await apply((s) => withdraw(s, el.dataset.id, amount), "تم سحب المبلغ إلى ثروتك.");
  },
  "empire-donate": async () => {
    const { donatePersonal } = await import("./services/empire/charity.js");
    const amount = Math.round(Number(document.getElementById("charity-amt")?.value));
    await apply((s) => donatePersonal(s, amount), "تم التبرع وارتفعت سمعتك.");
  },
  "empire-charity-project": async (el) => {
    const { startCharityProject } = await import("./services/empire/charity.js");
    await apply(
      (s) => startCharityProject(s, el.dataset.id),
      "بدأ العمل في مشروعك الخيري.",
    );
  },
  // ── الهدايا 0.46: العطاء يُكافأ والمنع لا يُعاقب ──
  "gift-grant-personal": async () => {
    const { grantPersonal } = await import("./services/gifts.js");
    const playerId = document.getElementById("grant-player")?.value;
    const amount = Math.round(Number(document.getElementById("grant-amount")?.value));
    await apply(
      (s) => grantPersonal(s, playerId, amount),
      tr("سُجلت المنحة في دفاتر النادي وارتفعت معنويات اللاعب.", "The grant is recorded in the club ledger and the player's morale rose.", "La prime est enregistrée au registre et le moral du joueur a monté."),
    );
  },
  "gift-grant-squad": async () => {
    const { grantSquad } = await import("./services/gifts.js");
    const amount = Math.round(Number(document.getElementById("squad-amount-choice")?.value));
    await apply(
      (s) => grantSquad(s, amount),
      tr("منحة جماعية وزعت على القائمة كاملة.", "A squad-wide grant was shared with everyone.", "Une prime collective a été partagée avec tout le monde."),
    );
  },
  "gift-promote": async () => {
    const { promotePlayer } = await import("./services/gifts.js");
    const playerId = document.getElementById("promote-player")?.value;
    const titleId = document.getElementById("promote-title")?.value;
    const raisePct = Number(document.getElementById("promote-raise")?.value || 0);
    await apply(
      (s) => promotePlayer(s, playerId, titleId, raisePct),
      tr("لقب جديد وحامل جديد — الولاء ارتفع.", "A new title with a new holder — loyalty rose.", "Un nouveau titre et un nouveau porteur — la loyauté a monté."),
    );
  },
  "gift-player-value": async (el) => {
    const { givePlayerValueGift } = await import("./services/gifts.js");
    const playerId = document.getElementById("gift-player")?.value;
    await apply(
      (s) => givePlayerValueGift(s, playerId, el.dataset.id),
      tr("وصلت الهدية من ثروتك الشخصية.", "The gift arrived from your personal fortune.", "Le cadeau est arrivé de votre fortune personnelle."),
    );
  },
  "gift-player-cash": async () => {
    const { givePlayerCash } = await import("./services/gifts.js");
    const playerId = document.getElementById("gift-player")?.value;
    const amount = Math.round(Number(document.getElementById("gift-cash")?.value));
    await apply(
      (s) => givePlayerCash(s, playerId, amount),
      tr("الهدية المالية وصلت من ثروتك الشخصية.", "The cash gift arrived from your personal fortune.", "Le cadeau en espèces est arrivé de votre fortune."),
    );
  },
  // خط الغرباء 🔥: تأكيد صريح قبل أي هدية تُحسب رشوة.
  "gift-stranger-press": async () => {
    const { giftStranger } = await import("./services/gifts.js");
    const amount = Math.round(Number(document.getElementById("stranger-press-amount")?.value));
    openGiftStrangerConfirm("journalist", amount, null);
  },
  "gift-stranger-official": async () => {
    const { giftStranger } = await import("./services/gifts.js");
    const target = document.getElementById("stranger-official-target")?.value;
    const amount = Math.round(Number(document.getElementById("stranger-official-amount")?.value));
    openGiftStrangerConfirm("official", amount, target);
  },
  // ── الفروع 0.47: فتح وترقية ومديرون وقرارات إضافة بحتة ──
  "branch-open": async () => {
    const { openBranch } = await import("./services/branches.js");
    const country = document.getElementById("branch-country")?.value;
    await apply(
      (s) => openBranch(s, country),
      tr("مشروع الفرع بدأ — الاستلام في موعده المعلن.", "The branch project began — delivery on the stated date.", "Le projet de branche a commencé — livraison à la date annoncée."),
    );
  },
  "branch-upgrade": async (el) => {
    const { upgradeBranch } = await import("./services/branches.js");
    await apply(
      (s) => upgradeBranch(s, el.dataset.id),
      tr("مشروع الترقية بدأ.", "The upgrade project began.", "Le projet d'amélioration a commencé."),
    );
  },
  // المعجل ⚡ 0.48: فوري بسعر أعلى معلن — لا انتظار إجباري في أي مسار.
  "branch-open-instant": async () => {
    const { openBranch } = await import("./services/branches.js");
    const country = document.getElementById("branch-country")?.value;
    await apply(
      (s) => openBranch(s, country, { instant: true }),
      tr("دُفع المعجل ⚡: الفرع يعمل من الآن.", "The accelerator was paid ⚡: the branch works right away.", "L'accélérateur a été payé ⚡ : la branche fonctionne aussitôt."),
    );
  },
  "branch-upgrade-instant": async (el) => {
    const { upgradeBranch } = await import("./services/branches.js");
    await apply(
      (s) => upgradeBranch(s, el.dataset.id, { instant: true }),
      tr("دُفع المعجل ⚡: الترقية اكتملت فورًا.", "The accelerator was paid ⚡: the upgrade is done at once.", "L'accélérateur a été payé ⚡ : l'amélioration est terminée."),
    );
  },
  "branch-hire-manager": async (el) => {
    const { hireBranchManager } = await import("./services/branches.js");
    const pickId = document.getElementById(`branch-mgr-${el.dataset.id}`)?.value;
    await apply(
      (s) => hireBranchManager(s, el.dataset.id, pickId),
      tr("مدير الكفاءة تولى عمله.", "The efficiency manager took over.", "Le directeur d'efficacité a pris ses fonctions."),
    );
  },
  "branch-fire-manager": async (el) => {
    const { fireBranchManager } = await import("./services/branches.js");
    await apply(
      (s) => fireBranchManager(s, el.dataset.id),
      tr("انتهى تكليف مدير الفرع.", "The branch manager was dismissed.", "Le directeur de la branche a été renvoyé."),
    );
  },
  "branch-decide": async (el) => {
    const { applyBranchDecision } = await import("./services/branches.js");
    await apply(
      (s) => applyBranchDecision(s, el.dataset.id),
      tr("التعزيز يعمل الآن.", "The boost is now live.", "Le renfort est désormais actif."),
    );
  },
  "branch-sign": async (el) => {
    const { signBranchCandidate } = await import("./services/branches.js");
    await apply(
      (s) => signBranchCandidate(s, el.dataset.id),
      tr("انضم الناشئ إلى فريقك الأول.", "The prospect joined your first team.", "Le jeune a rejoint votre équipe première."),
    );
  },
  "branch-sell": async (el) => {
    const { sellBranchCandidate } = await import("./services/branches.js");
    await apply(
      (s) => sellBranchCandidate(s, el.dataset.id),
      tr("بيع الناشئ وسُجل في الدفاتر.", "The prospect was sold and recorded in the ledger.", "Le jeune a été vendu et enregistré au registre."),
    );
  },
  "branch-release": async (el) => {
    const { releaseBranchCandidate } = await import("./services/branches.js");
    await apply(
      (s) => releaseBranchCandidate(s, el.dataset.id),
      tr("أُطلق الناشئ — بلا أي عقوبة.", "The prospect was released — with no penalty at all.", "Le jeune a été libéré — sans aucune pénalité."),
    );
  },
  "gift-stranger-confirm": async (el) => {
    const [kind, amountRaw, target] = String(el.dataset.id).split(":");
    const { giftStranger } = await import("./services/gifts.js");
    await apply(
      (s) => giftStranger(s, kind, Number(amountRaw), target || null),
      tr("سُجلت الهدية على الخط الأحمر — والشبهات ارتفعت.", "The gift is recorded on the red line — suspicion rose.", "Le cadeau est enregistré sur la ligne rouge — les soupçons ont monté."),
    );
    closeModal();
  },
  "betting-buy": async (el) => {
    const { buyBettingCompany } = await import("./services/betting/state.js");
    await apply((s) => buyBettingCompany(s, el.dataset.id), tr("اشتريت شركة مراهنات.", "Betting company acquired.", "Société de paris acquise."));
  },
  "betting-found": async (el) => {
    const { foundBettingCompany } = await import("./services/betting/state.js");
    await apply((s) => foundBettingCompany(s, el.dataset.tier), tr("تأسست شركتك الجديدة.", "Your new company was founded.", "Votre nouvelle société a été fondée."));
  },
  "betting-upgrade-license": async (el) => {
    const { upgradeLicense } = await import("./services/betting/state.js");
    await apply((s) => upgradeLicense(s, el.dataset.tier), tr("تمت ترقية الترخيص.", "Licence upgraded.", "Licence améliorée."));
  },
  "betting-up-branch": async () => {
    const { upgradeBranches } = await import("./services/betting/state.js");
    await apply((s) => {
      const b = s.betting;
      if (!b) throw new Error("لا شركة");
      return upgradeBranches(s, b.branches + 1);
    }, tr("تمت توسعة الفروع.", "Branches expanded.", "Agences étendues."));
  },
  "betting-up-online": async () => {
    const { upgradeOnline } = await import("./services/betting/state.js");
    await apply((s) => {
      const b = s.betting;
      if (!b) throw new Error("لا شركة");
      return upgradeOnline(s, b.onlineLevel + 1);
    }, tr("تم تطوير المنصة.", "Platform upgraded.", "Plateforme améliorée."));
  },
  "betting-marketing-slide": async (el) => {
    const v = document.getElementById("betting-marketing-val");
    if (v) v.textContent = `${money(Number(el.value))} ${cur()}`;
  },
  "betting-save-marketing": async (el) => {
    const val = Number(document.getElementById("betting-marketing")?.value);
    const { setMarketingSpend } = await import("./services/betting/state.js");
    await apply((s) => setMarketingSpend(s, val), tr("تم تحديث الإنفاق التسويقي.", "Marketing updated.", "Marketing mis à jour."));
  },
  "betting-buy-competitor": async (el) => {
    const { buyCompetitor } = await import("./services/betting/management.js");
    await apply((s) => buyCompetitor(s, el.dataset.id), tr("تم الاستحواذ على المنافس.", "Competitor acquired.", "Concurrent acquis."));
  },
  "betting-responsible": async (el) => {
    const { setResponsibleLevel } = await import("./services/betting/compliance.js");
    await apply((s) => setResponsibleLevel(s, Number(el.dataset.level)), tr("تم تحديث اللعب المسؤول.", "Responsible gaming updated.", "Jeu responsable mis à jour."));
  },
  "betting-insider": async () => {
    const amt = Math.round(Number(document.getElementById("betting-insider-amount")?.value) || 0);
    const risk = Math.round(Number(document.getElementById("betting-risk")?.value) || 0);
    const { placeInsiderBet } = await import("./services/betting/insider.js");
    await apply((s) => placeInsiderBet(s, amt, risk), tr("تم رهن داخلي بانتظار المباراة.", "Insider bet placed, awaiting match.", "Pari d'initié placé, en attente du match."));
  },
  "betting-risk-slide": async (el) => {
    const risk = Number(el.value) || 0;
    const mult = (1.2 + (risk/100)*4).toFixed(1);
    const detect = Math.round((0.04 + (risk/100)*0.58)*100);
    const rv = document.getElementById("betting-risk-val");
    const mv = document.getElementById("betting-mult-val");
    const dv = document.getElementById("betting-detect-val");
    if (rv) rv.textContent = risk + "%";
    if (mv) mv.textContent = mult + "×";
    if (dv) dv.textContent = "~" + detect + "%";
  },
  "betting-sponsor-toggle": async () => {
    const { sponsorLeagueToggle } = await import("./services/betting/conflict.js");
    await apply((s) => sponsorLeagueToggle(s, !s.betting.sponsorLeague), tr("تم تحديث رعاية الدوري.", "League sponsorship updated.", "Parrainage de ligue mis à jour."));
  },
  "betting-regulate": async (el) => {
    const { regulateBettingMarket } = await import("./services/betting/conflict.js");
    await apply((s) => regulateBettingMarket(s, el.dataset.mode), tr("تم تحديث التشريع.", "Regulation updated.", "Réglementation mise à jour."));
  },
  more: async () =>
    openModal(
      `<h2>إدارة النادي</h2>${NAV_GROUPS.map(
        (g) =>
          `<div class="more-group"><small>${g.caption}</small><div class="more-grid">${g.items
            .map(
              (id) =>
                `<button data-nav="${id}" class="${ui.route === id ? "active" : ""}" ${ui.route === id ? 'aria-current="page"' : ""}>${icon(NAV_BY_ID[id].icon, 24)}<span>${navLabel(id)}</span></button>`,
            )
            .join("")}</div></div>`,
      ).join("")}<div class="more-foot"><span data-no-translate>EMPIRE FC</span><button type="button" class="badge vault-key" data-action="secret-vault">v${APP_VERSION}</button></div>`,
    ),
    "open-auth-modal": () => openModal(authModalContent("login")),
  "auth-tab-login": () => openModal(authModalContent("login")),
  "auth-tab-register": () => openModal(authModalContent("register")),
  "cloud-logout": async () => {
    await authLogout();
    toast("تم تسجيل الخروج بنجاح.");
    render();
  },
  "cloud-sync-now": async () => {
    if (!isAuthenticated()) {
      openModal(authModalContent("login"));
      return;
    }
    const s = getState();
    if (!s) {
      toast("لا توجد مسيرة نشطة حاليًا للمزامنة.");
      return;
    }
    try {
      toast("جارٍ رفع الحفظة إلى السحابة…");
      await uploadSaveToCloud(s);
      toast("تمت المزامنة السحابية بنجاح!");
      render();
    } catch (err) {
      showError(err.message || "تعذر إتمام المزامنة السحابية.");
    }
  },
  "cloud-restore-prompt": async () => {
    if (!isAuthenticated()) {
      openModal(authModalContent("login"));
      return;
    }
    try {
      toast("جارٍ فحص الحفظات على السحابة…");
      const save = await fetchLatestCloudSave();
      if (!save) {
        openModal(`<h2>المزامنة السحابية</h2><p class="muted">لا توجد أي حفظة سحابية مسجلة لحسابك حتى الآن. يمكنك مزامنة ناديك الحالي أولًا.</p><div class="modal-actions">${button("حسنًا", "close-modal", "", "primary")}</div>`);
        return;
      }
      const local = getState();
      const diff = compareCloudWithLocal(local, save);
      openModal(`
        <span class="eyebrow">المزامنة السحابية</span>
        <h2>استرجاع الحفظة السحابية؟</h2>
        <p class="muted">سيتم استبدال الحفظة النشطة على جهازك بالنسخة المحفوظة سحابيًا.</p>
        <div class="cloud-diff-grid">
          <div class="cloud-diff-col">
            <h4>الحفظة المحلية الحالية</h4>
            <div><span>النادي:</span><b>${diff?.local ? diff.local.clubName : "لا توجد"}</b></div>
            <div><span>الموسم:</span><b>${diff?.local ? diff.local.season : "—"}</b></div>
            <div><span>التاريخ:</span><b>${diff?.local ? date(diff.local.date) : "—"}</b></div>
            <div><span>السيولة:</span><b>${diff?.local ? money(diff.local.cash) + " " + cur() : "—"}</b></div>
          </div>
          <div class="cloud-diff-col">
            <h4>الحفظة على السحابة</h4>
            <div><span>النادي:</span><b>${diff.cloud.clubName}</b></div>
            <div><span>الموسم:</span><b>${diff.cloud.season}</b></div>
            <div><span>التاريخ:</span><b>${date(diff.cloud.date)}</b></div>
            <div><span>السيولة:</span><b>${money(diff.cloud.cash)} ${cur()}</b></div>
            <div><span>الجهاز:</span><b>${diff.cloud.device || "متصفح"}</b></div>
          </div>
        </div>
        <div class="modal-actions">
          ${button("استرجاع الحفظة ومتابعة اللعب", "confirm-cloud-restore", save.id, "primary")}
          ${button("إلغاء", "close-modal", "", "ghost")}
        </div>
      `);
    } catch (err) {
      showError(err.message || "تعذر جلب الحفظة من السحابة.");
    }
  },
  "confirm-cloud-restore": async (btn) => {
    const saveId = btn?.dataset?.id;
    try {
      closeModal();
      toast("جارٍ تنزيل واسترجاع الحفظة…");
      const { state } = await downloadCloudSave(saveId);
      await replaceState(state);
      setLanguage(state.preferences.language);
      ui.route = "dashboard";
      render();
      toast("تم استرجاع ناديك من السحابة بنجاح!");
    } catch (err) {
      showError(err.message || "تعذر فك واستعادة الحفظة السحابية.");
    }
  },
  "cloud-saves-list": async () => {
    if (!isAuthenticated()) {
      openModal(authModalContent("login"));
      return;
    }
    try {
      toast("جارٍ جلب سجل الحفظات…");
      const saves = await listCloudSaves();
      if (!saves.length) {
        openModal(`<h2>سجل الحفظات السحابية</h2><p class="muted">لا توجد حفظات سحابية مسجلة بعد.</p><div class="modal-actions">${button("إغلاق", "close-modal", "", "primary")}</div>`);
        return;
      }
      openModal(`
        <h2>سجل الحفظات السحابية</h2>
        <p class="muted">يتم الاحتفاظ بآخر 5 حفظات لحسابك تلقائيًا. يمكنك استرجاع أي نسخة أو حذفها.</p>
        <div class="cloud-saves-container">
          ${saves.map(s => `
            <div class="cloud-save-item">
              <div class="cloud-save-info">
                <strong>${s.metadata.clubName} · الموسم ${s.metadata.seasonNumber}</strong>
                <small>${date(s.metadata.date)} · السيولة ${money(s.metadata.cash)} ${cur()} · ${s.metadata.device || "متصفح"}</small>
                <small class="muted">المزامنة: ${new Date(s.updatedAt).toLocaleString("en-US")}</small>
              </div>
              <div class="settings-actions">
                ${button("استرجاع", "confirm-cloud-restore", s.id, "secondary small")}
                ${button("حذف", "delete-cloud-save", s.id, "danger small")}
              </div>
            </div>
          `).join("")}
        </div>
        <div class="modal-actions" style="margin-top: 15px;">
          ${button("إغلاق", "close-modal", "", "ghost")}
        </div>
      `);
    } catch (err) {
      showError(err.message || "تعذر جلب سجل الحفظات.");
    }
  },
  "delete-cloud-save": async (btn) => {
    const saveId = btn?.dataset?.id;
    if (!saveId) return;
    try {
      await deleteCloudSave(saveId);
      toast("تم حذف النسخة السحابية.");
      actions["cloud-saves-list"]();
    } catch (err) {
      showError(err.message || "تعذر حذف الحفظة.");
    }
  },

  "dynasty-career-path": async (el) =>
    await apply(
      (s) => setCareerPath(s, el.dataset.id, el.dataset.path),
      tr("تم تسجيل المسار الذي اختاره الابن.", "The child's chosen career path has been recorded.", "Le parcours choisi par l’enfant a été enregistré."),
    ),
  "dynasty-heir-set": async (el) =>
    await apply(
      (s) => setDynastyHeir(s, el.dataset.id),
      tr("تم تسجيل الوريث وإعداد مستندات الخلافة.", "The heir has been recorded and succession documents prepared.", "L’héritier est enregistré et les documents de succession sont préparés."),
    ),
  "dynasty-succession-eligibility": async (el) =>
    await apply(
      (s) => setSuccessionEligibility(s, el.dataset.id, el.dataset.eligible === "true"),
      tr("تم تحديث أهلية الخلافة.", "Succession eligibility has been updated.", "L’éligibilité à la succession a été mise à jour."),
    ),
  "dynasty-retirement-choice": async (el) =>
    await apply(
      (s) => resolveRetirementOffer(s, el.dataset.id, el.dataset.decision),
      tr("تم تسجيل قرار التقاعد والخلافة.", "The retirement and succession decision has been recorded.", "La décision de retraite et de succession a été enregistrée."),
    ),
  "dynasty-sibling-reconcile": async (el) =>
    await apply(
      (s) => reconcileSiblings(s, el.dataset.id),
      tr("تحسنت العلاقة بين الإخوة بعد جلسة المصالحة.", "Sibling relationships improved after the reconciliation.", "Les relations entre frères et sœurs se sont améliorées après la réconciliation."),
    ),
  "dynasty-academy-graduate": async (el) =>
    await apply(
      (s) => promoteDynastyPlayer(s, el.dataset.id),
      tr("انضم خريج الأكاديمية إلى قائمة الفريق الأول.", "An academy graduate joined the first-team squad.", "Un diplômé de l’académie a rejoint l’effectif professionnel."),
    ),
  "dynasty-divorce": async (el) => {
    if (!confirm(tr("تأكيد الطلاق؟ سيُدفع نصف النقد تسوية وتتأثر الصورة العامة.", "Confirm divorce? Half of the cash goes to the settlement and the public image suffers.", "Confirmer le divorce ? La moitié des liquidités sera versée et l’image publique en pâtira."))) return;
    await apply(
      (s) => divorceOwner(s),
      tr("تم الطلاق وسُجلت التسوية.", "The divorce is final and the settlement is recorded.", "Le divorce est prononcé et le règlement enregistré."),
    );
  },
  "dynasty-event-choice": async (el) =>
    await apply(
      (s) => resolveDynastyEvent(s, el.dataset.id, el.dataset.choice),
      tr("سُجل قرار الأسرة، وعاد الوقت للتقدم.", "The family decision is recorded; time can advance again.", "La décision familiale est enregistrée ; le temps peut reprendre."),
    ),
  "dynasty-academy-enroll": async (el) => {
    const position = document.getElementById(`dynasty-academy-position-${el.dataset.id}`)?.value || "CM";
    await apply(
      (s) => enrollDynastyAcademy(s, el.dataset.id, position),
      tr("بدأت رحلة الأكاديمية. تظهر التقارير مع تقدم الأشهر.", "The academy journey has begun. Reports appear as months pass.", "Le parcours à l’académie commence. Les rapports apparaîtront au fil des mois."),
    );
  },
  "dynasty-academy-leave": async (el) =>
    await apply(
      (s) => leaveDynastyAcademy(s, el.dataset.id),
      tr("غادر الابن الأكاديمية؛ بقي سجله محفوظًا.", "The child left the academy; their record was preserved.", "L’enfant a quitté l’académie ; son dossier est conservé."),
    ),
  "close-modal": closeModal,
};
let firstAudioGesture = false;
const unlockOnGesture = () => {
  if (firstAudioGesture) return;
  firstAudioGesture = true;
  unlockAudio();
};
for (const eventName of ["pointerdown", "touchstart", "keydown"])
  document.addEventListener(eventName, unlockOnGesture, {
    once: true,
    passive: eventName !== "keydown",
  });
document.addEventListener("click", async (e) => {
  if (isSaving() || actionBusy) {
    toast(tr("جارٍ حفظ القرار…", "Saving decision…", "Enregistrement…"));
    return;
  }
  const nav = e.target.closest("[data-nav]");
  if (nav) {
    navigate(nav.dataset.nav);
    return;
  }
  if (e.target.classList.contains("modal-backdrop")) {
    closeModal();
    return;
  }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  try {
    actionBusy = true;
    await actions[el.dataset.action]?.(el);
  } catch (err) {
    showError(err.message);
  } finally {
    actionBusy = false;
  }
});
document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (!form.matches("form")) return;
  e.preventDefault();
  if (isSaving() || actionBusy) return;
  try {
    if (form.id === "politics-campaign-fund") {
      const amount = Math.round(Number(form.elements.amount.value));
      await apply(
        (s) => fundCampaign(s, amount),
        tr(
          "تم توثيق التمويل الشخصي للحملة.",
          "Personal campaign funding has been recorded.",
          "Le financement personnel de la campagne est enregistré.",
        ),
      );
      return;
    }
    if (form.id === "wage-raise-form") {
      // 0.53 hotfix «زرار المليار»: المبلغ يُضاف إلى السقف فورًا ويُسجَّل قبل/بعد.
      // «خانة المليار»: التقريب في roundWageRaise فلا يُرفض رقم مدوَّر مثل 4200000.
      const amount = roundWageRaise(form.elements.amount.value);
      const record = await apply(
        (s) => raiseWageBudget(s, amount),
        tr(
          "ارتفع سقف الرواتب فورًا — بلا غرامة ولا خصم.",
          "The wage ceiling rose at once — no fine and no deduction.",
          "Le plafond salarial a été relevé aussitôt — sans amende ni retenue.",
        ),
      );
      closeModal();
      void record;
      return;
    }
    if (form.id === "politics-donation-form") {
      const amount = Math.round(Number(form.elements.amount.value));
      const entry = await apply(
        (s) => donateToClub(s, form.dataset.club, amount),
        tr(
          "سُجل التبرع العلني، وامتنان النادي سيظهر في أصواته.",
          "The public donation was recorded; the club's gratitude will show in its votes.",
          "Le don public est enregistré ; la reconnaissance du club apparaîtra dans ses votes.",
        ),
      );
      closeModal();
      void entry;
      return;
    }
    if (form.id === "politics-debate-form") {
      const candidateId = form.elements.candidateId.value;
      const strategy = form.elements.strategy.value;
      await apply(
        (s) => politicalDebate(s, candidateId, strategy),
        tr(
          "انتهت المناظرة العلنية وسُجل تقييمها في سجل الحملة.",
          "The public debate is over; its result was added to the campaign record.",
          "Le débat public est terminé ; son résultat figure au registre de campagne.",
        ),
      );
      return;
    }
    if (form.id === "politics-bargain-form") {
      const billId = form.elements.billId.value;
      const clubId = form.elements.clubId.value;
      const offer = form.elements.offer.value;
      const amount = Math.round(Number(form.elements.amount.value));
      const result = await apply((s) =>
        bargainBill(s, billId, clubId, offer, amount),
      );
      toast(
        result.accepted
          ? tr(
              "قُبل التفاهم وسُجل علنًا في ملف التصويت.",
              "The compromise was accepted and publicly logged with the vote.",
              "Le compromis est accepté et consigné publiquement avec le vote.",
            )
          : tr(
              "لم يُقبل التنازل؛ سُجل موقف النادي وسيظهر في الاقتراع.",
              "The concession did not match the club's demand; its position will appear in the vote.",
              "La concession ne répond pas à la demande du club ; sa position figurera au vote.",
            ),
      );
      return;
    }
    if (form.id === "politics-support-fund-form") {
      const name = form.elements.name.value;
      const amount = Math.round(Number(form.elements.amount.value));
      const criteria = form.elements.criteria.value;
      await apply(
        (s) => createSupportFund(s, { name, amount, criteria }),
        tr(
          "حُجز رصيد صندوق الدعم وسُجل في دفتر الخزينة.",
          "The support fund was reserved and recorded in the treasury ledger.",
          "Le fonds de soutien est réservé et inscrit au registre de trésorerie.",
        ),
      );
      return;
    }
    if (form.id === "politics-support-grant-form") {
      const fundId = form.elements.fundId.value;
      const clubId = form.elements.clubId.value;
      const amount = Math.round(Number(form.elements.amount.value));
      await apply(
        (s) => grantFromSupportFund(s, fundId, clubId, amount),
        tr(
          "صُرفت المنحة وأُضيفت إلى حساب النادي.",
          "The grant was issued and credited to the club account.",
          "L’aide est versée et créditée au compte du club.",
        ),
      );
      return;
    }
    if (form.id.startsWith("politics-chair-")) {
      const committeeId = form.elements.committeeId.value;
      const officialId = form.elements.officialId.value;
      await apply(
        (s) => appointCommitteeChair(s, committeeId, officialId),
        tr(
          "عُيّن رئيس اللجنة وسُجلت مؤهلاته.",
          "The committee chair was appointed and their credentials recorded.",
          "Le président de commission est nommé et ses qualifications sont enregistrées.",
        ),
      );
      return;
    }
    if (form.id.startsWith("politics-policy-")) {
      const committeeId = form.elements.committeeId.value;
      const policy = form.elements.policy.value;
      await apply(
        (s) => setCommitteePolicy(s, committeeId, policy),
        tr(
          "اعتمدت سياسة اللجنة وستؤثر في المباريات والروزنامة.",
          "The committee policy is set and will shape matches and the calendar.",
          "La politique de la commission est adoptée et influencera les matchs et le calendrier.",
        ),
      );
      return;
    }
    if (form.id === "politics-tournament-create-form") {
      const templateId = form.elements.templateId.value;
      const sponsorId = form.elements.sponsorId.value;
      await apply(
        (s) => createAssociationTournament(s, templateId, sponsorId),
        tr(
          "أُطلقت البطولة، وسُجل الراعي والجائزة والقرعة في دفتر الاتحاد.",
          "The competition has launched; sponsor, prize and draw are in the association ledger.",
          "La compétition est lancée ; sponsor, prix et tirage figurent au registre de la fédération.",
        ),
      );
      return;
    }
    if (form.id === "politics-opposition-response-form") {
      const responseId = form.elements.responseId.value;
      await apply(
        (s) => addressOpposition(s, responseId),
        tr(
          "سُجل ردك العلني وحدثت مؤشرات الشرعية والنزاهة.",
          "Your public response was logged and legitimacy/integrity indicators were updated.",
          "Votre réponse publique est consignée et les indicateurs de légitimité et d’intégrité sont actualisés.",
        ),
      );
      return;
    }
    if (form.id === "politics-integrity-investigation-form") {
      const subject = form.elements.subject.value;
      await apply(
        (s) => openIntegrityInvestigation(s, subject),
        tr(
          "فُتح تحقيق مستقل وحدد له موعد وأدلة أولية.",
          "An independent review was opened with a due date and initial evidence.",
          "Un examen indépendant est ouvert avec échéance et premières preuves.",
        ),
      );
      return;
    }
    if (form.id === "politics-diplomatic-mission-form") {
      const organizationId = form.elements.organizationId.value;
      const missionType = form.elements.missionType.value;
      await apply(
        (s) => holdDiplomaticMission(s, organizationId, missionType),
        tr(
          "عادت البعثة بتحديث للعلاقات والنفوذ، وسُجلت تكلفتها.",
          "The mission updated relations and influence; its cost was recorded.",
          "La mission a renforcé les relations et l’influence ; son coût est consigné.",
        ),
      );
      return;
    }
    if (form.id === "politics-hosting-bid-form") {
      const eventId = form.elements.eventId.value;
      await apply(
        (s) => submitHostingBid(s, eventId),
        tr(
          "قُدم ملف الاستضافة؛ يصدر القرار بعد الموعد المسجل.",
          "The hosting bid was filed; a decision will follow on its due date.",
          "La candidature d’accueil est déposée ; une décision sera rendue à l’échéance.",
        ),
      );
      return;
    }
    if (form.id === "politics-executive-seat-form") {
      const organizationId = form.elements.organizationId.value;
      await apply(
        (s) => secureExecutiveSeat(s, organizationId),
        tr(
          "فزت بمقعد تنفيذي دولي لمدة أربع مواسم.",
          "You secured an international executive seat for four seasons.",
          "Vous obtenez un siège exécutif international pour quatre saisons.",
        ),
      );
      return;
    }
    if (form.id === "city-stadium-form") {
      const tier = Number(form.elements.tier.value), route = form.elements.route.value, district = form.elements.district.value, design = form.elements.design.value;
      const quote = stadiumQuote(getState(), tier, route, district, design);
      if (!confirm(`${tr("التكلفة","Cost","Coût")}: ${quote.cost.toLocaleString("en-US")} · ${quote.days} ${tr("يوم","days","jours")}?`)) return;
      await apply((s) => startStadium(s, {tier,route,district,design}), tr("بدأ البناء.","Construction started.","Chantier commencé."));
      return;
    }
    if (form.id === "dynasty-marriage-form") {
      const partner = form.elements.partner.value;
      const tier = form.elements.tier?.value || "family";
      const spouseTitle = form.elements.spouseTitle?.value || "";
      await apply(
        (s) => marryOwner(s, partner, { tier, title: spouseTitle }),
        tr("بدأت حياة أسرية جديدة.", "A new family journey has begun.", "Une nouvelle vie de famille commence."),
      );
      return;
    }
    if (form.id === "dynasty-child-form") {
      const name = form.elements.childName.value;
      await apply(
        (s) => haveChild(s, name),
        tr("سُجل الميلاد، وبدأت رحلة النمو.", "The birth was recorded; the growth journey has begun.", "La naissance est enregistrée ; le parcours de croissance commence."),
      );
      return;
    }
    if (form.id === "auth-login-form") {
      const id = form.elements.identifier.value;
      const pass = form.elements.password.value;
      try {
        await authLogin(id, pass);
        closeModal();
        toast("تم تسجيل الدخول بنجاح!");
        render();
      } catch (err) {
        openModal(authModalContent("login", err.message));
      }
      return;
    }
    if (form.id === "auth-register-form") {
      const email = form.elements.email.value;
      const username = form.elements.username.value;
      const pass = form.elements.password.value;
      try {
        await authRegister(email, username, pass);
        closeModal();
        toast("تم إنشاء الحساب وتسجيل الدخول بنجاح!");
        render();
      } catch (err) {
        openModal(authModalContent("register", err.message));
      }
      return;
    }

    if (form.id === "talent-mission-form") {
      const t = Object.fromEntries(new FormData(form));
      await apply((s) => requestMission(s, t));
    }
    if (form.id === "talent-training-form") {
      ui.talentPlayer = form.elements.playerId.value;
      const t = Object.fromEntries(new FormData(form));
      await apply((s) => setTraining(s, t.playerId, t.focus, t.intensity));
    }
    if (form.id === "commerce-prices") {
      const ticket = Number(form.elements.ticket.value),
        shirt = Number(form.elements.shirt.value);
      await apply((s) => {
        const previousTicket = s.ticketPrice;
        setPrices(s, ticket, shirt);
        recordTicketPriceChange(s, previousTicket, ticket);
      });
    }
    if (form.id === "shop-stock") {
      const quantity = Number(form.elements.quantity.value);
      await apply((s) => stockShirts(s, quantity));
    }
    if (form.id === "staff-negotiate-form") {
      const t = Object.fromEntries(new FormData(form));
      await apply((s) =>
        negotiate(s, { wage: Number(t.wage), years: Number(t.years), bonus: Number(t.bonus) }),
      );
      return;
    }
    if (form.id === "staff-freedom-form") {
      await apply((s) => setFreedom(s, Number(form.elements.freedom.value)));
      return;
    }
    if (form.id === "staff-curriculum-form") {
      await apply((s) => setCurriculum(s, form.elements.curriculum.value));
      return;
    }
    if (form.id === "staff-campaign-form") {
      await apply((s) => launchCampaign(
        s,
        form.elements.campaignType.value,
        Number(form.elements.budget.value),
      ));
      return;
    }
    if (form.id === "staff-legal-file-form") {
      await apply((s) => fileLegalCase(s, form.elements.kind.value));
      return;
    }
    if (form.id === "scout-region-form") {
      await apply((s) => assignScout(s, form.dataset.id, form.elements.region.value || null));
      return;
    }
    if (form.id === "staff-hire-form") {
      await apply((s) =>
        hireStaff(s, form.dataset.id, form.elements.staffRole.value),
      );
      closeModal();
    }
    if (form.id === "scout-task-form") {
      await apply((s) =>
        scoutAssignment(s, form.dataset.id, form.elements.playerId.value),
      );
      closeModal();
    }
    if (form.id === "offer-form") {
      await apply(
        (s) => {
          const r = submitOffer(s, form.dataset.player, {
            fee: Number(form.elements.fee.value),
            upfrontPercent: Number(form.elements.upfront.value),
          });
          markStep(s, "offer");
          return r;
        },
        "العرض اتبعت. مرّر يومًا عشان يوصلك الرد.",
      );
      closeModal();
      return;
    }
    if (form.id === "sale-counter-form") {
      const id = form.dataset.id;
      const result = await apply((s) =>
        counterSaleOffer(s, id, {
          fee: Number(form.elements.fee.value),
          upfrontPercent: Number(form.elements.upfrontPercent.value),
          appearanceBonus: Number(form.elements.appearanceBonus.value || 0),
          goalBonus: Number(form.elements.goalBonus.value || 0),
          sellOnPercent: Number(form.elements.sellOnPercent.value || 0),
        }),
      );
      openModal(saleNegotiationView(getState(), id), true);
      if (result?.status === "withdrawn")
        toast(tr("انسحب النادي بعد انتهاء جولات المساومة.", "The club withdrew after the bargaining rounds.", "Le club s’est retiré après les tours de négociation."));
      else if (result?.status === "agreed")
        toast(tr("قبل النادي عرضك المضاد؛ أكّد البيع لإتمامه.", "The club accepted your counter; confirm the sale to complete it.", "Le club accepte votre contre-offre ; confirmez pour conclure."));
      return;
    }
    if (form.id === "player-exchange-form") {
      const outgoingPlayerIds = [
        ...form.querySelectorAll('[data-exchange-side="outgoing"]:checked'),
      ].map((input) => input.value);
      const incomingPlayerIds = [
        ...form.querySelectorAll('[data-exchange-side="incoming"]:checked'),
      ].map((input) => input.value);
      const wageOffers = Object.fromEntries(
        [...form.querySelectorAll("[data-exchange-wage]")]
          .filter((input) => incomingPlayerIds.includes(input.dataset.exchangeWage))
          .map((input) => [input.dataset.exchangeWage, Number(input.value || 0)]),
      );
      const deal = await apply((s) =>
        proposePlayerExchange(s, {
          opponentId: form.dataset.opponentId,
          outgoingPlayerIds,
          incomingPlayerIds,
          cash: Number(form.elements.cash.value || 0),
          wageOffers,
        }),
      );
      if (deal?.id)
        openModal(playerExchangeDealView(getState(), deal.id), true);
      return;
    }
    if (form.id === "loan-offer-form") {
      const f = form.elements;
      const terms = {
        days: Number(f.days.value),
        fee: Number(f.fee.value),
        wageShare: Number(f.wageShare.value),
        buyOption: Number(f.buyOption.value),
        recallAllowed: f.recallAllowed.checked,
        role: f.role.value,
        borrower: f.borrower?.value,
      };
      await apply((s) => requestLoan(s, form.dataset.player, terms));
      closeModal();
    }
    if (form.id === "contract-form") {
      const releaseClause = form.elements.releaseClause.value;
      const terms = {
        salary: Number(form.elements.salary.value),
        years: Number(form.elements.years.value),
        bonus: Number(form.elements.bonus.value),
        role: form.elements.role.value,
        appearanceBonus: Number(form.elements.appearanceBonus.value),
        goalBonus: Number(form.elements.goalBonus.value),
        annualRaisePct: Number(form.elements.annualRaisePct.value),
        releaseClause,
        clauseLevel,
      };
      await apply(
        (s) =>
          form.dataset.renew === "true"
            ? renewPlayer(s, form.dataset.ref, terms)
            : signPlayer(s, form.dataset.ref, terms),
        "تم توقيع العقد وتحديث السجل المالي.",
      );
      closeModal();
    }
    if (form.id === "black-charity") {
      const amount = Number(form.elements.amount.value);
      await apply((s) => {
        const { donateCharity } = requireBlack();
        return donateCharity(s, amount);
      }, "تم التبرع الخيري وخفض الشبهات.");
    }
    if (form.id === "empire-draw-form") {
      const amount = Math.round(Number(form.elements.amount.value));
      const project = form.elements.project?.value || null;
      const st = drawStatus(getState(), amount, { project });
      if (st.loot) {
        openModal(lootModalHtml({ amount, project, status: st, from: "empire" }));
        return;
      }
      await apply(
        (s) => takeFromClub(s, amount, { project }),
        "تم التحويل من خزينة النادي إلى ثروتك الشخصية.",
      );
    }
    if (form.id === "empire-support-form") {
      const amount = Math.round(Number(form.elements.amount.value));
      await apply(
        (s) => transferToClub(s, amount),
        "تم دعم خزينة النادي من ثروتك الشخصية.",
      );
    }
    if (form.id === "empire-project-form") {
      const title = form.elements.title.value;
      const amount = Math.round(Number(form.elements.amount.value));
      await apply(
        (s) => proposeProject(s, { title, amount }),
        tr("تم عرض المشروع على تصويت الجمعية.", "The project was put to the assembly vote.", "Le projet a été soumis au vote de l’assemblée."),
      );
    }
    if (form.id === "empire-repay-form") {
      const amount = Math.round(Number(form.elements.amount.value));
      await apply((s) => repayDebt(s, amount), "تم سداد جزء من الدين.");
    }
    if (form.id === "legend-offer-form") {
      const role = form.elements.role.value;
      const years = Number(form.elements.years.value);
      await apply(
        (s) => signLegend(s, form.dataset.id, role, years),
        "تم توقيع عقد الأسطورة.",
      );
      closeModal();
    }
    if (form.id === "legend-renew-form") {
      const years = Number(form.elements.years.value);
      await apply(
        (s) => renewLegend(s, form.dataset.id, years),
        "تم تجديد عقد الأسطورة.",
      );
      closeModal();
    }
    if (form.id === "coach-form") {
      const years = Number(form.elements.years.value);
      await apply(
        (s) =>
          form.dataset.mode === "renew"
            ? renewCoach(s, years)
            : appointCoach(s, form.dataset.id, years),
        form.dataset.mode === "renew"
          ? "تم تجديد عقد المدرب."
          : "تم تعيين المدرب الجديد.",
      );
      closeModal();
    }
    if (form.id === "project-form") {
      await apply(
        (s) => {
          const r = startProject(s, form.dataset.id, form.elements.speed.value);
          markStep(s, "facility");
          return r;
        },
        "المشروع بدأ. موعد الاستلام واتفاق الدفع في البريد.",
      );
      closeModal();
    }
    if (form.id === "ticket-form") {
      const p = Number(form.elements.price.value);
      if (!Number.isInteger(p) || p < 50 || p > 500)
        throw new Error("السعر من 50 إلى 500 جنيه.");
      const first = Number(form.elements.first.value),
        vip = Number(form.elements.vip.value),
        premium = Number(form.elements.premium.value);
      await apply((s) => {
        const previousPrices = categoryPrices(s);
        const previousAverage = (s.ticketPrice + previousPrices.first + previousPrices.vip) / 3;
        s.ticketPrice = p;
        setCategoryPrices(s, { first, vip });
        const nextPrices = categoryPrices(s);
        const nextAverage = (s.ticketPrice + nextPrices.first + nextPrices.vip) / 3;
        recordTicketPriceChange(s, previousAverage, nextAverage);
        setMatchPremium(s, premium);
      }, "تم اعتماد أسعار الفئات والعلاوة للمباريات القادمة.");
      closeModal();
    }
  } catch (err) {
    showError(err.message);
  }
});
document.addEventListener("input", (e) => {
  // الشرائح: data-action يوجّه السحب الحي إلى إجراء، و data-out يحدّث مخرجًا نصيًا مباشرة.
  if (e.target.matches?.('input[type="range"][data-action]')) {
    actions[e.target.dataset.action]?.(e.target);
    return;
  }
  if (e.target.matches?.('input[type="range"][data-out]')) {
    const out = document.getElementById(e.target.dataset.out);
    if (out) out.textContent = `${num(Number(e.target.value))}${e.target.dataset.unit || ""}`;
    return;
  }
  if (e.target.id === "audio-volume") {
    const output = document.getElementById("audio-volume-value");
    if (output) output.value = `${Math.round(Number(e.target.value))}%`;
    return;
  }
  if (
    e.target.closest(
      "#offer-form,#contract-form,#politics-donation-form,#wage-raise-form",
    )
  )
    updateCalculations();
  if (e.target.id === "palette-input") {
    paletteQuery(e.target.value);
    return;
  }
  // البحث على الجوال: الحالة تتحدث فورًا، والرندر يتجمع (debounce) ويحفظ التركيز والمؤشر.
  if (e.target.id === "market-search") {
    ui.marketQuery = e.target.value;
    renderSearchSoon();
    return;
  }
  if (e.target.id === "player-search") {
    ui.playerFilters.search = e.target.value;
    ui.playerFilters.page = 0;
    renderSearchSoon();
  }
  if (e.target.id === "club-search") {
    const value = e.target.value;
    ui.clubQuery = value;
    renderSearchSoon();
  }
});
// اختصارات البحث السريع: Ctrl/⌘+K للفتح والإغلاق، والأسهم وEnter للتنقل داخل النتائج.
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    ui.palette.open ? closePalette() : openPalette();
    return;
  }
  if (!ui.palette.open) return;
  if (e.key === "Escape") closePalette();
  else if (e.key === "ArrowDown") {
    e.preventDefault();
    paletteMove(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    paletteMove(-1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    paletteActivate(ui.palette.sel);
  }
});
document.addEventListener("input", (e) => {
  if (!e.target.matches("[data-exchange-cash]")) return;
  e.target.dataset.manual = "true";
  const form = e.target.closest("#player-exchange-form");
  if (form) updateExchangeBuilder(form);
});
document.addEventListener("change", async (e) => {
  if (isSaving() || actionBusy) return;
  try {
    if (e.target.dataset.exchangeSide) {
      const form = e.target.closest("#player-exchange-form");
      if (!form) return;
      const selected = form.querySelectorAll(
        `[data-exchange-side="${e.target.dataset.exchangeSide}"]:checked`,
      );
      if (selected.length > 5) {
        e.target.checked = false;
        toast(tr("الحد الأقصى 5 لاعبين من كل طرف.", "Choose no more than 5 players per side.", "Choisissez au maximum 5 joueurs par équipe."));
      }
      updateExchangeBuilder(form);
      return;
    }
    if (e.target.id === "audio-enabled") {
      const enabled = e.target.checked;
      await apply(
        (s) => setAudioEnabled(s, enabled),
        tr("تم حفظ إعداد الصوت.", "Sound setting saved.", "Réglage audio enregistré."),
      );
      return;
    }
    if (e.target.id === "audio-muted") {
      const muted = e.target.checked;
      await apply(
        (s) => setAudioMuted(s, muted),
        tr("تم حفظ إعداد الكتم.", "Mute setting saved.", "Réglage muet enregistré."),
      );
      return;
    }
    if (e.target.id === "audio-volume") {
      const volume = Number(e.target.value) / 100;
      await apply(
        (s) => setAudioVolume(s, volume),
        tr("تم حفظ مستوى الصوت.", "Volume saved.", "Volume enregistré."),
      );
      return;
    }
    if (e.target.dataset.dynastyUpbringing) {
      const childId = e.target.dataset.dynastyUpbringing;
      const style = e.target.value;
      await apply((s) => setUpbringing(s, childId, style));
      return;
    }
    if (e.target.dataset.dynastyAcademyFocus) {
      const childId = e.target.dataset.dynastyAcademyFocus;
      const focus = e.target.value;
      await apply((s) => setAcademyFocus(s, childId, focus));
      return;
    }
    if (e.target.dataset.dynastyAcademyPosition) {
      const childId = e.target.dataset.dynastyAcademyPosition;
      const position = e.target.value;
      await apply((s) => setAcademyPosition(s, childId, position));
      return;
    }
    if (e.target.dataset.dynastyAcademyMentor) {
      const childId = e.target.dataset.dynastyAcademyMentor;
      const mentorId = e.target.value;
      await apply((s) => setAcademyMentor(s, childId, mentorId || null));
      return;
    }
    if (e.target.id === "talent-training-player") {
      ui.talentPlayer = e.target.value;
      const plan = getState().talent.training[ui.talentPlayer] || {
        focus: "balanced",
        intensity: "normal",
      };
      const form = e.target.form;
      form.elements.focus.value = plan.focus;
      form.elements.intensity.value = plan.intensity;
      return;
    }
    if (e.target.dataset.playerRole) {
      const id = e.target.dataset.playerRole,
        role = e.target.value;
      await apply((s) => setPlayerRole(s, id, role));
      return;
    }
    if (e.target.dataset.tactical) {
      const key = e.target.dataset.tactical,
        value = e.target.value;
      await apply((s) => setTactics(s, { [key]: value }));
      return;
    }
    if (e.target.id === "team-tactic") {
      const tactic = e.target.value;
      await apply((s) => setTactic(s, tactic));
      return;
    }
    if (e.target.name === "empire-lifestyle") {
      const tier = e.target.value;
      await apply((s) => setLifestyle(s, tier));
      return;
    }
    if (e.target.name === "owner-story") {
      ui.setupConfig.ownerStory = e.target.value;
      for (const label of document.querySelectorAll(".story-options label"))
        label.classList.toggle(
          "selected",
          label.querySelector("input")?.value === e.target.value,
        );
      return;
    }
    if (e.target.dataset.child) {
      const { setSchool, setAllowance } = await import(
        "./services/empire/family.js"
      );
      const childId = e.target.dataset.child;
      const value = e.target.value;
      if (e.target.dataset.kind === "school")
        await apply((s) => setSchool(s, childId, value));
      else await apply((s) => setAllowance(s, childId, value));
      return;
    }
    if (e.target.id === "division-view") {
      ui.expandedDivision = e.target.value;
      render();
      return;
    }
    if (e.target.id === "club-league") {
      ui.clubLeague = e.target.value;
      ui.clubClub = null;
      render();
      return;
    }
    // 0.47: الفروع — تغيير الدولة يحدّث بطاقة المعاينة فقط.
    if (e.target.id === "branch-country") {
      ui.branchCountry = e.target.value;
      render();
      return;
    }
    // 0.48: المعجل ⚡ — اختيار التنفيذ الفوري يبدّل شروط الدفع في النافذة.
    if (e.target.name === "speed" && e.target.closest("#project-form")) {
      const form = e.target.closest("#project-form");
      const inst = e.target.value === "instant";
      const std = form.querySelector("[data-speed-note-std]");
      const fast = form.querySelector("[data-speed-note-inst]");
      if (std) std.hidden = inst;
      if (fast) fast.hidden = !inst;
      return;
    }
    if (
      [
        "setup-career-mode",
        "setup-region",
        "setup-tier",
        "setup-group",
        "setup-expanded-club",
      ].includes(e.target.id)
    ) {
      ui.owner = document.getElementById("owner-name")?.value || "";
      ui.leagues = [
        ...document.querySelectorAll("input[name=league]:checked"),
      ].map((x) => x.value);
      if (e.target.id === "setup-career-mode") {
        ui.setupConfig.expanded = e.target.value === "expanded";
        ui.setupConfig.database = "world";
        ui.setupClub = "ahly";
      }
      if (e.target.id === "setup-region") {
        const c = EXPANDED_CLUBS.find(
          (c) => c.selectable && c.country === e.target.value,
        );
        if (!c) throw Error("لا تتوفر قوائم للبدء في هذا البلد.");
        ui.setupClub = c.id;
      }
      if (e.target.id === "setup-tier") {
        const country = extendedClub(ui.setupClub).country;
        const c = EXPANDED_CLUBS.find(
          (c) =>
            c.selectable &&
            c.country === country &&
            c.tier === Number(e.target.value),
        );
        if (!c) throw Error("هذه الدرجة غير متاحة.");
        ui.setupClub = c.id;
      }
      if (e.target.id === "setup-group")
        ui.setupClub = DIVISIONS.find((d) => d.id === e.target.value).clubs[0];
      if (e.target.id === "setup-expanded-club") ui.setupClub = e.target.value;
      render();
      return;
    }
    if (
      e.target.id === "setup-language" ||
      e.target.name === "difficulty" ||
      e.target.id === "setup-database"
    ) {
      ui.owner = document.getElementById("owner-name")?.value || "";
      ui.leagues = [
        ...document.querySelectorAll('input[name="league"]:checked'),
      ].map((el) => el.value);
      if (e.target.id === "setup-language") setLanguage(e.target.value);
      if (e.target.name === "difficulty")
        ui.setupConfig.difficulty = e.target.value;
      if (e.target.id === "setup-database")
        ui.setupConfig.database = e.target.value;
      if (e.target.id === "setup-database" && e.target.value !== "world") {
        ui.setupConfig.expanded = false;
        ui.setupClub = "ahly";
      }
      render();
    }
    if (e.target.id === "clause-level") {
      const opt = e.target.selectedOptions[0];
      const clauseVal = Number(opt?.dataset?.clause || 0);
      const salaryFactor = Number(opt?.dataset?.salary || 1);
      const clauseInput = document.getElementById("release-clause-input");
      if (clauseInput) clauseInput.value = clauseVal;
      const salaryInput = e.target.form?.elements?.salary;
      if (salaryInput && salaryFactor !== 1) {
        const baseSalary = Number(salaryInput.dataset.base || salaryInput.value);
        if (!salaryInput.dataset.base) salaryInput.dataset.base = salaryInput.value;
        salaryInput.value = Math.round(baseSalary * salaryFactor);
      }
      updateCalculations();
      return;
    }
    if (e.target.id === "game-language") {
      const lang = e.target.value;
      await apply((s) => (s.preferences.language = lang));
      setLanguage(lang);
      render();
    }
    if (e.target.id === "position-filter") {
      ui.playerFilters.pos = e.target.value;
      ui.playerFilters.page = 0;
      render();
    }
    if (e.target.id === "league-filter") {
      ui.playerFilters.league = e.target.value;
      ui.playerFilters.page = 0;
      render();
    }
    if (e.target.id === "legend-player-mode") {
      await apply(
        (s) => setLegendPlayerMode(s, e.target.checked),
        "تم حفظ إعداد وضع الأساطير.",
      );
      return;
    }
    if (
      ["legend-country", "legend-group", "legend-tier"].includes(e.target.id)
    ) {
      ui.legendFilters[e.target.id.replace("legend-", "")] = e.target.value;
      ui.legendFilters.page = 1;
      render();
      return;
    }
    if (
      e.target.id === "legend-offer-role" ||
      e.target.id === "legend-offer-years"
    ) {
      const form = e.target.form;
      ui.legendOffer = {
        id: form.dataset.id,
        role: form.elements.role.value,
        years: Number(form.elements.years.value),
      };
      openModal(
        legendDetailModal(getState(), form.dataset.id, ui.legendOffer),
        true,
      );
      return;
    }
    if (e.target.id === "pause-matches")
      await apply(
        (s) => (s.preferences.pauseMatches = e.target.checked),
        "تم حفظ إعداد المحاكاة.",
      );
    if (e.target.id === "theme-select") {
      applyThemePref(e.target.value);
      return;
    }
    if (e.target.id === "font-size") {
      try {
        localStorage.setItem("clubowner.fontsize", e.target.value);
      } catch {}
      document.documentElement.dataset.fontsize =
        e.target.value === "large" ? "large" : "normal";
      return;
    }
    if (e.target.id === "display-currency") {
      setDisplayCurrency(e.target.value);
      render();
      toast(
        tr(
          "تم تحويل المبالغ المعروضة إلى العملة المختارة.",
          "Displayed amounts now use the selected currency.",
          "Les montants affichés utilisent la devise sélectionnée.",
        ),
      );
      return;
    }
    if (e.target.id === "auto-report")
      await apply(
        (s) => (s.preferences.autoMatchReport = e.target.checked),
        tr("تم حفظ الإعداد.", "Setting saved.", "Réglage enregistré."),
      );
    if (e.target.id === "notify-achievements" || e.target.id === "notify-absence") {
      const key = e.target.id === "notify-achievements" ? "achievements" : "absence";
      await apply(
        (s) => setNotify(s, key, e.target.checked),
        tr("تم حفظ الإشعار.", "Notification saved.", "Notification enregistrée."),
      );
    }
    if (e.target.id === "reduce-motion")
      await apply(
        (s) => (s.preferences.reduceMotion = e.target.checked),
        tr("تم حفظ إعداد العرض.", "Display setting saved.", "Réglage d'affichage enregistré."),
      );
    if (e.target.id === "clause-level") {
      const selectedOption = e.target.selectedOptions?.[0];
      const baseInput = document.getElementById("release-clause-input");
      if (baseInput && selectedOption?.dataset?.clause !== undefined) {
        baseInput.value = selectedOption.dataset.clause;
      }
    }
    if (
      e.target.closest(
        "#offer-form,#contract-form,#politics-donation-form,#wage-raise-form",
      )
    )
      updateCalculations();
    // 0.53 hotfix «خانة المليار»: المبلغ يُقرَّب لعدد صحيح عند تأكيد الخانة، فلا
    // تبقى كسور عشريّة توقف الإرسال، والمعاينة تعرض بالضبط ما سيُضاف للسقف.
    if (e.target.matches?.('#wage-raise-form input[name="amount"]')) {
      const rounded = roundWageRaise(e.target.value);
      if (rounded !== null && String(rounded) !== e.target.value)
        e.target.value = String(rounded);
      updateCalculations();
    }
  } catch (err) {
    showError(err.message);
  }
});
bindModalKeyboard();
async function bootstrap() {
  // 0.44: وضع الأداء الخفيف على الأجهزة الضعيفة قبل أول رسم
  applyPerformanceMode();
  app.innerHTML = `<div style="padding:40px;text-align:center">جارٍ فتح الحفظة…</div>`;
  try {
    const loaded = await loadGame();
    setState(loaded.state);
    setLanguage(loaded.state?.preferences.language || getLanguage());
    render();
    if (loaded.backup)
      toast("تم استرجاع النسخة الاحتياطية بعد تعذر قراءة الحفظ الأساسي.", true);
    if (loaded.error) toast("الحفظة غير سليمة: " + loaded.error, true);
    const pending = loaded.state ? pendingCelebrations(loaded.state) : [];
    if (pending.length)
      setTimeout(() => showCelebrationQueue(pending, () => showCeremonyIfPending()), 0);
    else if (loaded.state?.awards?.ceremony && !loaded.state.awards.ceremony.seen)
      setTimeout(() => showCeremonyIfPending(), 0);
  } catch (e) {
    render();
    toast(
      "تعذر الوصول للتخزين المحلي. افتح الرابط خارج الوضع الخاص واسمح ببيانات الموقع.",
      true,
    );
  }
}
bootstrap();
registerOffline();

window.addEventListener("beforeunload", (e) => {
  if (isSaving() || actionBusy || hasUnsavedChanges()) {
    flushSave().catch(() => {});
    e.preventDefault();
    e.returnValue = "";
  }
});
// Mobile browsers may freeze or discard a hidden tab without beforeunload: write right away.
const flushOnHide = () => {
  if (hasUnsavedChanges()) flushSave().catch(() => {});
};
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flushOnHide();
});
window.addEventListener("pagehide", flushOnHide);
