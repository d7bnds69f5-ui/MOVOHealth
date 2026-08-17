/* MOVO Health — formulieren
   Laden met: <script src="/assets/movo-forms.js" defer></script>
   Knoppen activeren met: data-movo-form="cijfers" | "voorstel" | "kennismaking"
*/
(function () {
  "use strict";

  /* ---------- MARKUP WORDT ZELF INGEVOEGD ---------- */
  var MARKUP = `<div class="movo-overlay" id="movo-modal" role="dialog" aria-modal="true" aria-labelledby="movo-title" data-open="false">
  <div class="movo-panel">
    <button type="button" class="movo-close" aria-label="Sluiten">&times;</button>

    <!-- ---------- succesbericht ---------- -->
    <div class="movo-done" id="movo-done">
      <p class="movo-eyebrow">Verzonden</p>
      <h2 id="movo-done-title">Dank — uw aanvraag staat bij ons.</h2>
      <p id="movo-done-body"></p>
    </div>

    <!-- ---------- formulier ---------- -->
    <form id="movo-form" novalidate>
      <p class="movo-eyebrow" id="movo-eyebrow"></p>
      <h2 id="movo-title"></h2>
      <p class="movo-lede" id="movo-lede"></p>

      <div id="movo-recap" class="movo-recap" hidden></div>
      <div id="movo-fields"></div>

      <label class="movo-consent">
        <input type="checkbox" name="akkoord" required>
        <span>Ik ga ermee akkoord dat MOVO Health mijn gegevens gebruikt om contact op te nemen over deze aanvraag. Geen nieuwsbrief, geen doorverkoop. Zie het privacybeleid.</span>
      </label>

      <input type="text" name="_gotcha" class="movo-hp" tabindex="-1" autocomplete="off" aria-hidden="true">

      <button type="submit" class="movo-submit" id="movo-submit"></button>
      <p class="movo-fineprint" id="movo-fineprint"></p>
      <div class="movo-error" id="movo-error" role="alert"></div>
    </form>
  </div>
</div>`;
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("movo-modal")) return;
    var host = document.createElement("div");
    host.innerHTML = MARKUP;
    document.body.appendChild(host.firstElementChild);
    init();
  });

  function init() {

    /* ---------- CONFIG ---------- */
    const CONFIG = {
      // Formspree: maak een form aan op formspree.io en plak het endpoint hier.
      // Alternatief EU-hosted: Tally, Formbricks, of Getform (EU-region).
      endpoint: "https://formspree.io/f/mljrpoln",

      // Selectors van de rekenmodule in sectie 05. Pas aan naar je eigen id's.
      // Laat leeg als je de rekensom niet wilt meesturen.
      calc: {
        medewerkers:   "#calc-medewerkers",
        verzuim:       "#calc-verzuim",
        reductie:      "#calc-reductie",
        huidigeKosten: "#calc-out-kosten",
        investering:   "#calc-out-investering",
        besparing:     "#calc-out-besparing",
        netto:         "#calc-out-netto"
      }
    };

    /* ---------- HERBRUIKBARE VELDEN ---------- */
    const F = {
      naam: `<div class="movo-row">
        <div class="movo-field">
          <label for="f-naam">Naam *</label>
          <input type="text" id="f-naam" name="naam" required autocomplete="name">
        </div>
        <div class="movo-field">
          <label for="f-functie">Functie *</label>
          <input type="text" id="f-functie" name="functie" required placeholder="HR-manager, directeur, …">
        </div>
      </div>`,

      bedrijf: `<div class="movo-row">
        <div class="movo-field">
          <label for="f-bedrijf">Organisatie *</label>
          <input type="text" id="f-bedrijf" name="organisatie" required autocomplete="organization">
        </div>
        <div class="movo-field">
          <label for="f-medewerkers">Aantal medewerkers *</label>
          <input type="number" id="f-medewerkers" name="aantal_medewerkers" required min="1" inputmode="numeric">
        </div>
      </div>`,

      contact: `<div class="movo-row">
        <div class="movo-field">
          <label for="f-email">Zakelijk e-mailadres *</label>
          <input type="email" id="f-email" name="email" required autocomplete="email">
        </div>
        <div class="movo-field">
          <label for="f-tel">Telefoon <span class="movo-hint">Optioneel</span></label>
          <input type="tel" id="f-tel" name="telefoon" autocomplete="tel">
        </div>
      </div>`,

      sector: `<div class="movo-field">
        <label for="f-sector">Sector *</label>
        <select id="f-sector" name="sector" required>
          <option value="">Kies een sector</option>
          <option>Productie / industrie</option>
          <option>Bouw / installatie</option>
          <option>Transport / logistiek</option>
          <option>Zorg / welzijn</option>
          <option>Retail / horeca</option>
          <option>Zakelijke dienstverlening</option>
          <option>ICT / technologie</option>
          <option>Overheid / onderwijs</option>
          <option>Anders</option>
        </select>
      </div>`,

      rol: `<div class="movo-field">
        <label for="f-rol">Uw rol in de beslissing *</label>
        <select id="f-rol" name="beslissingsrol" required>
          <option value="">Maak een keuze</option>
          <option>Ik beslis hierover</option>
          <option>Ik adviseer, iemand anders tekent</option>
          <option>Ik oriënteer me eerst</option>
        </select>
      </div>`,

      termijn: `<div class="movo-field">
        <label for="f-termijn">Gewenste startperiode *</label>
        <select id="f-termijn" name="startperiode" required>
          <option value="">Kies een periode</option>
          <option>Binnen 1 maand</option>
          <option>Dit kwartaal</option>
          <option>Volgend kwartaal</option>
          <option>Volgend budgetjaar</option>
          <option>Nog niet bepaald</option>
        </select>
      </div>`,

      arbodienst: `<div class="movo-field">
        <label for="f-arbo">Huidige arbodienst <span class="movo-hint">Wij vervangen deze niet — we sluiten erop aan</span></label>
        <input type="text" id="f-arbo" name="arbodienst" placeholder="bv. ArboNed, Zorg van de Zaak, geen">
      </div>`,

      wkr: `<div class="movo-field">
        <label for="f-wkr">Vrije ruimte WKR <span class="movo-hint">Weet u het niet? Wij rekenen het voor u door.</span></label>
        <select id="f-wkr" name="wkr_ruimte">
          <option value="">Maak een keuze</option>
          <option>Er is nog vrije ruimte</option>
          <option>Vrijwel volledig benut</option>
          <option>Weet ik niet</option>
        </select>
      </div>`,

      programma: `<div class="movo-field">
        <label for="f-programma">Programmavoorkeur *</label>
        <select id="f-programma" name="programma" required>
          <option value="">Maak een keuze</option>
          <option>MOVE — €45 per medewerker per maand</option>
          <option>TRACK — €65 per medewerker per maand (meest gekozen)</option>
          <option>THRIVE — €85 per medewerker per maand</option>
          <option>Adviseer mij op basis van onze situatie</option>
        </select>
      </div>`,

      deelnemers: `<div class="movo-field">
        <label for="f-deelnemers">Verwacht aantal deelnemers *<span class="movo-hint">Pilot start vanaf 20 deelnemers; programma's vanaf 10 medewerkers</span></label>
        <input type="number" id="f-deelnemers" name="aantal_deelnemers" required min="1" inputmode="numeric">
      </div>`,

      voorkeur: `<div class="movo-field">
        <label for="f-moment">Voorkeursmoment *</label>
        <select id="f-moment" name="voorkeursmoment" required>
          <option value="">Maak een keuze</option>
          <option>Ochtend (08:30 – 12:00)</option>
          <option>Middag (12:00 – 17:00)</option>
          <option>Vroege avond (17:00 – 19:00)</option>
          <option>Geen voorkeur</option>
        </select>
      </div>`,

      gespreksvorm: `<div class="movo-field">
        <label for="f-vorm">Vorm van het gesprek *</label>
        <select id="f-vorm" name="gespreksvorm" required>
          <option value="">Maak een keuze</option>
          <option>Videocall</option>
          <option>Bij ons op locatie</option>
          <option>Telefonisch</option>
        </select>
      </div>`,

      vraag: (label, ph) => `<div class="movo-field">
        <label for="f-vraag">${label} <span class="movo-hint">Optioneel</span></label>
        <textarea id="f-vraag" name="toelichting" placeholder="${ph}"></textarea>
      </div>`
    };

    /* ---------- DE DRIE FORMULIEREN ---------- */
    const FORMS = {
      cijfers: {
        eyebrow: "Uw rekensom",
        title: "Bespreek deze cijfers met ons",
        lede: "Wij toetsen uw berekening aan uw werkelijke verzuimcijfers en sturen binnen twee werkdagen een onderbouwde doorrekening — inclusief WKR-effect. Geen verkoopgesprek.",
        submit: "Stuur mijn rekensom door",
        fineprint: "Reactie binnen 2 werkdagen. Uw cijfers blijven vertrouwelijk.",
        useCalc: true,
        fields: [F.naam, F.bedrijf, F.contact, F.sector, F.wkr,
                 F.vraag("Waar twijfelt u aan in deze berekening?", "bv. Wij zitten vooral met langdurig verzuim op de productieafdeling…")],
        done: "Wij toetsen uw rekensom aan uw sector en verzuimprofiel en sturen binnen twee werkdagen een onderbouwde doorrekening. Zit er iets tussen dat niet klopt met uw praktijk? Antwoord gerust op die mail — daar leren wij van."
      },

      voorstel: {
        eyebrow: "Voorstel op maat",
        title: "Vraag een voorstel aan",
        lede: "U ontvangt een voorstel met programma, prijsopbouw per medewerker, WKR-documentatie en loonruilmodel — toegespitst op uw organisatie. Vrijblijvend.",
        submit: "Vraag het voorstel aan",
        fineprint: "Voorstel binnen 5 werkdagen. Opstartkosten €250 p.p. eenmalig · facturatie per kwartaal vooraf.",
        useCalc: true,
        fields: [F.naam, F.bedrijf, F.contact, F.sector, F.programma, F.deelnemers,
                 F.arbodienst, F.wkr, F.rol, F.termijn,
                 F.vraag("Wat moet in dit voorstel zeker aan bod komen?", "bv. onderbouwing voor de OR, of een variant met alleen de productieafdeling…")],
        done: "U ontvangt binnen vijf werkdagen een voorstel met programma-opzet, prijsopbouw, WKR-documentatie en het loonruilmodel. Wilt u iets eerder bespreken? Bel of mail info@movohealth.nl."
      },

      kennismaking: {
        eyebrow: "45 minuten",
        title: "Plan een kennismaking",
        lede: "Drie kwartier, videocall of bij u op locatie. Wij lopen uw verzuimcijfers door, laten zien hoe het programma bij een medewerker thuis werkt, en u hoort eerlijk of dit bij uw organisatie past.",
        submit: "Plan de kennismaking",
        fineprint: "Wij bevestigen binnen één werkdag met twee of drie concrete tijdstippen.",
        useCalc: false,
        fields: [F.naam, F.bedrijf, F.contact, F.sector, F.gespreksvorm, F.voorkeur,
                 F.vraag("Waar wilt u het zeker over hebben?", "bv. hoe de privacy van medewerkers geregeld is…")],
        done: "Wij nemen binnen één werkdag contact op met twee of drie concrete tijdstippen. Komt er in de tussentijd iets tussen? Mail gerust naar info@movohealth.nl."
      }
    };

    /* ---------- ELEMENTEN ---------- */
    const modal     = document.getElementById("movo-modal");
    const form      = document.getElementById("movo-form");
    const fieldsEl  = document.getElementById("movo-fields");
    const recapEl   = document.getElementById("movo-recap");
    const errorEl   = document.getElementById("movo-error");
    const doneEl    = document.getElementById("movo-done");
    const doneBody  = document.getElementById("movo-done-body");
    const submitBtn = document.getElementById("movo-submit");
    let lastFocus = null;

    /* ---------- REKENSOM UITLEZEN ---------- */
    function readCalc() {
      const out = {};
      const labels = {
        medewerkers: "Aantal medewerkers", verzuim: "Verzuimpercentage",
        reductie: "Verwachte reductie", huidigeKosten: "Huidige verzuimkosten / jaar",
        investering: "MOVO-investering jaar 1", besparing: "Besparing", netto: "Netto resultaat jaar 1"
      };
      for (const key in CONFIG.calc) {
        const el = document.querySelector(CONFIG.calc[key]);
        if (!el) continue;
        const val = ("value" in el ? el.value : el.textContent || "").trim();
        if (val && val !== "—") out[labels[key]] = val;
      }
      return out;
    }

    function renderRecap(data) {
      const keys = Object.keys(data);
      if (!keys.length) { recapEl.hidden = true; return; }
      recapEl.hidden = false;
      recapEl.innerHTML = "<dl>" + keys.map(k =>
        `<dt>${k}</dt><dd>${data[k]}</dd>`).join("") + "</dl>";
    }

    /* ---------- OPENEN / SLUITEN ---------- */
    function open(type, trigger) {
      const cfg = FORMS[type];
      if (!cfg) return;
      lastFocus = trigger || document.activeElement;

      document.getElementById("movo-eyebrow").textContent   = cfg.eyebrow;
      document.getElementById("movo-title").textContent     = cfg.title;
      document.getElementById("movo-lede").textContent      = cfg.lede;
      document.getElementById("movo-fineprint").textContent = cfg.fineprint;
      submitBtn.textContent = cfg.submit;
      fieldsEl.innerHTML = cfg.fields.join("");

      const calc = cfg.useCalc ? readCalc() : {};
      renderRecap(calc);
      form.dataset.calc = JSON.stringify(calc);
      form.dataset.type = type;

      // vul aantal medewerkers voor vanuit de rekenmodule
      const mw = document.getElementById("f-medewerkers");
      if (mw && calc["Aantal medewerkers"]) mw.value = String(calc["Aantal medewerkers"]).replace(/\D/g, "");

      form.hidden = false;
      doneEl.dataset.show = "false";
      errorEl.dataset.show = "false";
      form.reset();
      modal.dataset.open = "true";
      document.body.style.overflow = "hidden";
      setTimeout(() => { const f = form.querySelector("input,select,textarea"); if (f) f.focus(); }, 60);
    }

    function close() {
      modal.dataset.open = "false";
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    /* ---------- TRIGGERS ---------- */
    document.addEventListener("click", function (e) {
      const t = e.target.closest("[data-movo-form]");
      if (t) { e.preventDefault(); open(t.getAttribute("data-movo-form"), t); return; }
      if (e.target.closest(".movo-close") || e.target === modal) close();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.dataset.open === "true") close();
    });

    /* ---------- VERZENDEN ---------- */
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorEl.dataset.show = "false";

      if (!form.checkValidity()) {
        const bad = form.querySelector(":invalid");
        if (bad) { bad.focus(); bad.scrollIntoView({ block: "center", behavior: "smooth" }); }
        errorEl.textContent = "Een paar velden zijn nog niet ingevuld. Ze zijn hierboven gemarkeerd.";
        errorEl.dataset.show = "true";
        return;
      }

      const type = form.dataset.type;
      const calc = JSON.parse(form.dataset.calc || "{}");
      const data = Object.fromEntries(new FormData(form).entries());

      const payload = Object.assign({}, data, calc, {
        _subject: `[${type.toUpperCase()}] ${data.organisatie || "onbekend"} — ${data.naam || ""}`,
        formulier: FORMS[type].title,
        pagina: location.href,
        tijdstip: new Date().toLocaleString("nl-NL")
      });

      submitBtn.disabled = true;
      const original = submitBtn.textContent;
      submitBtn.textContent = "Versturen…";

      try {
        const res = await fetch(CONFIG.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(res.status);

        form.hidden = true;
        doneBody.textContent = FORMS[type].done;
        doneEl.dataset.show = "true";
        doneEl.scrollIntoView({ block: "nearest" });

        if (window.gtag) gtag("event", "generate_lead", { form_type: type });
      } catch (err) {
        errorEl.innerHTML = 'Verzenden lukte niet. Probeer het opnieuw, of mail rechtstreeks naar <a href="mailto:info@movohealth.nl">info@movohealth.nl</a>.';
        errorEl.dataset.show = "true";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
    });
  }
})();
