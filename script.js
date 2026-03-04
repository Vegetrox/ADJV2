/* =====================================================
   ADJ – L'Antre du Joueur · script.js · v2
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Header scroll shadow ── */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ── Scroll reveal ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Smooth anchor scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 74, behavior: 'smooth' });
      }
    });
  });

  /* ── Hamburger menu ── */
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const open = nav.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Météo Open-Meteo ── */
  const METEO_URL =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=45.18&longitude=6.50' +
    '&current=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m,snowfall' +
    '&daily=weathercode,temperature_2m_max,temperature_2m_min,snowfall_sum' +
    '&timezone=Europe%2FParis&forecast_days=4';

  function wInfo(code) {
    const m = {
      0:{i:'☀️',d:'Ciel dégagé'}, 1:{i:'🌤️',d:'Peu nuageux'}, 2:{i:'⛅',d:'Nuageux'},
      3:{i:'☁️',d:'Couvert'}, 45:{i:'🌫️',d:'Brouillard'}, 48:{i:'🌫️',d:'Brouillard givrant'},
      51:{i:'🌦️',d:'Bruine légère'}, 53:{i:'🌦️',d:'Bruine'}, 55:{i:'🌧️',d:'Bruine dense'},
      61:{i:'🌧️',d:'Pluie légère'}, 63:{i:'🌧️',d:'Pluie'}, 65:{i:'🌧️',d:'Pluie forte'},
      71:{i:'❄️',d:'Neige légère'}, 73:{i:'❄️',d:'Neige'}, 75:{i:'❄️',d:'Neige forte'},
      77:{i:'🌨️',d:'Grésil'}, 80:{i:'🌦️',d:'Averses'}, 81:{i:'🌧️',d:'Averses modérées'},
      82:{i:'⛈️',d:'Averses fortes'}, 85:{i:'🌨️',d:'Neige en averses'}, 86:{i:'❄️',d:'Neige forte'},
      95:{i:'⛈️',d:'Orage'}, 99:{i:'⛈️',d:'Orage violent'},
    };
    return m[code] ?? {i:'🌡️', d:'Variable'};
  }

  function dayLabel(date, i) {
    if (i === 0) return 'Auj.';
    if (i === 1) return 'Dem.';
    return ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][new Date(date).getDay()];
  }

  async function loadMeteo() {
    const cEl = document.getElementById('meteo-current');
    const fEl = document.getElementById('meteo-forecast');
    if (!cEl) return;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(METEO_URL, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const c = data.current, d = data.daily;
      const info = wInfo(c.weathercode);
      cEl.innerHTML = `
        <div class="meteo-icon">${info.i}</div>
        <div class="meteo-temp">${Math.round(c.temperature_2m)}°C</div>
        <div class="meteo-details">
          <span class="meteo-desc">${info.d}</span>
          <div class="meteo-extras">
            <span>Ressenti ${Math.round(c.apparent_temperature)}°C</span>
            <span>💨 ${Math.round(c.windspeed_10m)} km/h</span>
            ${c.snowfall > 0 ? `<span>❄️ ${c.snowfall}cm/h</span>` : ''}
          </div>
        </div>`;
      if (fEl) {
        fEl.innerHTML = d.time.slice(0,4).map((date, i) => {
          const fi = wInfo(d.weathercode[i]);
          return `<div class="meteo-day">
            <div class="meteo-day-name">${dayLabel(date, i)}</div>
            <div class="meteo-day-icon">${fi.i}</div>
            <div class="meteo-day-temp">${Math.round(d.temperature_2m_max[i])}°<span>/${Math.round(d.temperature_2m_min[i])}°</span></div>
            ${d.snowfall_sum[i] > 0 ? `<div style="font-size:.65rem;color:#6ab0e0;">❄️${d.snowfall_sum[i]}cm</div>` : ''}
          </div>`;
        }).join('');
      }
    } catch(e) {
      if (cEl) cEl.innerHTML = `<span class="meteo-error">Météo indisponible · <a href="https://www.valmeinier.com/" target="_blank" style="color:var(--or);">valmeinier.com</a></span>`;
    }
  }

  loadMeteo();
});
