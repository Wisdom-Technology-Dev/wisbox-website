/* WISBOX inquiry form (shared by the site and the single-file HTML).
 * Buttons with [data-inquiry-open="personal|business"] open a native <dialog> with the form.
 * Steps: 準備 → 入力 → 確認 → 送信中 → 受付完了 / 送信失敗（入力内容は保持・再送可）.
 * Submits JSON to window.WISBOX_INQUIRY_ENDPOINT (default: same-origin /api/inquiry). Never uses mailto.
 * With window.WISBOX_INQUIRY_FORMAT = "lp" it posts straight to the WISBOX LP App's /api/inquiries in that
 * App's format (the static site has no server of its own), composing the same message the relay used to.
 *
 * A small copy of the page robot lives in the dialog ("stage") and acts out the real state only:
 * it rolls while the form is prepared or a request is in flight, and delivers the envelope into the
 * mailbox only after the server has accepted the inquiry. Animation timers never decide success. */
(function () {
  if (window.WBQ) return;
  var ENDPOINT = window.WISBOX_INQUIRY_ENDPOINT || "/api/inquiry";
  var LP_FORMAT = window.WISBOX_INQUIRY_FORMAT === "lp";
  var MIN_FILL_MS = 2500; // faster than a person can fill the form: treat as automated
  var TEL = "03-5829-5767";
  var HOURS = "平日 10:00〜19:00";

  var KINDS = {
    personal: {
      title: "お問い合わせフォーム",
      lead: "WISBOX のご利用に関するお問い合わせを受け付けています。内容を確認のうえ、担当者よりメールでご連絡いたします。",
      urgent: true,
      done: "内容を確認のうえ、担当者よりメールでご連絡いたします。",
      fields: [
        { id: "name", label: "お名前", required: true, max: 100, auto: "name", half: true },
        { id: "email", label: "メールアドレス", required: true, max: 254, type: "email", auto: "email", half: true },
        { id: "tel", label: "電話番号", max: 30, type: "tel", auto: "tel", hint: "任意", half: true },
        { id: "place", label: "ご利用場所", max: 100, hint: "任意・例：〇〇駅 東口", half: true },
        { id: "locker", label: "ロッカー番号", max: 20, hint: "任意・例：06", half: true },
        { id: "used_at", label: "ご利用日時", max: 60, hint: "任意・例：11月20日 15時ごろ", half: true },
        { id: "message", label: "お問い合わせ内容", required: true, max: 1500, multiline: true },
      ],
    },
    business: {
      title: "導入のご相談・お見積もり",
      lead: "施設への導入やお見積もりのご相談を受け付けています。担当者より5営業日以内にメールでご連絡いたします。",
      done: "担当者より5営業日以内にメールでご連絡いたします。",
      fields: [
        { id: "organization", label: "会社名・施設名", required: true, max: 200, auto: "organization" },
        { id: "name", label: "お名前", required: true, max: 100, auto: "name", half: true },
        { id: "email", label: "メールアドレス", required: true, max: 254, type: "email", auto: "email", half: true },
        { id: "tel", label: "電話番号", max: 30, type: "tel", auto: "tel", hint: "任意", half: true },
        { id: "units", label: "希望台数", max: 40, hint: "任意・例：10台程度", half: true },
        { id: "site", label: "設置予定場所", max: 100, hint: "任意・例：更衣室、エントランス" },
        { id: "message", label: "お問い合わせ内容", required: true, max: 1500, multiline: true },
      ],
    },
  };
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var SERVER_ERRORS = {
    invalid_email: "メールアドレスの形式を確認してください。",
    required_fields_missing: "必須項目を確認してください。",
    privacy_not_accepted: "個人情報の取り扱いへの同意が必要です。",
    too_long: "入力が長すぎる項目があります。内容を短くしてください。",
    rate_limited: "送信が集中しています。少し時間をおいて、もう一度お試しください。",
    too_fast: "送信までの時間が短すぎたため受け付けられませんでした。数秒おいてから、もう一度送信してください。",
  };

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var uid = function () {
    try {
      if (crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return "wbq-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  };

  /* per kind: { values, privacy, submissionId, openedAt, status: "" | "sending" | "done" | "failed", failure } */
  var state = {};
  var dlg, top, stage, main, bot, botBtn, kind, step, opener, prepT;
  var PREP_MS = 600;

  function s() {
    if (!state[kind]) state[kind] = { values: {}, privacy: false, submissionId: uid(), openedAt: Date.now(), status: "" };
    return state[kind];
  }

  /* ---------- the stage: a copy of the page robot, a mailbox and speed lines ---------- */
  var MAILBOX =
    '<svg class="wbq-mailbox" viewBox="0 0 120 130" aria-hidden="true" focusable="false">' +
    '<rect x="56" y="70" width="10" height="58" rx="4" fill="#8a8f98"/>' +
    '<path d="M14 30 a26 26 0 0 1 26 -26 h44 a26 26 0 0 1 26 26 v44 h-96 z" fill="#f5f5f3" stroke="#cccccb" stroke-width="4"/>' +
    '<rect x="26" y="34" width="54" height="9" rx="4.5" fill="#2b323a"/>' +
    '<g class="wbq-flag"><rect x="98" y="8" width="6" height="40" rx="3" fill="#8a8f98"/><rect x="98" y="8" width="20" height="13" rx="3" fill="#df7914"/></g>' +
    "</svg>";

  function buildStage() {
    stage = document.createElement("div");
    stage.className = "wbq-stage";
    stage.innerHTML = '<span class="wbq-lines" aria-hidden="true"><i></i><i></i><i></i></span>' + MAILBOX;
    botBtn = document.createElement("button");
    botBtn.type = "button";
    botBtn.className = "wbq-bot";
    botBtn.setAttribute("aria-label", "WISBOX のキャラクター");
    botBtn.setAttribute("tabindex", "-1");
    var src = document.querySelector('svg.wbr[data-robot]:not([data-robot="welcome"])');
    if (src && window.WBR && window.WBR.mini) {
      var svg = src.cloneNode(true);
      svg.querySelectorAll("[style]").forEach(function (n) {
        n.removeAttribute("style");
      });
      svg.removeAttribute("style");
      svg.setAttribute("class", "wbr wbq-bot-svg");
      svg.setAttribute("data-robot", "form");
      svg.setAttribute("data-rest", "rest");
      svg.setAttribute("data-pose", "rest");
      botBtn.appendChild(svg);
      stage.insertBefore(botBtn, stage.firstChild);
      bot = window.WBR.mini(svg);
    } else {
      stage.classList.add("is-empty"); // no robot on this page: text-only states still work
    }
    /* on the completion page a press is only a little celebration; it never sends anything */
    botBtn.addEventListener("click", function () {
      if (bot && step === "done") bot.celebrate();
    });
  }
  function scene(mode) {
    dlg.setAttribute("data-scene", mode); // prep | sending | done | compact
    botBtn.setAttribute("tabindex", mode === "done" ? "0" : "-1");
    botBtn.setAttribute("aria-label", mode === "done" ? "WISBOX のキャラクター（押すと喜びます）" : "WISBOX のキャラクター");
  }

  function ensureDialog() {
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.className = "wbq";
    dlg.setAttribute("aria-labelledby", "wbq-title");
    top = document.createElement("div");
    main = document.createElement("div");
    main.className = "wbq-main";
    buildStage();
    dlg.appendChild(top);
    dlg.appendChild(stage);
    dlg.appendChild(main);
    document.body.appendChild(dlg);
    dlg.addEventListener("close", function () {
      clearTimeout(prepT);
      if (bot) bot.reset(); // nothing keeps rolling behind a closed dialog
      if (step === "done") state[kind] = null; // the next inquiry starts fresh
      if (opener && opener.focus) opener.focus({ preventScroll: true }); // back to the entry, without moving the page
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close(); // backdrop click (a request in flight keeps going)
    });
    return dlg;
  }

  function header() {
    var cur = { prep: 0, input: 0, confirm: 1, sending: 1, failed: 1, done: 2 }[step];
    return (
      '<div class="wbq-head"><h2 id="wbq-title" class="wbq-title">' + esc(KINDS[kind].title) + "</h2>" +
      '<button type="button" class="wbq-x" data-wbq="close" aria-label="閉じる">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>' +
      '<ol class="wbq-steps" aria-label="入力の流れ">' +
      ["入力", "確認", "完了"].map(function (label, i) {
        return '<li class="' + (i === cur ? "is-current" : i < cur ? "is-done" : "") + '"' + (i === cur ? ' aria-current="step"' : "") + ">" + label + "</li>";
      }).join("") +
      "</ol>"
    );
  }
  function paint(bodyHtml) {
    top.innerHTML = header();
    main.innerHTML = bodyHtml;
  }

  function renderInput(errors) {
    var st = s();
    var k = KINDS[kind];
    errors = errors || {};
    var errIds = Object.keys(errors);
    var html = '<form class="wbq-body" novalidate>' + '<p class="wbq-lead">' + esc(k.lead) + "</p>";
    if (k.urgent) html += '<p class="wbq-urgent">お急ぎの方は、お電話（' + TEL + "／" + HOURS + "）でお問い合わせください。</p>";
    if (errIds.length) {
      html += '<div class="wbq-alert" role="alert" tabindex="-1" data-wbq="summary"><p>入力内容を確認してください（' + errIds.length + "件）。</p></div>";
    }
    html += '<div class="wbq-grid">';
    k.fields.forEach(function (f) {
      var id = "wbq-" + f.id;
      var v = st.values[f.id] || "";
      var err = errors[f.id];
      html += '<div class="wbq-field' + (f.half ? " is-half" : "") + (err ? " has-error" : "") + '"><label for="' + id + '">' + esc(f.label) +
        (f.required ? '<span class="wbq-req">必須</span>' : "") + (f.hint ? '<span class="wbq-hint">' + esc(f.hint) + "</span>" : "") + "</label>";
      var common = ' id="' + id + '" name="' + f.id + '" maxlength="' + f.max + '"' + (f.required ? ' aria-required="true"' : "") +
        (err ? ' aria-invalid="true" aria-describedby="' + id + '-err"' : "") + (f.auto ? ' autocomplete="' + f.auto + '"' : "");
      html += f.multiline
        ? "<textarea" + common + ' rows="4">' + esc(v) + "</textarea>"
        : "<input" + common + ' type="' + (f.type || "text") + '" value="' + esc(v) + '"' + (f.type === "email" ? ' inputmode="email"' : "") + ">";
      if (err) html += '<p class="wbq-err" id="' + id + '-err">' + esc(err) + "</p>";
      html += "</div>";
    });
    html += "</div>";
    html += '<p class="wbq-note">※ 暗証番号やお支払いのパスワードなどは入力しないでください。</p>';
    html += '<div class="wbq-hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>';
    html += '<div class="wbq-field wbq-consent' + (errors.privacy ? " has-error" : "") + '"><label class="wbq-check"><input type="checkbox" id="wbq-privacy" name="privacy"' +
      (st.privacy ? " checked" : "") + (errors.privacy ? ' aria-invalid="true" aria-describedby="wbq-privacy-err"' : "") + ">" +
      '<span>個人情報をお問い合わせへの回答にのみ利用することに同意します<span class="wbq-req">必須</span></span></label>' +
      (errors.privacy ? '<p class="wbq-err" id="wbq-privacy-err">' + esc(errors.privacy) + "</p>" : "") + "</div>";
    html += '<div class="wbq-actions"><button type="button" class="wb-btn wb-btn-text" data-wbq="close">キャンセル</button>' +
      '<button type="submit" class="wb-btn wb-btn-primary">入力内容を確認する</button></div></form>';
    paint(html);
    var form = main.querySelector("form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      collect(form);
      var errs = validate();
      if (Object.keys(errs).length) {
        renderInput(errs);
        var sum = main.querySelector('[data-wbq="summary"]');
        var first = main.querySelector('[aria-invalid="true"]');
        (first || sum).focus();
        if (bot) bot.hint(); // a gentle look at the form, nothing more
        return;
      }
      step = "confirm";
      render();
    });
    form.addEventListener("input", function () {
      collect(form);
    });
  }

  function collect(form) {
    var st = s();
    KINDS[kind].fields.forEach(function (f) {
      var el = form.elements[f.id];
      if (el) st.values[f.id] = el.value;
    });
    st.privacy = !!(form.elements.privacy && form.elements.privacy.checked);
    st.website = form.elements.website ? form.elements.website.value : "";
  }

  function validate() {
    var st = s();
    var errs = {};
    KINDS[kind].fields.forEach(function (f) {
      var v = (st.values[f.id] || "").trim();
      if (f.required && !v) errs[f.id] = f.label + "を入力してください。";
      else if (v.length > f.max) errs[f.id] = f.label + "は" + f.max + "文字以内で入力してください。";
      else if (f.id === "email" && v && !EMAIL.test(v)) errs[f.id] = "メールアドレスの形式が正しくありません（例：name@example.com）。";
      else if (f.id === "tel" && v && !/^[0-9０-９+\-－() ]{6,30}$/.test(v)) errs[f.id] = "電話番号は数字とハイフンで入力してください。";
    });
    if (!st.privacy) errs.privacy = "送信には、個人情報の取り扱いへの同意が必要です。";
    return errs;
  }

  function summaryList() {
    var st = s();
    return '<dl class="wbq-dl">' + KINDS[kind].fields.map(function (f) {
      var v = (st.values[f.id] || "").trim();
      return "<dt>" + esc(f.label) + "</dt><dd" + (v ? "" : ' class="is-empty"') + ">" + (v ? esc(v) : "未記入") + "</dd>";
    }).join("") + "</dl>";
  }

  function renderPrep() {
    scene("prep");
    paint('<div class="wbq-body wbq-status"><p role="status">お問い合わせフォームを準備しています</p></div>');
    if (bot) bot.run(false);
  }

  function renderConfirm(failure) {
    scene("compact");
    var html = '<div class="wbq-body">';
    if (failure) {
      html += '<div class="wbq-alert" role="alert" tabindex="-1" data-wbq="summary"><p><strong>送信できませんでした。</strong>' + esc(failure) +
        "</p><p>入力内容はそのまま残っています。もう一度送信するか、お急ぎの場合はお電話（" + TEL + "、" + HOURS + "）でもお受けしています。</p></div>";
    } else {
      html += '<p class="wbq-lead">以下の内容で送信します。よろしければ「送信する」を押してください。</p>';
    }
    html += summaryList();
    html += '<div class="wbq-actions"><button type="button" class="wb-btn wb-btn-text" data-wbq="back">入力内容を修正する</button>' +
      '<button type="button" class="wb-btn wb-btn-primary" data-wbq="send">' + (failure ? "もう一度送信する" : "送信する") + "</button></div></div>";
    paint(html);
    if (bot) {
      if (failure) bot.halt();
      else bot.hold(true); // holds the envelope while you check the summary
    }
  }

  function renderSending() {
    scene("sending");
    paint(
      '<div class="wbq-body wbq-status"><p role="status">お問い合わせを送信しています…</p>' +
      '<p class="wbq-note">この画面を閉じても送信は続きます。結果は、もう一度フォームを開くと確認できます。</p></div>'
    );
    if (bot) bot.run(true);
  }

  function renderDone(animate) {
    scene("done");
    var st = s();
    paint(
      '<div class="wbq-body wbq-done" role="status">' +
      '<p class="wbq-done-title">お問い合わせを受け付けました</p><p>' + esc(KINDS[kind].done) + "</p>" +
      '<p class="wbq-receipt">受付番号：' + esc(st.submissionId.slice(0, 8).toUpperCase()) + "</p>" +
      '<div class="wbq-actions"><button type="button" class="wb-btn wb-btn-primary" data-wbq="close">閉じる</button></div></div>'
    );
    var flag = stage.querySelector(".wbq-flag");
    if (!bot) return;
    if (!animate || bot.reduced()) {
      if (flag) flag.classList.add("is-up");
      bot.deliver(null);
      return;
    }
    /* the robot rolls the last bit to the mailbox, drops the envelope in, raises the flag, turns to you */
    var box = stage.querySelector(".wbq-mailbox");
    var dx = 0;
    try {
      dx = Math.max(0, box.getBoundingClientRect().left - botBtn.getBoundingClientRect().right + 6);
    } catch (e) {}
    botBtn.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + dx + "px)" }], { duration: 420, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" });
    bot.deliver(function () {
      if (flag) flag.classList.add("is-up");
    });
  }

  function render(failure) {
    flagReset();
    if (step === "prep") renderPrep();
    else if (step === "input") {
      scene("compact");
      if (bot) bot.hold(false);
      renderInput();
    } else if (step === "confirm") renderConfirm();
    else if (step === "failed") renderConfirm(failure || s().failure);
    else if (step === "sending") renderSending();
    else if (step === "done") renderDone(failure === true);
    var focusEl =
      main.querySelector('[data-wbq="summary"]') ||
      (step === "input" ? main.querySelector("input,textarea") : step === "done" ? main.querySelector('[data-wbq="close"].wb-btn') : step === "confirm" || step === "failed" ? main.querySelector('[data-wbq="send"]') : top.querySelector('[data-wbq="close"]'));
    if (focusEl) focusEl.focus();
  }
  function flagReset() {
    var flag = stage && stage.querySelector(".wbq-flag");
    if (flag && step !== "done") flag.classList.remove("is-up");
    if (botBtn && step !== "done") {
      botBtn.getAnimations && botBtn.getAnimations().forEach(function (a) {
        a.cancel();
      });
    }
    return false;
  }

  /* the result of the real request decides what happens next, wherever the user is */
  function finish(k, ok, failure) {
    var st = state[k];
    if (!st) return;
    st.status = ok ? "done" : "failed";
    st.failure = failure || "";
    if (dlg && dlg.open && kind === k && step === "sending") {
      step = ok ? "done" : "failed";
      render(ok ? true : failure);
    }
  }

  /* the LP App's inquiry shape: the extra fields go into a readable Japanese message */
  function lpPayload(p) {
    var line = function (label, value) {
      return label + "：" + (value || "未記入");
    };
    var business = p.kind === "business";
    var head = business
      ? ["【WISBOX ご利用案内サイト｜導入のご相談・お見積もり】", line("設置予定場所", p.site), line("希望台数", p.units)]
      : ["【WISBOX ご利用案内サイト｜ご利用に関するお問い合わせ】", line("ご利用場所", p.place), line("ロッカー番号", p.locker), line("ご利用日時", p.used_at)];
    return {
      submission_id: p.submission_id,
      inquiry_type: business ? "quote" : "inquiry",
      organization: business ? p.organization : "個人のお客様（ご利用者）",
      name: p.name,
      email: p.email,
      tel: p.tel,
      message: head.concat(["", p.message]).join("\n"),
    };
  }

  function send() {
    var st = s();
    if (st.status === "sending") return; // never two requests for one inquiry
    var k = kind;
    st.status = "sending";
    step = "sending";
    render();
    var v = st.values;
    var payload = {
      submission_id: st.submissionId,
      kind: k,
      name: (v.name || "").trim(),
      email: (v.email || "").trim(),
      tel: (v.tel || "").trim(),
      message: (v.message || "").trim(),
      organization: (v.organization || "").trim(),
      site: (v.site || "").trim(),
      units: (v.units || "").trim(),
      place: (v.place || "").trim(),
      locker: (v.locker || "").trim(),
      used_at: (v.used_at || "").trim(),
      privacy_ok: st.privacy === true,
      website: st.website || "",
      elapsed_ms: Date.now() - st.openedAt,
    };
    if (LP_FORMAT) {
      /* the checks the relay used to make, before anything leaves the browser */
      if (payload.website) return finish(k, true); // bot trap: people never fill it
      if (payload.elapsed_ms < MIN_FILL_MS) return finish(k, false, SERVER_ERRORS.too_fast);
      payload = lpPayload(payload);
    }
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, 20000);
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(function (res) {
        return res.json().catch(function () {
          return {};
        }).then(function (body) {
          return { ok: res.ok && body && body.ok === true, error: body && body.error, status: res.status };
        });
      })
      .catch(function (err) {
        return { ok: false, error: err && err.name === "AbortError" ? "timeout" : "network" };
      })
      .then(function (r) {
        clearTimeout(timer);
        if (r.ok) return finish(k, true);
        var msg =
          SERVER_ERRORS[r.error] ||
          (r.status === 404 || r.status === 405
            ? "お問い合わせの受付先がまだ設定されていないため、送信できませんでした（設定の不足です）。"
            : r.error === "timeout"
              ? "応答がないまま時間切れになりました。受け付けられていない可能性があります。時間をおいて、もう一度お試しください。"
              : r.error === "network"
                ? "通信がつながりませんでした。インターネット接続を確認のうえ、時間をおいてもう一度お試しください（お問い合わせの受付先が未設定・未公開の場合も、この表示になります）。"
                : "システムで問題が発生しました。");
        finish(k, false, msg);
      });
  }

  function open(k, btn) {
    kind = KINDS[k] ? k : "personal";
    opener = btn || document.activeElement;
    ensureDialog();
    var st = s();
    if (!st.openedAt) st.openedAt = Date.now();
    clearTimeout(prepT);
    if (bot) bot.reset();
    /* reopening never resends: show where this inquiry actually is */
    if (st.status === "sending") step = "sending";
    else if (st.status === "done") step = "done";
    else if (st.status === "failed") step = "failed";
    else step = bot && !bot.reduced() ? "prep" : "input";
    if (!dlg.open) {
      if (dlg.showModal) dlg.showModal();
      else dlg.setAttribute("open", "");
    }
    render();
    if (step === "prep") {
      prepT = setTimeout(function () {
        if (dlg.open && step === "prep") {
          step = "input";
          render();
        }
      }, PREP_MS);
    }
  }

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var openBtn = t.closest("[data-inquiry-open]");
    if (openBtn) {
      e.preventDefault(); // buttons only: no hash change, no scroll, no routing
      var k = openBtn.getAttribute("data-inquiry-open");
      /* the single-file HTML shares one header between both views: follow the visible view */
      if (openBtn.closest("header") && document.querySelector('main[data-view="business"]:not([hidden])')) k = "business";
      open(k, openBtn);
      return;
    }
    if (!dlg || !dlg.contains(t)) return;
    var act = t.closest("[data-wbq]");
    if (!act || act.disabled) return;
    var a = act.getAttribute("data-wbq");
    if (a === "close") {
      dlg.close();
    } else if (a === "back") {
      var st = s();
      if (st.status === "failed") st.status = "";
      step = "input";
      render();
    } else if (a === "send") {
      send();
    }
  });

  window.WBQ = { open: open, endpoint: ENDPOINT };
})();
