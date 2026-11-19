// ==UserScript==
// @name         Marketup - Exportar notas do mês anterior
// @namespace    https://github.com/consultoriatakaes-art
// @version      1.0.1
// @description  Exporta o relatório de notas (Excel) e os XMLs do mês anterior no Marketup
// @author       Consultoria Takaes
// @homepageURL  https://github.com/consultoriatakaes-art/marketup-exportar
// @match        https://*.marketup.com/app/invoices*
// @run-at       document-idle
// @noframes
// @grant        GM_download
// @connect      marketup-temp.s3-us-west-2.amazonaws.com
// @connect      amazonaws.com
// @updateURL    https://raw.githubusercontent.com/consultoriatakaes-art/marketup-exportar/main/marketup-exportar.user.js
// @downloadURL  https://raw.githubusercontent.com/consultoriatakaes-art/marketup-exportar/main/marketup-exportar.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Só roda quando aberto com ?auto=1
  const params = new URLSearchParams(location.search);
  if (params.get('auto') === '1') sessionStorage.setItem('mkAuto', '1');
  if (sessionStorage.getItem('mkAuto') !== '1') return;

  // 1) Filtro do mês anterior
  if (!params.get('issuedFrom')) {
    const h = new Date();
    const ini = new Date(h.getFullYear(), h.getMonth() - 1, 1);
    const fim = new Date(h.getFullYear(), h.getMonth(), 0);
    const f = d => d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    location.replace(location.pathname +
      '?issuedFrom=' + f(ini) + '&issuedTo=' + f(fim));
    return;
  }

  // ---------- auxiliares ----------
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const norm = s => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const visivel = e => e && e.getClientRects().length > 0;
  const overlay = () => document.querySelector('.cdk-overlay-container');
  const dentroOverlay = e => overlay() && overlay().contains(e);

  const ROTULOS = '.mat-mdc-menu-item-text, .mdc-button__label, .mdc-list-item__primary-text';
  const CLICAVEL = 'button, a, [role="menuitem"], [role="option"], mat-option';

  async function esperar(fn, tempo = 20000) {
    const inicio = Date.now();
    while (Date.now() - inicio < tempo) {
      const r = fn();
      if (r) return r;
      await sleep(300);
    }
    return null;
  }

  // onde: 'overlay' (menus/janelas) ou 'pagina' (fora do overlay)
  function achar(texto, onde) {
    const lista = [...document.querySelectorAll(ROTULOS)]
      .filter(s => visivel(s) && norm(s.textContent) === norm(texto))
      .filter(s => onde === 'pagina' ? !dentroOverlay(s) : dentroOverlay(s))
      .map(s => s.closest(CLICAVEL) || s);
    return lista[lista.length - 1];
  }

  function textosVisiveis(onde) {
    return [...new Set([...document.querySelectorAll(ROTULOS)]
      .filter(s => visivel(s) && (onde === 'pagina' ? !dentroOverlay(s) : dentroOverlay(s)))
      .map(s => norm(s.textContent)).filter(Boolean))].slice(0, 25).join(' | ');
  }

  async function clicar(texto, onde, tempo) {
    const el = await esperar(() => achar(texto, onde), tempo);
    if (!el) throw new Error('Não encontrei "' + texto + '" (' + onde + '). Textos visíveis: ' + textosVisiveis(onde));
    el.click();
    await sleep(1000);
  }

  async function abrirMenu(opcao) {
    await clicar('Mais', 'pagina');
    await clicar(opcao, 'overlay');
  }

  const dialogoAberto = () =>
    [...document.querySelectorAll('mat-dialog-container, .mat-mdc-dialog-container, [role="dialog"]')].some(visivel);

  async function fecharDialogo() {
    if (!dialogoAberto()) return;
    const b = achar('Fechar', 'overlay') || achar('Cancelar', 'overlay');
    if (b) b.click();
    await esperar(() => !dialogoAberto(), 5000);
    await sleep(600);
  }

  // Primeiro link "Baixar arquivo" da lista (o mais recente)
  const primeiroLink = () =>
    [...(overlay() || document).querySelectorAll('a')]
      .find(a => visivel(a) && norm(a.textContent) === 'baixar arquivo' && a.href);

  async function escolherTipoXML() {
    const sel = await esperar(() =>
      [...(overlay() || document).querySelectorAll('mat-select')].find(visivel), 8000);
    if (!sel) throw new Error('Não achei a caixa de seleção. Textos visíveis: ' + textosVisiveis('overlay'));
    sel.click();
    await sleep(800);
    await clicar('XML - Envio', 'overlay');
  }

  // ---------- fluxo ----------
  (async () => {
    try {
      await sleep(3000);

      // A) Relatório Excel: Mais > Exportar > Exportar (janela)
      await abrirMenu('Exportar');
      await clicar('Exportar', 'overlay');
      await sleep(4000);
      await fecharDialogo();

      // B) XMLs: Mais > Exportar XMLs > XML - Envio > Solicitar exportação
      await abrirMenu('Exportar XMLs');
      await sleep(1500);
      const antigo = primeiroLink() ? primeiroLink().href : null;
      await escolherTipoXML();
      await clicar('Solicitar exportação', 'overlay');
      await sleep(2000);
      await fecharDialogo();

      // C) Aguarda ~7s e pega o primeiro link novo da lista
      await sleep(7000);
      let baixou = false;
      for (let i = 0; i < 12 && !baixou; i++) {
        await abrirMenu('Exportar XMLs');
        await sleep(1500);
        const a = primeiroLink();
        if (a && a.href !== antigo) {
          const cliente = location.hostname.split('.')[0];
          const nome = cliente + '_' + a.href.split('/').pop().split('?')[0];
          try {
            GM_download({ url: a.href, name: nome, onerror: () => a.click() });
          } catch (e) { a.click(); }
          baixou = true;
          await sleep(3000);
        }
        await fecharDialogo();
        if (!baixou) await sleep(5000);
      }
      if (!baixou) alert('Script Marketup: o link do XML não apareceu a tempo. Verifique manualmente.');
    } catch (e) {
      console.error('Script Marketup:', e);
      alert('Script Marketup parou: ' + e.message);
    } finally {
      sessionStorage.removeItem('mkAuto');
    }
  })();
})();
