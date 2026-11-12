/* Agendamento pelo WhatsApp, usado pelos exemplos de serviço.
   A página define window.AGENDA = { nome, whatsapp, palavra, rotulo, botao, servicos:[{n,d,p,economia}], horas:[], fechado:[0..6], extra:{label,ph} }
   e um <div id="agenda"></div>. Botões com data-agendar="índice" escolhem o serviço e rolam até a agenda.
   Cores vêm das variáveis CSS da página: --a-card --a-line --a-ink --a-muted --a-accent --a-accent-ink --a-soft */
(function () {
  var A = window.AGENDA; var box = document.getElementById("agenda"); if (!A || !box) return;
  var css = "\
.ag{display:grid;grid-template-columns:1.35fr .9fr;gap:24px;align-items:start}\
.ag-steps{display:grid;gap:22px}\
.ag-step{background:var(--a-card);border:1px solid var(--a-line);border-radius:20px;padding:22px}\
.ag-step h3{display:flex;align-items:center;gap:12px;font-size:18px;margin:0 0 16px;color:var(--a-ink)}\
.ag-step h3 b{display:grid;place-items:center;min-width:34px;height:34px;border-radius:10px;background:var(--a-accent);color:var(--a-accent-ink);font-size:14px}\
.ag-svcs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\
.ag-svc{display:grid;gap:4px;text-align:left;border:1.5px solid var(--a-line);background:transparent;color:var(--a-ink);border-radius:14px;padding:12px 14px;cursor:pointer;font:inherit}\
.ag-svc b{font-weight:700}.ag-svc small{color:var(--a-muted);font-size:13px}\
.ag-svc[aria-pressed=true]{border-color:var(--a-accent);background:var(--a-soft)}\
.ag-row{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}.ag-row::-webkit-scrollbar{display:none}\
.ag-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px}\
.ag-chip{flex:none;border:1.5px solid var(--a-line);background:transparent;color:var(--a-ink);border-radius:12px;padding:10px 12px;font:inherit;font-weight:700;font-size:14px;cursor:pointer;text-align:center;line-height:1.2;min-width:64px}\
.ag-chip small{display:block;font-size:11px;font-weight:500;color:var(--a-muted);text-transform:uppercase;letter-spacing:.04em}\
.ag-chip[aria-pressed=true]{background:var(--a-accent);border-color:var(--a-accent);color:var(--a-accent-ink)}.ag-chip[aria-pressed=true] small{color:inherit;opacity:.85}\
.ag-chip:disabled{opacity:.35;cursor:not-allowed;text-decoration:line-through}\
.ag-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}\
.ag-fields label{display:grid;gap:6px;font-size:13px;font-weight:700;color:var(--a-muted)}\
.ag-fields input{font:inherit;color:var(--a-ink);background:transparent;border:1.5px solid var(--a-line);border-radius:12px;padding:12px;min-height:46px}\
.ag-fields input:focus{outline:0;border-color:var(--a-accent)}\
.ag-sum{position:sticky;top:90px;background:var(--a-card);border:1px solid var(--a-line);border-radius:20px;padding:24px;display:grid;gap:14px;color:var(--a-ink)}\
.ag-sum h3{margin:0;font-size:20px}\
.ag-sum dl{margin:0;display:grid;gap:10px}\
.ag-sum dl div{display:flex;justify-content:space-between;gap:12px;border-bottom:1px dashed var(--a-line);padding-bottom:10px;font-size:15px}\
.ag-sum dt{color:var(--a-muted)}.ag-sum dd{margin:0;font-weight:700;text-align:right}\
.ag-total{display:flex;justify-content:space-between;font-size:20px;font-weight:800}\
.ag-btn{display:flex;align-items:center;justify-content:center;gap:10px;min-height:54px;border-radius:14px;background:#1C9B4F;color:#fff;text-decoration:none;font-weight:800;font-size:16px}\
.ag-btn svg{width:22px;height:22px}\
.ag-note{font-size:13px;color:var(--a-muted);text-align:center}\
.ag-err{color:#E5484D;font-size:14px;font-weight:700}\
@media (max-width:860px){.ag{grid-template-columns:1fr}.ag-sum{position:static}}\
@media (max-width:480px){.ag-svcs,.ag-fields{grid-template-columns:1fr}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var fmt = function (v) { return v ? "R$ " + v.toFixed(2).replace(".", ",") : "Grátis"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var hoje = new Date(), dias = [];
  for (var k = 0; k < 8; k++) dias.push(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + k));
  var S = { s: 0, d: null, h: null };
  var wa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>';
  box.innerHTML = '<div class="ag"><div class="ag-steps">' +
    '<div class="ag-step"><h3><b>01</b>' + esc(A.rotulo || "Serviço") + '</h3><div class="ag-svcs" role="group" aria-label="' + esc(A.rotulo || "Serviço") + '">' +
    A.servicos.map(function (s, i) { return '<button type="button" class="ag-svc" data-ag-s="' + i + '" aria-pressed="' + (i === 0) + '"><b>' + esc(s.n) + "</b><small>" + esc(s.d) + " · " + fmt(s.p) + "</small></button>"; }).join("") + "</div></div>" +
    '<div class="ag-step"><h3><b>02</b>Dia</h3><div class="ag-row" role="group" aria-label="Dia">' +
    dias.map(function (x, i) { var fe = A.fechado.indexOf(x.getDay()) >= 0; return '<button type="button" class="ag-chip" data-ag-d="' + i + '" aria-pressed="false"' + (fe ? " disabled" : "") + "><small>" + (i === 0 ? "Hoje" : nomes[x.getDay()]) + "</small>" + x.getDate() + "<small>" + (fe ? "fechado" : meses[x.getMonth()]) + "</small></button>"; }).join("") + "</div></div>" +
    '<div class="ag-step"><h3><b>03</b>Horário</h3><div class="ag-grid" role="group" aria-label="Horário">' +
    A.horas.map(function (h, i) { return '<button type="button" class="ag-chip" data-ag-h="' + i + '" aria-pressed="false">' + h + "</button>"; }).join("") + "</div></div>" +
    '<div class="ag-step"><h3><b>04</b>Seus dados</h3><div class="ag-fields"><label>Nome<input id="ag-nome" autocomplete="name" placeholder="Seu nome"></label>' +
    (A.extra ? '<label>' + esc(A.extra.label) + '<input id="ag-extra" placeholder="' + esc(A.extra.ph) + '"></label>' : '<label>WhatsApp<input id="ag-tel" inputmode="tel" autocomplete="tel" placeholder="(44) 9 9999-9999"></label>') +
    "</div></div></div>" +
    '<aside class="ag-sum" aria-live="polite"><h3>Sua reserva</h3><dl><div><dt>' + esc(A.rotulo || "Serviço") + '</dt><dd id="ag-r-s"></dd></div><div><dt>Dia</dt><dd id="ag-r-d">Escolha</dd></div><div><dt>Horário</dt><dd id="ag-r-h">Escolha</dd></div></dl>' +
    '<div class="ag-total"><span>Total</span><span id="ag-r-t"></span></div><p class="ag-err" id="ag-err" hidden></p>' +
    '<a class="ag-btn" id="ag-go" href="#" target="_blank" rel="noopener">' + wa + esc(A.botao || "Confirmar pelo WhatsApp") + '</a><p class="ag-note">' + esc(A.nota || "Sem cadastro e sem pagamento antecipado.") + "</p></aside></div>";
  var $ = function (i) { return document.getElementById(i); };
  function marca(attr, v) { box.querySelectorAll("[" + attr + "]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute(attr) === String(v))); }); }
  function dataTxt(x) { return nomes[x.getDay()] + ", " + x.getDate() + " " + meses[x.getMonth()]; }
  function msg() {
    var s = A.servicos[S.s], L = ["*" + (A.palavra || "Agendamento") + " - " + A.nome + "*", "", (A.rotulo || "Serviço") + ": " + s.n + (s.p ? " (" + fmt(s.p) + ")" : ""), "Dia: " + dataTxt(dias[S.d]), "Horário: " + A.horas[S.h], "Nome: " + $("ag-nome").value.trim()];
    if (A.extra && $("ag-extra").value.trim()) L.push(A.extra.label + ": " + $("ag-extra").value.trim());
    if (!A.extra && $("ag-tel").value.trim()) L.push("WhatsApp: " + $("ag-tel").value.trim());
    return L.join("\n");
  }
  function pinta() {
    var s = A.servicos[S.s];
    $("ag-r-s").textContent = s.n; $("ag-r-t").textContent = fmt(s.p);
    $("ag-r-d").textContent = S.d == null ? "Escolha" : dataTxt(dias[S.d]);
    $("ag-r-h").textContent = S.h == null ? "Escolha" : A.horas[S.h];
    $("ag-err").hidden = true;
    if (S.d != null && S.h != null) $("ag-go").href = "https://wa.me/" + A.whatsapp + "?text=" + encodeURIComponent(msg());
  }
  box.addEventListener("click", function (e) {
    var s = e.target.closest("[data-ag-s]"), d = e.target.closest("[data-ag-d]"), h = e.target.closest("[data-ag-h]");
    if (s) { S.s = +s.getAttribute("data-ag-s"); marca("data-ag-s", S.s); }
    if (d && !d.disabled) { S.d = +d.getAttribute("data-ag-d"); marca("data-ag-d", S.d); }
    if (h) { S.h = +h.getAttribute("data-ag-h"); marca("data-ag-h", S.h); }
    if (s || d || h) pinta();
  });
  box.addEventListener("input", pinta);
  $("ag-go").addEventListener("click", function (e) {
    var er = [];
    if (S.d == null) er.push("Escolha o dia."); if (S.h == null) er.push("Escolha o horário."); if (!$("ag-nome").value.trim()) er.push("Informe seu nome.");
    if (er.length) { e.preventDefault(); $("ag-err").textContent = er.join(" "); $("ag-err").hidden = false; return; }
    this.href = "https://wa.me/" + A.whatsapp + "?text=" + encodeURIComponent(msg());
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-agendar]"); if (!b) return;
    e.preventDefault(); S.s = +b.getAttribute("data-agendar"); marca("data-ag-s", S.s); pinta();
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  pinta();
})();
