document.addEventListener("DOMContentLoaded", function () {
  const loadingText = document.getElementById("loading-text");
  const loadingScreen = document.getElementById("loading-screen");
  const accessScreen = document.getElementById("access-screen");
  const mainContent = document.getElementById("main-content");
  const navButtons = document.querySelectorAll(".nav-button");

  // Helper: enable/disable scroll lock using CSS class
  function setScrollLocked(isLocked) {
    document.body.classList.toggle("no-scroll", isLocked);
  }

  // ----------------------------
  // LOADING / ACCESS FLOW (only if those elements exist on the page)
  // ----------------------------
  const hasLoadingFlow = !!(loadingScreen && accessScreen && mainContent && loadingText);

  if (hasLoadingFlow) {
    // Lock scrolling while loading/access screens are visible
    setScrollLocked(true);

    // --- LOADING ANIMATION (with fixed-width dots) ---
    let dots = 1;
    const baseText = "Loading";
    const maxDots = 3;

    loadingText.style.display = "inline-block";
    loadingText.style.textAlign = "center";
    loadingText.innerHTML = `${baseText}<span id="dots">.</span>`;

    const dotsSpan = document.getElementById("dots");
    if (dotsSpan) {
      dotsSpan.style.display = "inline-block";
      dotsSpan.style.minWidth = "3ch";
      dotsSpan.style.textAlign = "left";

      setInterval(() => {
        dots = (dots % maxDots) + 1;
        dotsSpan.textContent = ".".repeat(dots) + " ".repeat(maxDots - dots);
      }, 500);
    }

    // --- SIMULATED LOADING SEQUENCE ---
    setTimeout(() => {
      loadingScreen.style.display = "none";
      accessScreen.style.display = "flex";

      setTimeout(() => {
        accessScreen.style.display = "none";
        mainContent.style.display = "block";
        mainContent.style.opacity = "1";

        // Show default page ("About Me") if it exists on this page
        const about = document.getElementById("about");
        const aboutBtn = document.querySelector('.nav-button[data-page="about"]');
        if (about) about.classList.add("active");
        if (aboutBtn) aboutBtn.classList.add("active");

        // Re-enable scrolling after loading finishes
        setScrollLocked(false);
      }, 2000);
    }, 4000);

    // --- NAVIGATION LOGIC (safe even if some pages are missing) ---
    if (navButtons.length) {
      navButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const targetPage = this.getAttribute("data-page");
          const activeContent = document.querySelector(".text-content.active");
          const newContent = document.getElementById(targetPage);

          // Update nav button active state
          navButtons.forEach((btn) => btn.classList.remove("active"));
          this.classList.add("active");

          // If the target content doesn't exist, do nothing safely
          if (!newContent) return;

          // If no active section yet, just show the new one
          if (!activeContent) {
            newContent.style.display = "block";
            newContent.classList.add("active");
            return;
          }

          if (activeContent !== newContent) {
            activeContent.classList.remove("active");
            activeContent.style.transition = "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";
            activeContent.style.transform = "translateX(100%)";
            activeContent.style.opacity = "0";

            setTimeout(() => {
              activeContent.style.display = "none";
              newContent.style.display = "block";
              newContent.style.opacity = "0";
              newContent.style.transform = "translateX(100%)";

              setTimeout(() => {
                newContent.classList.add("active");
                newContent.style.transition = "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";
                newContent.style.transform = "translateX(0)";
                newContent.style.opacity = "1";
              }, 50);
            }, 500);
          }
        });
      });
    }
  }

  // ----------------------------
  // FORMSPREE SUBMIT (works on your intake page)
  // ----------------------------
  // Your intake page uses: <form id="intake-form" class="contact-form" ...>
  const form = document.getElementById("intake-form") || document.querySelector("form.contact-form");
  const status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // If you are using built-in validation like in your intake HTML, respect it:
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        status.textContent = "Please fill out all required fields.";
        return;
      }

      const formData = new FormData(form);

      try {
        // Prefer explicit endpoint if present (like your intake HTML script),
        // otherwise fallback to form.action
        const endpoint =
          window.FORMSPREE_ENDPOINT ||
          (typeof FORMSPREE_ENDPOINT !== "undefined" ? FORMSPREE_ENDPOINT : null) ||
          form.action;

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          // If you have a completion page, send them there
          // (matches what you wanted earlier)
          if (window.location.pathname.toLowerCase().includes("form")) {
            window.location.href = "form_completion.html";
            return;
          }

          status.textContent = "Form Sent!";
          form.reset();
        } else {
          let msg = "Oops! Something went wrong.";
          try {
            const data = await response.json();
            if (data && data.errors && data.errors.length) {
              msg = data.errors.map((err) => err.message).join(" ");
            }
          } catch (_) {}
          status.textContent = msg;
        }
      } catch (error) {
        status.textContent = "Oops! Network error or Formspree issue.";
      }
    });
  }
});

