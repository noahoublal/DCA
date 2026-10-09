(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canObserve = "IntersectionObserver" in window;

  // A brief brand introduction on the first visit in this tab.
  let introSeen = false;
  try {
    introSeen = window.sessionStorage.getItem("dca-intro-seen") === "1";
    if (!introSeen) window.sessionStorage.setItem("dca-intro-seen", "1");
  } catch (_) {}
  if (!reduceMotion && !introSeen) {
    const intro = document.createElement("div");
    intro.className = "page-intro";
    intro.setAttribute("aria-hidden", "true");
    intro.innerHTML = `<div class="page-intro-inner"><img class="page-intro-logo" src="assets/brand/dca-olive.png" alt=""><p class="page-intro-name">DigitalCommAgency</p><p class="page-intro-tagline">Création · refonte · développement web</p><span class="page-intro-track"></span></div>`;
    document.body.prepend(intro);
    let finishedLoading = false;
    const leaveIntro = () => {
      if (finishedLoading) return;
      finishedLoading = true;
      intro.classList.add("is-leaving");
      window.setTimeout(() => intro.remove(), 650);
    };
    window.addEventListener("load", () => window.setTimeout(leaveIntro, 900), { once: true });
    window.setTimeout(leaveIntro, 1500);
  }

  if (!reduceMotion && canObserve) {
    const selectors = [
      ".hero-copy > *", ".hero-art", ".section-head", ".service-card",
      ".split-art", ".feature", ".step", ".faq > div", ".faq-list details",
      ".cta-box", ".page-hero .wrap > *", ".content-section .wrap > *",
      ".related .wrap > *"
    ].join(",");
    const targets = [...document.querySelectorAll(selectors)];
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    document.documentElement.classList.add("motion-ready");
    targets.forEach((target, index) => {
      target.dataset.reveal = "";
      target.style.setProperty("--reveal-delay", `${(index % 4) * 90}ms`);
      observer.observe(target);
    });
  }

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  progress.innerHTML = "<span></span>";
  document.body.append(progress);
  const progressBar = progress.firstElementChild;
  const heroArt = document.querySelector(".hero-art");
  let scheduled = false;

  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const amount = range > 0 ? window.scrollY / range : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
    if (heroArt && !reduceMotion) {
      const heroPosition = heroArt.getBoundingClientRect().top + window.scrollY;
      const shift = Math.max(-14, Math.min(0, (window.scrollY - heroPosition + window.innerHeight * 0.25) * -0.018));
      heroArt.style.setProperty("--hero-shift", `${shift}px`);
    }
    scheduled = false;
  };

  window.addEventListener("scroll", () => {
    if (scheduled || reduceMotion) return;
    scheduled = true;
    window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  if (window.matchMedia("(pointer: fine)").matches) {
    if (heroArt && !reduceMotion) {
      heroArt.addEventListener("pointermove", (event) => {
        const bounds = heroArt.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        heroArt.style.setProperty("--tilt-x", `${(x * 2.4).toFixed(2)}deg`);
        heroArt.style.setProperty("--tilt-y", `${(y * -2.4).toFixed(2)}deg`);
      }, { passive: true });
      heroArt.addEventListener("pointerleave", () => {
        heroArt.style.setProperty("--tilt-x", "0deg");
        heroArt.style.setProperty("--tilt-y", "0deg");
      }, { passive: true });
    }
    document.querySelectorAll(".service-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", `${event.clientX - box.left}px`);
        card.style.setProperty("--pointer-y", `${event.clientY - box.top}px`);
      }, { passive: true });
    });
  }
})();
