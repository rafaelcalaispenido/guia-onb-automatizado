  let currentStep = 1;
  const totalSteps = 6;

  // ── FLOW STATE ─────────────────────────────────────────
  let selectedTypes = { servico: false, produto: false, outro: false };

  function startFlow() {
    // Card is already in mode-type (type selection ready behind welcome)
    // Just hide the welcome screen to reveal it
    document.getElementById('screen-welcome').classList.add('hidden');
    // Remove after transition so it doesn't block clicks
    setTimeout(() => {
      document.getElementById('screen-welcome').style.display = 'none';
    }, 450);
  }

  function selectType(type) {
    selectedTypes.servico = false;
    selectedTypes.outro = false;
    selectedTypes[type] = true;
    document.getElementById('type-servico').classList.toggle('selected', type === 'servico');
    document.getElementById('type-outro').classList.toggle('selected', type === 'outro');
    document.getElementById('type-error').style.display = 'none';
  }

  // ── TRANSITION HELPER ──────────────────────────────────
  function withTransition(fn) {
    const overlay = document.getElementById('step-overlay');
    overlay.classList.add('fading');
    setTimeout(() => {
      fn();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.classList.remove('fading');
      }));
    }, 300);
  }

  // navToStep: adds transition, then calls goToStep
  function navToStep(n) {
    if (n === currentStep) return;
    withTransition(() => goToStep(n));
  }

  function confirmType() {
    if (!selectedTypes.servico && !selectedTypes.outro) {
      document.getElementById('type-error').style.display = 'block';
      return;
    }
    if (selectedTypes.outro) {
      openModal('modal-redirect');
      return;
    }
    withTransition(() => {
      document.querySelector('.card').classList.remove('mode-type');
      goToStep(1);
    });
  }

  function goToExternalConfig() {
    window.open('https://enotas.com.br/guiaconfiguracoes/?etapa=2', '_blank');
  }

  function goToProductGuide() {
    withTransition(() => {
      document.querySelector('.card').classList.add('mode-product');
    });
  }

  function finishGuide() {
    const welcome = document.getElementById('screen-welcome');
    welcome.style.display = '';
    withTransition(() => {
      document.querySelector('.card').classList.remove('mode-product');
      document.querySelector('.card').classList.add('mode-type');
      selectedTypes = { servico: false, produto: false, outro: false };
      document.getElementById('type-servico').classList.remove('selected');
      document.getElementById('type-outro').classList.remove('selected');
      document.getElementById('type-error').style.display = 'none';
      goToStep(1);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        welcome.classList.remove('hidden');
      }));
    });
  }

  function openLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(e) {
    if (e && e.target !== document.getElementById('lightbox') && e.target !== document.querySelector('.lightbox-close')) return;
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }


  function openTip(e) {
    e.stopPropagation();
    document.getElementById('tip-overlay').classList.add('open');
  }

  function closeTip(e) {
    e.stopPropagation();
    document.getElementById('tip-overlay').classList.remove('open');
  }

  // ── TUTORIAL CAMPOS FISCAIS ───────────────────────────
  // form: highlight on Preenchimento_Manual.jpg (% of image)
  //   top, left, w, h — as % of image dimensions
  // nf: zoom area on nota_fiscal.jpg
  //   cx, cy = center of field as % of image; scale = zoom level (1 = fit width)
  const tutorialFields = [
    {
      // Passo 0: Visão geral — nota fiscal inteira, sem highlight
      name: 'Visão geral da Nota Fiscal',
      text: 'Esta é a sua NFS-e emitida pelo Portal Nacional. Nos próximos passos vamos identificar cada campo que precisa ser preenchido no eNotas.',
      note: null,
      caption: 'NFS-e — Nota Fiscal de Serviço Eletrônica',
      form: { top: 0, left: 0, w: 0, h: 0 },
      nf:   { cx: 50, cy: 50, scale: 1, hlW: 0, hlH: 0 }
    },
    {
      name: 'Inscrição Municipal',
      text: 'A inscrição municipal identifica sua empresa junto à prefeitura. Ela pode ser localizada diretamente na sua NFS-e já emitida, dentro do bloco <strong>EMITENTE DA NFS-e</strong>.',
      note: '* Se o campo aparecer com um hífen ("-") na sua NFS-e emitida, preencha como "0" no eNotas. Esse número também consta no alvará de funcionamento ou pode ser obtido na prefeitura.',
      caption: 'EMITENTE DA NFS-e → campo "Inscrição Municipal"',
      form: { top: 23, left: 0, w: 100, h: 11 },
      nf:   { cx: 55.2, cy: 14.9, scale: 2, hlW: 0.121, hlH: 0.016 }
    },
    {
      name: 'Código de Tributação Nacional',
      text: 'O Código de Tributação Nacional está disponível dentro dos campos de <strong>Serviço Prestado</strong> da sua NFS-e já emitida.',
      note: '* Esse código segue a <a href="https://www.gov.br/nfse/pt-br/mei-e-demais-empresas/codigos-de-tributacao-nacional-nbs" target="_blank">tabela de tributação nacional de serviços</a>.',
      caption: 'SERVIÇO PRESTADO → "Código de Tributação Nacional"',
      form: { top: 31, left: 0, w: 100, h: 16 },
      nf:   { cx: 10.8, cy: 36.1, scale: 2.5, hlW: 0.173, hlH: 0.025 }
    },
    {
      name: 'Código de Tributação Municipal',
      text: 'O Código de Tributação Municipal também está disponível dentro dos campos de <strong>Serviço Prestado</strong> na sua NFS-e emitida.',
      note: '* Cada município tem sua própria codificação de serviços. Este código complementa o código nacional e é específico da prefeitura onde sua empresa é registrada.',
      caption: 'SERVIÇO PRESTADO → "Código de Tributação Municipal"',
      form: { top: 45.9, left: 0.7, w: 47.5, h: 7.6 },
      nf:   { cx: 34.7, cy: 36.0, scale: 1.8, hlW: 0.180, hlH: 0.021 }
    },
    {
      name: 'Alíquota de ISS',
      text: 'O campo Alíquota ISS está localizado dentro de <strong>Tributação Municipal</strong>, identificado como <strong>"Alíquota Aplicada"</strong> na sua nota fiscal emitida.',
      note: '* A alíquota do ISS varia por município (geralmente entre 2% e 5%).',
      caption: 'TRIBUTAÇÃO MUNICIPAL → "Alíquota Aplicada"',
      form: { top: 46.1, left: 50.8, w: 47.5, h: 7.6 },
      nf:   { cx: 31.3, cy: 50.8, scale: 2.5, hlW: 0.106, hlH: 0.019 }
    },
    {
      name: 'Código NBS, Classificação Tributária e Indicador de Operação',
      text: 'Se aplicável — estão localizados na seção <strong>Informações Complementares</strong> da sua NFS-e já emitida.',
      note: '* Esses campos são relativos à Reforma Tributária (IBS/CBS). São opcionais dependendo da prefeitura.',
      caption: 'INFORMAÇÕES COMPLEMENTARES',
      form: { top: 55.4, left: 0.3, w: 99.4, h: 26.5 },
      nf:   { cx: 14.3, cy: 72.3, scale: 1.5, hlW: 0.257, hlH: 0.035 }
    },
    {
      name: 'Percentual aproximado de tributos',
      text: 'Se aplicável — estão localizados na seção <strong>Totais Aproximados dos Tributos</strong> da sua NFS-e já emitida.',
      note: null,
      caption: 'TOTAIS APROXIMADOS DOS TRIBUTOS → Federais, Estaduais, Municipais',
      form: { top: 83.3, left: 0.3, w: 98.4, h: 10.8 },
      nf:   { cx: 50, cy: 69, scale: 1.8, hlW: 0.82, hlH: 0.03 }
    }
  ];

  let tutStep = 0;

  function openTutorial(e) {
    if (e) e.stopPropagation();
    tutStep = 0;
    renderTutStep();
    document.getElementById('tutorial-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTutorial(e) {
    if (e && e.target !== document.getElementById('tutorial-overlay')) return;
    document.getElementById('tutorial-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function tutNav(dir) {
    tutStep = Math.max(0, Math.min(tutorialFields.length - 1, tutStep + dir));
    renderTutStep();
  }

  function renderTutStep() {
    const f = tutorialFields[tutStep];
    const total = tutorialFields.length;
    const isIntro = tutStep === 0;

    // Label: passo 0 = "Visão geral", demais = "Passo X de Y"
    document.getElementById('tut-step-label').textContent = isIntro
      ? 'Visão geral'
      : 'Passo ' + tutStep + ' de ' + (total - 1);
    document.getElementById('tut-header-title').textContent = f.name;
    document.getElementById('tut-desc-name').textContent = f.name;
    document.getElementById('tut-desc-text').innerHTML = f.text;

    const noteEl = document.getElementById('tut-desc-note');
    if (f.note) { noteEl.innerHTML = f.note; noteEl.style.display = 'block'; }
    else { noteEl.style.display = 'none'; }

    document.getElementById('tut-nf-caption').textContent = f.caption;

    // Esconde highlight do formulário no passo 0
    const formHl = document.getElementById('tut-form-hl');
    if (isIntro) {
      formHl.style.display = 'none';
      // Reseta imagem do formulário para o topo
      document.getElementById('tut-form-img').style.top = '0px';
    } else {
      formHl.style.display = 'block';
    }

    // Dots — não mostra o dot do passo 0
    const dotsEl = document.getElementById('tut-dots');
    dotsEl.innerHTML = '';
    for (let i = 1; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'tut-dot' + (i === tutStep ? ' active' : '');
      d.onclick = () => { tutStep = i; renderTutStep(); };
      dotsEl.appendChild(d);
    }

    // Buttons
    document.getElementById('tut-btn-back').style.visibility = tutStep === 0 ? 'hidden' : 'visible';
    const nextBtn = document.getElementById('tut-btn-next');
    if (isIntro) {
      nextBtn.textContent = 'Começar';
      nextBtn.onclick = () => tutNav(1);
    } else {
      nextBtn.textContent = tutStep === total - 1 ? 'Concluir' : 'Próximo';
      nextBtn.onclick = tutStep === total - 1 ? () => closeTutorial() : () => tutNav(1);
    }

    // Apply form highlight
    applyFormHighlight(f.form);

    // Apply NF zoom
    applyNFZoom(f.nf);
  }

  function applyFormHighlight(fm) {
    const img = document.getElementById('tut-form-img');
    const wrap = document.getElementById('tut-form-wrap');
    const hl = document.getElementById('tut-form-hl');

    function pos() {
      // Use the rendered width; height is derived from natural aspect ratio
      const iw = img.offsetWidth;
      const natW = img.naturalWidth  || iw;
      const natH = img.naturalHeight || iw * 1.5;
      const ih = iw * natH / natW;   // true rendered height (image taller than container)

      hl.style.left   = (fm.left / 100 * iw) + 'px';
      hl.style.width  = (fm.w    / 100 * iw) + 'px';
      hl.style.height = (fm.h    / 100 * ih) + 'px';

      // Center the highlight vertically in the container
      const hlTop  = fm.top / 100 * ih;
      const hlBot  = (fm.top + fm.h) / 100 * ih;
      const hlMid  = (hlTop + hlBot) / 2;
      const wrapH  = wrap.clientHeight;
      const newTop = wrapH / 2 - hlMid;
      const clampedTop = Math.min(0, Math.max(wrapH - ih, newTop));
      img.style.top = clampedTop + 'px';

      // Position highlight relative to the scrolled image top
      hl.style.top = (clampedTop + hlTop) + 'px';
    }

    if (img.complete && img.naturalWidth) pos();
    else img.onload = pos;
    setTimeout(pos, 80);
  }

  function applyNFZoom(nf) {
    const img  = document.getElementById('tut-nf-zoom-img');
    const wrap = document.getElementById('tut-nf-zoom-wrap');
    const hl   = document.getElementById('tut-nf-hl');

    function pos() {
      const cw   = wrap.clientWidth;
      const ch   = wrap.clientHeight;
      const natW = img.naturalWidth  || 800;
      const natH = img.naturalHeight || 1100;

      // Rendered size with object-fit:contain + center
      const imgAspect  = natW / natH;
      const wrapAspect = cw / ch;
      let rendW, rendH, offX, offY;
      if (imgAspect < wrapAspect) {
        rendH = ch; rendW = ch * imgAspect;
        offX = (cw - rendW) / 2; offY = 0;
      } else {
        rendW = cw; rendH = cw / imgAspect;
        offX = 0; offY = (ch - rendH) / 2;
      }

      const scale = nf.scale || 1;

      // Field center in container coords (before zoom)
      const fieldX = offX + (nf.cx / 100) * rendW;
      const fieldY = offY + (nf.cy / 100) * rendH;

      // With transform-origin: 0 0, scale() multiplies all coords by scale.
      // We want fieldX*scale + tx = cw/2  →  tx = cw/2 - fieldX*scale
      const tx = cw / 2 - fieldX * scale;
      const ty = ch / 2 - fieldY * scale;

      img.style.transformOrigin = '0 0';
      img.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';

      // Highlight always at container center
      if (!nf.hlW || !nf.hlH) {
        hl.style.display = 'none';
      } else {
        const hlW = rendW * nf.hlW * scale;
        const hlH = rendH * nf.hlH * scale;
        hl.style.display  = 'block';
        hl.style.position = 'absolute';
        hl.style.width    = hlW + 'px';
        hl.style.height   = hlH + 'px';
        hl.style.left     = (cw / 2 - hlW / 2) + 'px';
        hl.style.top      = (ch / 2 - hlH / 2) + 'px';
      }
    }

    if (img.complete && img.naturalWidth) pos();
    else img.onload = pos;
    setTimeout(pos, 80);
  }

  // openTip3 / closeTip3 now open the tutorial
  function openTip3(e) {
    if (e) e.stopPropagation();
    openTutorial(null);
  }
  function closeTip3(e) { closeTutorial(null); }


  function openTip2(e) {
    e.stopPropagation();
    document.getElementById('tip-overlay-2').classList.add('open');
  }

  function closeTip2(e) {
    e.stopPropagation();
    document.getElementById('tip-overlay-2').classList.remove('open');
  }

  // Recalcula posições quando o browser é redimensionado ou zoom muda
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const overlay = document.getElementById('tutorial-overlay');
      if (overlay.classList.contains('open')) {
        applyFormHighlight(tutorialFields[tutStep].form);
        applyNFZoom(tutorialFields[tutStep].nf);
      }
    }, 100);
  });

  document.addEventListener('keydown', function(ev) {
    if (ev.key === 'Escape') {
      document.getElementById('tip-overlay').classList.remove('open');
      document.getElementById('tip-overlay-2').classList.remove('open');
      document.getElementById('tip-overlay-3') && document.getElementById('tip-overlay-3').classList.remove('open');
      document.getElementById('tutorial-overlay').classList.remove('open');
      document.getElementById('lightbox').classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // ── CALIBRATION TOOL ─────────────────────────────────
  let calibActive = false;
  let calibPoints = [];

  function toggleCalib() {
    calibActive = !calibActive;
    const box  = document.getElementById('calib-box');
    const info = document.getElementById('calib-info');
    const btn  = document.getElementById('calib-btn');
    if (calibActive) {
      box.style.display  = 'block';
      info.style.display = 'block';
      info.textContent   = '📍 Clique no CANTO SUPERIOR ESQUERDO do campo';
      btn.textContent    = '❌ Sair calibração';
      calibPoints = [];
    } else {
      box.style.display  = 'none';
      info.style.display = 'none';
      btn.textContent    = '📍 Calibrar';
      calibPoints = [];
    }
  }

  function calibClick(e) {
    const img  = document.getElementById('tut-form-img');
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    const info = document.getElementById('calib-info');
    calibPoints.push({ x: parseFloat(x), y: parseFloat(y) });

    if (calibPoints.length === 1) {
      info.textContent = '📍 Ponto 1: left=' + x + '%, top=' + y + '%\nAgora clique no CANTO INFERIOR DIREITO';
    } else if (calibPoints.length === 2) {
      const p1 = calibPoints[0], p2 = calibPoints[1];
      const left = Math.min(p1.x, p2.x).toFixed(1);
      const top  = Math.min(p1.y, p2.y).toFixed(1);
      const w    = Math.abs(p2.x - p1.x).toFixed(1);
      const h    = Math.abs(p2.y - p1.y).toFixed(1);
      info.textContent = '✅ RESULTADO:\nform: { top: ' + top + ', left: ' + left + ', w: ' + w + ', h: ' + h + ' }\n\nClique novamente para novo campo';
      calibPoints = [];
    }
  }

  // ── CALIBRATION TOOL — NF ────────────────────────────
  let calibNFActive = false;
  let calibNFPoints = [];

  function toggleCalibNF() {
    calibNFActive = !calibNFActive;
    const box  = document.getElementById('calib-nf-box');
    const info = document.getElementById('calib-nf-info');
    const btn  = document.getElementById('calib-nf-btn');
    const img  = document.getElementById('tut-nf-zoom-img');
    const wrap = document.getElementById('tut-nf-zoom-wrap');

    if (calibNFActive) {
      box.style.display  = 'block';
      info.style.display = 'block';
      info.textContent   = '📍 NF: Clique no CANTO SUPERIOR ESQUERDO do campo';
      btn.textContent    = '❌ Sair calibração NF';
      calibNFPoints = [];
      // Reseta zoom para ver imagem inteira
      img.style.transform       = 'translate(0,0) scale(1)';
      img.style.transformOrigin = '0 0';
      document.getElementById('tut-nf-hl').style.display = 'none';
    } else {
      box.style.display  = 'none';
      info.style.display = 'none';
      btn.textContent    = '📍 Calibrar NF';
      calibNFPoints = [];
      // Restaura zoom do passo atual
      applyNFZoom(tutorialFields[tutStep].nf);
    }
  }

  function calibNFClick(e) {
    const img  = document.getElementById('tut-nf-zoom-img');
    const wrap = document.getElementById('tut-nf-zoom-wrap');
    const info = document.getElementById('calib-nf-info');

    const natW = img.naturalWidth  || 800;
    const natH = img.naturalHeight || 1100;
    const cw   = wrap.clientWidth;
    const ch   = wrap.clientHeight;

    // Calc rendered size with object-fit:contain
    const imgAspect  = natW / natH;
    const wrapAspect = cw / ch;
    let rendW, rendH, offX, offY;
    if (imgAspect < wrapAspect) {
      rendH = ch; rendW = ch * imgAspect;
      offX = (cw - rendW) / 2; offY = 0;
    } else {
      rendW = cw; rendH = cw / imgAspect;
      offX = 0; offY = (ch - rendH) / 2;
    }

    const wrapRect = wrap.getBoundingClientRect();
    const relX = e.clientX - wrapRect.left - offX;
    const relY = e.clientY - wrapRect.top  - offY;
    const cx = (relX / rendW * 100).toFixed(1);
    const cy = (relY / rendH * 100).toFixed(1);

    calibNFPoints.push({ x: parseFloat(cx), y: parseFloat(cy) });

    if (calibNFPoints.length === 1) {
      info.textContent = '📍 Ponto 1: cx=' + cx + '%, cy=' + cy + '%\nAgora clique no CANTO INFERIOR DIREITO';
    } else if (calibNFPoints.length === 2) {
      const p1 = calibNFPoints[0], p2 = calibNFPoints[1];
      const centerX = ((p1.x + p2.x) / 2).toFixed(1);
      const centerY = ((p1.y + p2.y) / 2).toFixed(1);
      const hlW = (Math.abs(p2.x - p1.x) / 100).toFixed(3);
      const hlH = (Math.abs(p2.y - p1.y) / 100).toFixed(3);
      info.textContent =
        '✅ NF RESULTADO:\ncx: ' + centerX + ', cy: ' + centerY +
        '\nhlW: ' + hlW + ', hlH: ' + hlH +
        '\n\nClique novamente para novo campo';
      calibNFPoints = [];
    }
  }

  function toggleTutorialFullscreen() {
    const overlay = document.getElementById('tutorial-overlay');
    const box     = document.querySelector('.tutorial-box');
    const expand  = document.getElementById('tut-fs-icon-expand');
    const compress= document.getElementById('tut-fs-icon-compress');
    const isFS    = box.classList.contains('fullscreen');

    box.classList.toggle('fullscreen', !isFS);
    overlay.classList.toggle('fullscreen-mode', !isFS);
    expand.style.display   = isFS ? 'block' : 'none';
    compress.style.display = isFS ? 'none'  : 'block';

    // Re-render para recalcular posições com novo tamanho
    setTimeout(() => renderTutStep(), 320);
  }

  function toggleAcc(n) {
    const body = document.getElementById('acc-body-' + n);
    const acc  = document.getElementById('acc-' + n);
    const isOpen = body.classList.contains('open');

    // Close all
    document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.accordion').forEach(a => a.classList.remove('open'));

    // Open clicked if it was closed
    if (!isOpen) {
      body.classList.add('open');
      acc.classList.add('open');
    }
  }

  function goToStep(n) {
    if (n < 1 || n > totalSteps) return;

    // Reflete a etapa atual na URL (?etapa=N), sem recarregar a página
    // (só depois que o usuário já saiu da tela de boas-vindas)
    const welcomeScreen = document.getElementById('screen-welcome');
    if (welcomeScreen && welcomeScreen.classList.contains('hidden')) {
      const url = new URL(window.location.href);
      url.searchParams.set('etapa', n);
      window.history.replaceState(null, '', url);
    }

    // Hide all pages
    document.querySelectorAll('.step-page').forEach(p => p.classList.remove('active'));
    document.getElementById('step-' + n).classList.add('active');

    // Update stepper circles
    for (let i = 1; i <= totalSteps; i++) {
      const circle = document.getElementById('circle-' + i);
      const line   = document.getElementById('line-' + i);
      circle.classList.remove('active', 'done', 'inactive');

      if (i < n)  circle.classList.add('done');
      else if (i === n) circle.classList.add('active');
      else circle.classList.add('inactive');

      if (line) {
        if (i < n) line.classList.add('done');
        else line.classList.remove('done');
      }
    }

    // Update sidebar
    for (let i = 1; i <= totalSteps; i++) {
      const icon = document.getElementById('sb-icon-' + i);
      const text = document.getElementById('sb-text-' + i);
      icon.classList.remove('active', 'done');
      text.classList.remove('active', 'done');

      const svgPath = icon.querySelector('path');

      if (i < n) {
        icon.classList.add('done');
        text.classList.add('done');
        svgPath.setAttribute('stroke', '#ffffff');
      } else if (i === n) {
        icon.classList.add('active');
        text.classList.add('active');
        svgPath.setAttribute('stroke', '#ffffff');
      } else {
        svgPath.setAttribute('stroke', '#cccccc');
      }
    }

    // Progress bar
    document.getElementById('progress-fill').style.width = (n / totalSteps * 100) + '%';

    // Sidebar images — show only the active step's image
    for (let i = 1; i <= totalSteps; i++) {
      const img = document.getElementById('sb-img-' + i);
      if (img) {
        if (i === n) img.classList.add('visible');
        else img.classList.remove('visible');
      }
    }

    // Back button always visible (step 1 → type selection, others → previous step)
    document.getElementById('btn-back').style.visibility = 'visible';

    // Next button label — on step 5 always show "Concluir"
    if (n === totalSteps) {
      document.getElementById('btn-next').style.display = '';
      document.getElementById('btn-next').textContent = 'Concluir';
    } else {
      document.getElementById('btn-next').style.display = '';
      document.getElementById('btn-next').textContent = 'Continuar';
    }

    // Product banner on last step only in "both" mode
    const banner = document.getElementById('step5-product-banner');
    if (banner) {
      if (n === totalSteps && selectedTypes.servico && selectedTypes.produto) {
        banner.classList.add('visible');
      } else {
        banner.classList.remove('visible');
      }
    }

    currentStep = n;
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      withTransition(() => goToStep(currentStep + 1));
    } else {
      // Step 5: "Concluir" always returns to welcome
      finishGuide();
    }
  }

  function prevStep() {
    if (currentStep === 1) {
      // Step 1 → back to type selection
      withTransition(() => {
        document.querySelector('.card').classList.add('mode-type');
      });
    } else {
      withTransition(() => goToStep(currentStep - 1));
    }
  }

  function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
  }

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) closeModal(this.id);
    });
  });

  // Close modal on ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    }
  });

  // Init — welcome screen is on top (z-index:9999), card is in mode-type behind it.
  // goToStep pre-initializes sidebar/stepper state before the user sees anything.
  document.querySelector('.card').classList.add('mode-type');
  goToStep(1);

  // ── DEEP LINK: ?etapa=N abre direto na etapa N (1 a 6), pulando a tela inicial ──
  (function () {
    const params = new URLSearchParams(window.location.search);
    const etapa = parseInt(params.get('etapa'), 10);
    if (etapa >= 1 && etapa <= totalSteps) {
      document.getElementById('screen-welcome').classList.add('hidden');
      document.getElementById('screen-welcome').style.display = 'none';
      selectedTypes.servico = true;
      document.getElementById('type-servico').classList.add('selected');
      document.querySelector('.card').classList.remove('mode-type');
      goToStep(etapa);
    }
  })();
