
const PROJECTS = [
  {
    label: "Projeto Busca Clima",
    desc: "Aplicação web que consome a API do OpenWeather para exibir o clima atual de qualquer cidade pesquisada.",
    image: "/static/img/busca-clima.png",
    link: "https://buscar-clima-kfsw.onrender.com",
    tags: ["FRONTEND", "BACKEND", "API"]
  },
  {
    label: "Projeto Catalogo de Filmes",
    desc: "Api de catálogo de filmes, onde é possível listar, adicionar, atualizar e deletar filmes.",
    image: "/static/img/catalogo-filmes.png",
    link: "https://api-catalogo-filmes-o5nk.onrender.com/filmes",
    tags: ["FRONTEND", "BACKEND"]
  },
  
];

// --- Injeção dinâmica dos projetos (Layout Notebook Mockup) ---
// --- Injeção dinâmica dos projetos (Layout Clean) ---
(function () {
  const grid = document.getElementById('projectsGrid');
  
  // Verifica se a grid e os dados existem antes de rodar
  if (!grid || typeof PROJECTS === 'undefined') return;

  grid.innerHTML = PROJECTS.map(project => `
    <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-card">
      
      <div class="project-card__image-wrap">
        <img src="${project.image}" alt="${project.label}" class="project-card__img" loading="lazy">
      </div>
      
      <div class="project-card__info">
        <h3 class="project-card__title">${project.label}</h3>
        <p class="project-card__desc">${project.desc}</p>
        
        <div class="project-card__tags">
          ${project.tags.map(tag => `<span class="project-card__tag">#${tag}</span>`).join('')}
        </div>
      </div>

    </a>
  `).join('');
})();


(function () {
  document.body.classList.add('loading');

  const loader        = document.getElementById('loader');
  // Ajustado para selecionar via classe correspondente ao HTML
  const loaderBar     = document.querySelector('.loader-bar');
  const loaderPercent = document.querySelector('.loader-percent');

  let progress = 0;

  function tick() {
    // Incremento variável para parecer mais natural
    const increment = progress < 50
      ? Math.random() * 4 + 1
      : Math.random() * 1.5 + 0.2;

    progress = Math.min(progress + increment, 100);

    if (loaderBar) loaderBar.style.width = progress + '%';
    if (loaderPercent) loaderPercent.textContent = Math.floor(progress) + '%';

    if (progress < 100) {
      const delay = progress < 80 ? 30 : 60;
      setTimeout(tick, delay);
    } else {
      // Garante 100% antes de sumir
      if (loaderBar) loaderBar.style.width = '100%';
      if (loaderPercent) loaderPercent.textContent = '100%';

      setTimeout(() => {
        // Mudado para 'hide' para casar com o #loader.hide do seu CSS
        loader.classList.add('hide');
        document.body.classList.remove('loading');
      }, 500);
    }
  }

  // Inicia após um pequeno delay para o DOM estar pronto
  setTimeout(tick, 300);
})();

(function () {
  const header  = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const nav     = document.getElementById('nav');
  const navLinks = nav.querySelectorAll('.nav__link');

  // --- Scrolled state ---
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once

  // --- Mobile menu toggle ---
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });

  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.classList.remove('open');
    });
  });

  // --- Active section highlight ---
  function updateActiveLink() {
    const sections = ['home', 'projects', 'skills', 'contact'];
    let active = 'home';

    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          active = id;
        }
      }
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === active);
    });
  }
})();



// Footer year
(function () {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

// Intersection Observer para revelar elementos ao scroll
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  // Observa seções
  document.querySelectorAll('.skills__group, .contact__social-link').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
})();