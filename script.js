const body = document.body;
body.classList.add("js-enabled");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const metrics = document.querySelectorAll(".metric");

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

let scrollTicking = false;

window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;

    window.requestAnimationFrame(() => {
      updateHeaderState();
      scrollTicking = false;
    });
  },
  { passive: true }
);

updateHeaderState();

if (navToggle && nav) {
  const closeNavigation = () => {
    body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeNavigation();
    }
  });

  document.addEventListener("click", (event) => {
    if (!body.classList.contains("nav-open") || !(event.target instanceof Node)) return;
    if (nav.contains(event.target) || navToggle.contains(event.target)) return;
    closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });
}

const revealItems = document.querySelectorAll(
  [
    ".section-heading",
    ".split-copy",
    ".feature-board article",
    ".pill-row span",
    ".service-card",
    ".process-grid article",
    ".category-heading",
    ".category-sidebar",
    ".image-panel",
    ".stats-grid article",
    ".values-grid article",
    ".contact-info",
    ".contact-cards article",
    ".contact-form",
  ].join(",")
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const animateMetric = (metric) => {
  if (metric.dataset.counted === "true") return;
  metric.dataset.counted = "true";

  const original = metric.textContent.trim();
  const target = Number.parseInt(original.replace(/\D/g, ""), 10);
  const suffix = original.replace(/[0-9,]/g, "");

  if (!Number.isFinite(target)) return;

  const duration = 1100;
  const start = performance.now();

  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    metric.textContent = `${Math.round(target * eased).toLocaleString("en-IN")}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(update);
    } else {
      metric.textContent = original;
    }
  };

  window.requestAnimationFrame(update);
};

if ("IntersectionObserver" in window) {
  const metricObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateMetric(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  metrics.forEach((metric) => metricObserver.observe(metric));
} else {
  metrics.forEach(animateMetric);
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "Thank you. CloudRCS will contact you shortly.";
    contactForm.reset();
  });
}
