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
import "./styles/tokens.css";
import "./styles/motion.css";
import "./styles/dynasty.css";
import "./styles/politics.css";
import { createGame } from "./core/game.js";
import { getState, setState, commit, isSaving } from "./core/store.js";
import { saveGame, loadGame, exportGame, importGame } from "./services/save.js";
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
import { startProject, toggleFacilityStaff } from "./services/facilities.js";
import {
  offersFor,
  signSponsor,
  resolveSponsor,
  negotiateSponsor,
  answerSponsorDeal,
} from "./services/sponsors.js";
import { takeLoan, wages, secretDeposit } from "./services/finance.js";
import { setupView } from "./features/setup.js";
import { shell, NAV, NAV_GROUPS, NAV_BY_ID } from "./components/shell.js";
import { dashboardView } from "./features/dashboard.js";
import { inboxView } from "./features/inbox.js";
import {
  playersView,
  playerDetail,
  offerForm,
  contractForm,
} from "./features/players.js";
import { facilitiesView, facilityDetail } from "./features/facilities.js";
import {
  sponsorsView,
  sponsorOffers,
  sponsorDetail,
  sponsorNegotiate,
  sponsorDealResult,
} from "./features/sponsors.js";
import { financeView } from "./features/finance.js";
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
} from "./services/politics/campaign.js";
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
import { money, num, esc, date, setDigitsMode, setDisplayCurrency, cur } from "./ui/format.js";
import { ASSETS } from "./data/catalog.js";
import { findPerson } from "./services/retired.js";
import { APP_VERSION } from "./data/version.js";
import { playInstantFriendly } from "./services/instantFriendly.js";
import { getCupDraw } from "./services/cupDraw.js";
import { cupDrawModal } from "./features/cupDraw.js";
import { youthIntakeModal } from "./features/youthIntake.js";
import { executeYouthIntakeDecisions } from "./services/youthIntake.js";
import { acceptDeadlineBid, declineDeadlineBid } from "./services/deadlineDay.js";
import { blackFilesView } from "./features/blackFiles.js";
import * as BlackService from "./services/blackFiles.js";
import * as ReleaseService from "./services/releaseClause.js";
import { empireView } from "./features/empire.js";
import {
  transferToPersonal,
  transferToClub,
  setLifestyle,
  repayDebt,
} from "./services/empire/wealth.js";
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
function render() {
  const s = getState();
  if (s) {
    // تفضيلات العرض تُطبق قبل بناء الشاشات: نمط الأرقام وتقليل الحركة.
    setDigitsMode(s.preferences?.digits === "western" ? "western" : "arabic");
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
    dashboard: () => dashboardView(s),
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
    dynasty: () => dynastyView(s),
    settings: () => settingsView(s),
    database: () => databaseView(),
    careers: () => careersView(s, ui.talentPlayer),
  };
  app.innerHTML = shell(s, ui.route, (views[ui.route] || views.dashboard)());
  if (ui.route !== lastRenderedRoute)
    app.querySelector("#main-content")?.classList.add("page-enter");
  lastRenderedRoute = ui.route;
  translateDOM(app);
  document.title =
    (NAV.find((n) => n.id === ui.route)?.name || "Empire FC") + " | Empire FC";
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
async function apply(operation, text) {
  document.body.classList.add("saving-game");
  const indicator = document.querySelector(".save-indicator");
  if (indicator)
    indicator.textContent = tr("جارٍ الحفظ…", "Saving…", "Enregistrement…");
  let r;
  try {
    r = await commit(operation);
  } catch (e) {
    render();
    throw e;
  } finally {
    document.body.classList.remove("saving-game");
  }
  render();
  if (text) toast(text);
  return r;
}
async function runTime(resume = false) {
  const days = resume
    ? null
    : Number(document.getElementById("advance-days")?.value || 7);
  const stateBefore = getState(),
    playedBefore = new Set(
      stateBefore ? playedOwnFixtures(stateBefore).map((f) => f.id) : [],
    );
  const r = await apply((s) => {
    const result = advanceTime(s, days);
    if (result.advanced) markStep(s, "week");
    return result;
  });
  // 0.24: شاشة لقطات الماتش أولاً، ثم تقرير الماتش الكامل.
  const s = getState();
  if (s && s.preferences?.autoMatchReport !== false) {
    const fresh = playedOwnFixtures(s).filter((f) => !playedBefore.has(f.id));
    if (fresh.length) {
      const r = reportFor(s, fresh[fresh.length - 1]);
      showHighlightsScreen(s, r, () => {
        openModal(matchReportModal(s, r));
      });
    }
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
    contract = document.querySelector("#contract-form");
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
      `<div><span>المطلوب من الخزينة الآن</span><strong class="${now > s.finance.cash ? "red" : "green"}">${money(now)} ${cur()}</strong></div><div><span>إجمالي الالتزام خلال العقد</span><strong>${money(total)} ${cur()}</strong></div>${n ? `<div><span>عمولة الوكيل (٣٪)</span><b>${money(agent)} ${cur()}</b></div>` : ""}<small>يشمل ${renew ? "العقد الجديد والمكافأة" : "رسوم الانتقال والمرتب والمكافأة والوكيل"}. الرصيد المتاح ${money(s.finance.cash)} ${cur()}.</small>`;
  }
  if (offer) translateDOM(document.getElementById("offer-summary"));
  if (contract) {
    const summary = document.getElementById("contract-summary");
    summary.innerHTML += `<small>${tr("التكلفة المضمونة تشمل الزيادة السنوية ولا تشمل مكافآت المشاركات والأهداف المتغيرة. وعد الأساسي: المشاركة في ٦٠٪ من المباريات خلال أول ٦٠ يومًا؛ المخالفة تخفض المعنويات ١٢ نقطة. الشرط الجزائي يسمح لك بدفعه عند شراء لاعب من السوق؛ بيع لاعبيك للمنافسين غير متاح بعد.", "Guaranteed cost includes annual raises but excludes variable appearance and goal bonuses. Regular role: appear in 60% of matches during the first 60 days or lose 12 morale. A market player’s release clause can be activated when buying; AI purchases of your players are not yet enabled.", "Le coût garanti inclut les hausses annuelles, pas les primes variables. Titulaire : participer à 60 % des matchs des 60 premiers jours, sinon perte de 12 points de moral. La clause d’un joueur du marché peut être activée à l’achat ; ventes à l’IA non disponibles.")}</small>`;
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
          <span>كلمة المرور (٦ أحرف على الأقل)</span>
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
  // خزنة المالك السرية: مفاتيحها أرقام الإصدار (أسفل القائمة الجانبية + سطر EMPIRE FC في شيت «المزيد» + شارة «عن اللعبة»).
  "secret-vault": () =>
    openModal(
      `<h2>${tr("خزنة المالك السرية 🤫", "The owner's secret vault 🤫", "Le coffre secret du propriétaire 🤫")}</h2><p class="muted">${tr("إيداع فوري بفلوس تجريبية لمن يعرف المكان. يُسجَّل في الدفاتر مثل أي تدفق نقدية فتبقى الإدارة المالية صادقة.", "An instant injection of play money for those who know the spot. It is posted to the ledger like any cash flow, so the books stay honest.", "Une injection instantanée d’argent fictif pour qui connaît l’endroit. Inscrite au registre comme tout flux, la comptabilité reste honnête.")}</p><div class="modal-actions vault-grid">${button(`${money(10000000)} ${cur()}`, "vault-deposit", "10000000", "soft")}${button(`${money(100000000)} ${cur()}`, "vault-deposit", "100000000", "secondary")}${button(`${money(1000000000)} ${cur()}`, "vault-deposit", "1000000000", "primary")}</div><div class="modal-actions">${button(tr("إغلاق الخزنة", "Close the vault", "Fermer le coffre"), "modal-close", "", "ghost")}</div>`,
    ),
  "vault-deposit": async (el) => {
    const amount = Number(el.dataset.id);
    await apply((s) => secretDeposit(s, amount));
    toast(
      `${tr("تم إيداع", "Deposited", "Déposé")} ${money(amount)} ${cur()} ${tr("في خزينة النادي 🤫", "into the club treasury 🤫", "dans la trésorerie du club 🤫")}`,
    );
  },
  "modal-close": () => closeModal(),
  "instant-friendly": async () => {
    let reportData = null;
    await apply((s) => {
      const res = playInstantFriendly(s);
      reportData = res.report;
      markStep(s, "friendly");
    });
    const s = getState();
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
      `<h2>دورة تطوير</h2><p>${tr("٦ نقاط للمهارة الأساسية حتى حد ٩٥. لا تضمن الدورة زيادة المرتب.", "Adds 6 points to the main skill, up to 95. Salary is unchanged.", "Ajoute 6 points à la compétence principale, jusqu’à 95. Salaire inchangé.")}</p><div class="modal-actions">${button(`الموافقة على دورة ٢١ يومًا مقابل ${money(100000)} ${cur()}`, "confirm-staff-course", el.dataset.id, "primary")}</div>`,
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
    await saveGame(s);
    setState(s);
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
      await saveGame(state);
    } catch (e) {
      document.body.classList.remove("saving-game");
      showError(e.message);
      return;
    }
    document.body.classList.remove("saving-game");
    setState(state);
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
  "player-detail": async (el) => showPlayer(el.dataset.id),
  "transfer-offer": async (el) => {
    const s = getState(),
      p = s.players.find((p) => p.id === el.dataset.id);
    openModal(offerForm(s, p));
    updateCalculations();
  },
  "accept-club": async (el) => {
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
      `<span class="eyebrow">قبل الالتزام</span><h2>${sp.name} × ${asset.name}</h2><p class="muted">عقد ٣٦٠ يومًا بقيمة ${money(offer.amount)} ${cur()}، ومقدم ${money(Math.floor(offer.amount * 0.25))} ${cur()}. تشمل مكافآت أداء موحدة تُصرف تلقائيًا.</p><div class="effect-card"><h4>الحقوق والالتزامات</h4><p>سيتم حجز ${asset.name} طوال مدة العقد. ${offer.exclusive ? "العقد حصري لقطاع " + sp.sector + "؛ يمنع التعاقد مع منافس في نفس القطاع." : "بدون حصرية قطاع؛ مساحة الإعلان نفسها محجوزة لهذا الشريك فقط."}</p><small>الباقي على ١١ دفعة متساوية تقريبًا كل ٣٠ يومًا. الفسخ المبكر غير متاح في هذه النسخة.</small></div><div class="modal-actions"><button class="btn primary" data-action="sign-sponsor" data-id="${sp.id}" data-asset="${asset.id}">توقيع العقد واستلام المقدم ${icon("check", 17)}</button></div>`,
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
    apply((s) => startNegotiation(s, el.dataset.id), tr("بدأ التفاوض — ٣ جولات.", "Negotiation started — 3 rounds.", "Négociation lancée — 3 tours.")),
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
      `<span class="eyebrow">تمويل تجريبي ثابت</span><h2>مساحة أكبر للسيولة… والتزام جديد</h2><div class="profile-stats"><div><small>المبلغ المستلم</small><strong>٥ ملايين ${cur()}</strong></div><div><small>إجمالي السداد</small><strong>٥٫٤ مليون ${cur()}</strong></div><div><small>الدفعة كل ٣٠ يومًا</small><strong>٤٥٠ ألف ${cur()}</strong></div></div><p class="muted">١٢ دفعة تشمل تكلفة تمويل ثابتة ٤٠٠ ألف جنيه. حد أقصى قرضان خلال الحفظة التجريبية. لا يتضمن نموذج فائدة مركبة أو شروط بنك حقيقي.</p>${infoNote("التمويل مش إيراد تشغيلي. القسط بيتسدد تلقائيًا حتى لو أدى لعجز في السيولة.")}<div class="modal-actions">${button("اعتماد التمويل", "take-loan", "", "primary")}</div>`,
    ),
  "take-loan": async () => {
    await apply(takeLoan, "تم إيداع التمويل وجدولة الأقساط.");
    closeModal();
  },
  "ticket-price": async () => {
    const s = getState(),
      prices = categoryPrices(s);
    openModal(
      `<h2>تسعير تذاكر المباريات</h2><p class="muted">السعر الأعلى يرفع العائد لكل مشجع، لكنه يقلل الطلب. المقصورة أقل تأثرًا بالغلاء من العادية. أصحاب الاشتراكات يشغلون مقاعد العادية أولًا ولا يُحصّلون مرتين.</p><form id="ticket-form"><div class="form-grid"><label class="field"><span>العادية (70٪ من السعة)</span><input type="number" name="price" value="${s.ticketPrice}" min="50" max="500" required></label><label class="field"><span>الأولى (20٪ · 40–2000)</span><input type="number" name="first" value="${prices.first}" min="40" max="2000" required></label><label class="field"><span>المقصورة (10٪ · 100–5000)</span><input type="number" name="vip" value="${prices.vip}" min="100" max="5000" required></label><label class="field"><span>علاوة المباراة البيتية القادمة</span><select name="premium"><option value="0">بدون علاوة</option><option value="25">+٢٥٪ مباراة كبيرة</option><option value="50">+٥٠٪ قمة</option><option value="100">+١٠٠٪ ديربي ناري</option></select></label></div><div class="modal-actions"><button type="submit" class="btn primary">حفظ أسعار التذاكر</button></div></form>`,
    );
  },
  "export-save": async () => {
    await exportGame(getState());
    toast("تم تجهيز ملف الحفظ للتنزيل.");
  },
  "import-save": chooseImport,
  "confirm-import": async () => {
    if (!pendingImport) return;
    await saveGame(pendingImport);
    setState(pendingImport);
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
    if (v) v.textContent = el.value;
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
                `<button data-nav="${id}">${icon(NAV_BY_ID[id].icon, 24)}<span>${NAV_BY_ID[id].name}</span></button>`,
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
      await saveGame(state);
      setState(state);
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
        <p class="muted">يتم الاحتفاظ بآخر ٥ حفظات لحسابك تلقائيًا. يمكنك استرجاع أي نسخة أو حذفها.</p>
        <div class="cloud-saves-container">
          ${saves.map(s => `
            <div class="cloud-save-item">
              <div class="cloud-save-info">
                <strong>${s.metadata.clubName} · الموسم ${s.metadata.seasonNumber}</strong>
                <small>${date(s.metadata.date)} · السيولة ${money(s.metadata.cash)} ${cur()} · ${s.metadata.device || "متصفح"}</small>
                <small class="muted">المزامنة: ${new Date(s.updatedAt).toLocaleString("ar-EG")}</small>
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
      if (!confirm(`${tr("التكلفة","Cost","Coût")}: ${quote.cost.toLocaleString()} · ${quote.days} ${tr("يوم","days","jours")}?`)) return;
      await apply((s) => startStadium(s, {tier,route,district,design}), tr("بدأ البناء.","Construction started.","Chantier commencé."));
      return;
    }
    if (form.id === "dynasty-marriage-form") {
      const partner = form.elements.partner.value;
      await apply(
        (s) => marryOwner(s, partner),
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
      await apply((s) => setPrices(s, ticket, shirt));
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
      let releaseClause = Number(form.elements.releaseClause.value);
      const clauseLevel = form.elements.clauseLevel?.value;
      if (clauseLevel) {
        const baseInput = document.getElementById("release-clause-input");
        // إذا اختار مستوى، نستخدم القيمة المحسوبة من المستوى إن لم يعدلها يدويًا بشكل كبير
        const selectedOption = form.elements.clauseLevel.selectedOptions[0];
        const levelClause = Number(selectedOption?.dataset?.clause || 0);
        if (levelClause === 0) releaseClause = 0;
        else if (Math.abs(releaseClause - levelClause) < levelClause * 0.5) releaseClause = levelClause;
      }
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
      await apply(
        (s) => transferToPersonal(s, amount),
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
          const r = startProject(
            s,
            form.dataset.id,
            form.elements.speed.value === "fast",
          );
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
        throw new Error("السعر من ٥٠ إلى ٥٠٠ جنيه.");
      const first = Number(form.elements.first.value),
        vip = Number(form.elements.vip.value),
        premium = Number(form.elements.premium.value);
      await apply((s) => {
        s.ticketPrice = p;
        setCategoryPrices(s, { first, vip });
        setMatchPremium(s, premium);
      }, "تم اعتماد أسعار الفئات والعلاوة للمباريات القادمة.");
      closeModal();
    }
  } catch (err) {
    showError(err.message);
  }
});
document.addEventListener("input", (e) => {
  if (e.target.closest("#offer-form,#contract-form")) updateCalculations();
  if (e.target.id === "palette-input") {
    paletteQuery(e.target.value);
    return;
  }
  if (e.target.id === "market-search") {
    const value = e.target.value,
      pos = e.target.selectionStart;
    ui.marketQuery = value;
    render();
    const input = document.getElementById("market-search");
    input?.focus();
    input?.setSelectionRange(pos, pos);
    return;
  }
  if (e.target.id === "player-search") {
    const value = e.target.value,
      pos = e.target.selectionStart;
    ui.playerFilters.search = value;
    ui.playerFilters.page = 0;
    render();
    const input = document.getElementById("player-search");
    input.focus();
    input.setSelectionRange(pos, pos);
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
document.addEventListener("change", async (e) => {
  if (isSaving() || actionBusy) return;
  try {
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
    if (e.target.id === "reduce-motion")
      await apply(
        (s) => (s.preferences.reduceMotion = e.target.checked),
        tr("تم حفظ إعداد العرض.", "Display setting saved.", "Réglage d'affichage enregistré."),
      );
    if (e.target.id === "num-format")
      await apply(
        (s) => (s.preferences.digits = e.target.value),
        tr("تم حفظ نمط الأرقام.", "Number style saved.", "Style des chiffres enregistré."),
      );
    if (e.target.closest("#offer-form,#contract-form")) updateCalculations();
  } catch (err) {
    showError(err.message);
  }
});
bindModalKeyboard();
async function bootstrap() {
  app.innerHTML = `<div style="padding:40px;text-align:center">جارٍ فتح الحفظة…</div>`;
  try {
    const loaded = await loadGame();
    setState(loaded.state);
    setLanguage(loaded.state?.preferences.language || getLanguage());
    render();
    if (loaded.backup)
      toast("تم استرجاع النسخة الاحتياطية بعد تعذر قراءة الحفظ الأساسي.", true);
    if (loaded.error) toast("الحفظة غير سليمة: " + loaded.error, true);
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
  if (isSaving() || actionBusy) {
    e.preventDefault();
    e.returnValue = "";
  }
});
