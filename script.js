/**
 * ==========================================================================
 * AQUARELA FOTO & VÍDEO — SCRIPT PRINCIPAL LANDING PAGE GESTANTE
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. CONFIGURAÇÕES PRINCIPAIS & PLACEHOLDERS EDIVÁVEIS
// --------------------------------------------------------------------------
const CONFIG = {
  // Número do WhatsApp da Empresa: +55 19 3895-6716
  whatsappNumber: "551938956716", 
  
  // Mensagem pré-preenchida de conversão para o WhatsApp
  defaultMessage: "Oi! Vi a promoção do Ensaio Gestante (de R$800 por R$500) e quero garantir minha vaga em setembro.",
  
  // Data limite da oferta (Setembro 2026)
  targetDate: new Date("2026-09-30T23:59:59").getTime()
};

// --------------------------------------------------------------------------
// 2. FUNÇÃO DE DISPARO DO WHATSAPP & RASTREAMENTO (META PIXEL / GTM)
// --------------------------------------------------------------------------
/**
 * Abre o link do WhatsApp com mensagem formatada e rastreia o evento.
 * @param {string} ctaLocation - Identificador de onde o clique ocorreu (ex: 'hero', 'navbar', 'final_cta')
 */
function openWhatsApp(ctaLocation = 'desconhecido') {
  // 1. Rastreamento Meta Pixel (se instalado na página)
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', {
      content_name: 'Ensaio Gestante Promocional',
      content_category: 'Conversao WhatsApp',
      cta_location: ctaLocation,
      value: 500.00,
      currency: 'BRL'
    });
  }

  // 2. Rastreamento Google Tag Manager / GA4 (se instalado na página)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'whatsapp_click',
    cta_location: ctaLocation,
    offer_name: 'Ensaio Gestante Setembro',
    offer_price: 500
  });

  // 3. Monta a URL do WhatsApp
  const encodedText = encodeURIComponent(CONFIG.defaultMessage);
  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedText}`;

  // 4. Redireciona para o WhatsApp
  window.open(waUrl, '_blank');
}

// --------------------------------------------------------------------------
// 3. CONTADOR REGRESSIVO DA OFERTA DE SETEMBRO
// --------------------------------------------------------------------------
function initCountdownTimer() {
  const daysEl = document.getElementById("timer-days");
  const hoursEl = document.getElementById("timer-hours");
  const minutesEl = document.getElementById("timer-minutes");
  const secondsEl = document.getElementById("timer-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = CONFIG.targetDate - now;

    if (distance < 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// --------------------------------------------------------------------------
// 4. FAQ ACCORDION INTERATIVO
// --------------------------------------------------------------------------
function initFAQAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");

    questionBtn.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Opcional: Fecha outros itens para efeito sanfona limpo
      faqItems.forEach(otherItem => {
        otherItem.classList.remove("active");
        otherItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      // Alterna o estado do item atual
      if (!isOpen) {
        item.classList.add("active");
        questionBtn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// --------------------------------------------------------------------------
// 5. MODAL DE DEPOIMENTOS EM VÍDEO
// --------------------------------------------------------------------------
function initVideoModal() {
  const modal = document.getElementById("video-modal");
  const modalContainer = document.getElementById("video-player-container");
  const closeBtn = document.getElementById("video-modal-close");
  const videoCards = document.querySelectorAll(".video-card");

  if (!modal || !modalContainer || !closeBtn) return;

  // Extrai o ID de vídeos do YouTube / Shorts
  function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    let videoId = null;

    if (url.includes("youtube.com/shorts/")) {
      videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
    } else if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      videoId = urlParams.get("v");
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      videoId = url.trim();
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;
  }

  function openModal(videoSrc, titleText) {
    const youtubeEmbedUrl = getYouTubeEmbedUrl(videoSrc);

    if (youtubeEmbedUrl) {
      // Player do YouTube Shorts / Vídeo
      modalContainer.innerHTML = `
        <iframe src="${youtubeEmbedUrl}" title="${titleText || 'Depoimento em Vídeo'}" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen style="width: 100%; height: 100%; border: none; border-radius: var(--radius-md);"></iframe>
      `;
    } else if (videoSrc.endsWith(".mp4") || videoSrc.endsWith(".webm")) {
      // Player de vídeo local MP4
      modalContainer.innerHTML = `
        <video src="${videoSrc}" controls autoplay style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);"></video>
      `;
    } else {
      // Placeholder informativo caso ainda não tenha vídeo
      modalContainer.innerHTML = `
        <div style="text-align: center; color: white; padding: 2rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6B4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1rem;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">${titleText || 'Depoimento de Cliente'}</h3>
          <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1.5rem;">Vídeo: ${videoSrc}</p>
          <button onclick="openWhatsApp('modal_video')" class="btn-whatsapp" style="width: auto; padding: 0.75rem 1.5rem; font-size: 0.95rem; margin: 0 auto;">
            Fazer como essa mamãe &amp; Agendar
          </button>
        </div>
      `;
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    modalContainer.innerHTML = "";
    document.body.style.overflow = "";
  }

  videoCards.forEach(card => {
    card.addEventListener("click", () => {
      const videoSrc = card.getAttribute("data-video") || "";
      const titleText = card.querySelector(".testimonial-author")?.textContent;
      openModal(videoSrc, titleText);
    });
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

// --------------------------------------------------------------------------
// 6. INICIALIZAÇÃO APÓS CARREGAMENTO DO DOM
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initCountdownTimer();
  initFAQAccordion();
  initVideoModal();
});
