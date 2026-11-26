(() => {
  const stage = document.getElementById('showcase-stage');
  const stageBody = document.getElementById('showcase-stage-body');
  const fsBtn = document.getElementById('fullscreen-btn');
  const fsExitBtn = document.getElementById('fullscreen-exit-btn');
  const fsBar = document.getElementById('showcase-fs-bar');
  const demoBtns = Array.from(document.querySelectorAll('[data-demo]'));
  const demoPanels = Array.from(document.querySelectorAll('[data-demo-panel]'));
  const paletteBtns = Array.from(document.querySelectorAll('[data-switch-palette]'));
  const copyBtn = document.getElementById('copy-install-btn');
  const installCmd = document.getElementById('install-cmd');
  const installDialog = document.getElementById('install-dialog');
  const openInstallBtn = document.getElementById('open-install-btn');
  const closeInstallBtn = document.getElementById('close-install-btn');
  const aboutDialog = document.getElementById('about-dialog');
  const openAboutBtn = document.getElementById('open-about-btn');
  const closeAboutBtn = document.getElementById('close-about-btn');
  const aboutToInstallBtn = document.getElementById('about-to-install-btn');
  const contextBar = document.getElementById('showcase-context-bar');
  const closeContextBtn = document.getElementById('close-context-btn');

  let activeDemo = 'dashboard';
  let isExpanded = false;

  const showDemo = (name) => {
    activeDemo = name;
    demoBtns.forEach((b) => {
      b.setAttribute('data-type', b.getAttribute('data-demo') === name ? 'solid-fill' : 'outline');
    });
    demoPanels.forEach((panel) => {
      panel.hidden = panel.getAttribute('data-demo-panel') !== name;
    });
    if (stageBody) {
      stageBody.scrollTop = 0;
    }
    if (window.innerWidth <= 768) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  demoBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-demo');
      if (name) showDemo(name);
    });
  });

  paletteBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-switch-palette');
      if (!p) return;
      document.documentElement.setAttribute('data-palette', p);
      paletteBtns.forEach((b) => {
        b.classList.toggle('dads-badge--primary', b === btn);
      });
    });
  });

  const setExpanded = (expand) => {
    if (!stage || !fsBar) return;
    isExpanded = expand;
    if (expand) {
      stage.style.position = 'fixed';
      stage.style.inset = '0';
      stage.style.zIndex = '9999';
      fsBar.hidden = false;
      fsExitBtn?.focus();
    } else {
      stage.style.position = '';
      stage.style.inset = '';
      stage.style.zIndex = '';
      fsBar.hidden = true;
      fsBtn?.focus();
    }
  };

  fsBtn?.addEventListener('click', () => setExpanded(true));
  fsExitBtn?.addEventListener('click', () => setExpanded(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isExpanded) {
      setExpanded(false);
    }
  });

  openInstallBtn?.addEventListener('click', () => {
    installDialog?.showModal();
  });
  closeInstallBtn?.addEventListener('click', () => {
    installDialog?.close();
  });
  installDialog?.addEventListener('click', (e) => {
    if (e.target === installDialog) {
      installDialog.close();
    }
  });
  openAboutBtn?.addEventListener('click', () => {
    aboutDialog?.showModal();
  });
  closeAboutBtn?.addEventListener('click', () => {
    aboutDialog?.close();
  });
  aboutDialog?.addEventListener('click', (e) => {
    if (e.target === aboutDialog) {
      aboutDialog.close();
    }
  });
  aboutToInstallBtn?.addEventListener('click', () => {
    aboutDialog?.close();
    installDialog?.showModal();
  });
  closeContextBtn?.addEventListener('click', () => {
    if (contextBar) contextBar.hidden = true;
  });

  copyBtn?.addEventListener('click', async () => {
    const text = installCmd?.textContent?.trim() || 'npx skills add artifactshare/skills';
    try {
      await navigator.clipboard.writeText(text);
      const orig = copyBtn.textContent;
      copyBtn.textContent = 'コピーしました';
      setTimeout(() => {
        copyBtn.textContent = orig;
      }, 1800);
    } catch {
      // clipboard unavailable
    }
  });

  // Scoped scroll-spy TOC for each embedded dads-doc panel
  document.querySelectorAll('[data-demo-panel] main.dads-doc').forEach((doc, docIdx) => {
    const headings = Array.from(doc.querySelectorAll('.dads-section > h2'));
    if (headings.length < 2) return;

    headings.forEach((h, i) => {
      h.id = `doc-${docIdx + 1}-sec-${i + 1}`;
    });

    const buildList = () => {
      const ul = document.createElement('ul');
      ul.className = 'dads-toc-list';
      headings.forEach((h) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dads-toc-link';
        a.href = '#' + h.id;
        a.textContent = h.textContent?.trim() || '';
        a.dataset.tocTarget = h.id;
        li.appendChild(a);
        ul.appendChild(li);
      });
      return ul;
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'dads-doc-layout';
    doc.parentNode.insertBefore(wrapper, doc);
    wrapper.appendChild(doc);

    const aside = document.createElement('aside');
    aside.className = 'dads-toc';
    aside.setAttribute('aria-label', '目次');
    const title = document.createElement('p');
    title.className = 'dads-toc-title';
    title.textContent = '目次';
    aside.appendChild(title);
    aside.appendChild(buildList());
    wrapper.appendChild(aside);

    const links = Array.from(wrapper.querySelectorAll('[data-toc-target]'));
    const setActive = (id) => {
      links.forEach((a) => {
        const active = a.dataset.tocTarget === id;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    };

    let clickLockUntil = 0;
    links.forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = a.dataset.tocTarget;
        const targetEl = targetId ? document.getElementById(targetId) : null;
        if (!targetId || !targetEl || !stageBody) return;
        clickLockUntil = Date.now() + 500;
        setActive(targetId);
        const top =
          targetEl.getBoundingClientRect().top -
          stageBody.getBoundingClientRect().top +
          stageBody.scrollTop -
          20;
        stageBody.scrollTo({ top, behavior: 'smooth' });
      });
    });

    stageBody?.addEventListener(
      'scroll',
      () => {
        if (Date.now() < clickLockUntil || wrapper.closest('[hidden]')) return;
        const nearBottom =
          stageBody.scrollTop + stageBody.clientHeight >= stageBody.scrollHeight - 8;
        if (nearBottom) {
          setActive(headings[headings.length - 1].id);
          return;
        }
        const stageTop = stageBody.getBoundingClientRect().top;
        let current = headings[0].id;
        for (const h of headings) {
          if (h.getBoundingClientRect().top - stageTop <= 140) {
            current = h.id;
          } else {
            break;
          }
        }
        setActive(current);
      },
      { passive: true },
    );

    setActive(headings[0].id);
  });

  // Scoped slide deck controllers for each embedded slides panel
  document.querySelectorAll('[data-demo-panel]').forEach((panel) => {
    const slides = Array.from(panel.querySelectorAll('.dads-slide'));
    if (!slides.length) return;
    let idx = 0;
    const counter = panel.querySelector('[data-slide-counter]');
    const progress = panel.querySelector('[data-slide-progress]');

    const update = (next) => {
      idx = Math.max(0, Math.min(slides.length - 1, next));
      slides.forEach((el, i) => {
        el.classList.toggle('is-active', i === idx);
        el.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
      if (counter) counter.textContent = `${idx + 1} / ${slides.length}`;
      if (progress) progress.style.width = `${((idx + 1) / slides.length) * 100}%`;
    };

    panel.querySelector('[data-slide-prev]')?.addEventListener('click', () => update(idx - 1));
    panel.querySelector('[data-slide-next]')?.addEventListener('click', () => update(idx + 1));
    document.addEventListener('keydown', (e) => {
      if (panel.hidden) return;
      if (['ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        update(idx + 1);
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        update(idx - 1);
      }
    });
    update(0);
  });

  showDemo(activeDemo);
})();
