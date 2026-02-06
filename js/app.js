
(function(){
  // WhatsApp helper
  const WHATSAPP_NUMBERS = ["5515997284640","5515991183202"];
  const DEFAULT_TEXT = "Olá! Vim pelo site da Mabres Negócios Imobiliários. Quero atendimento, por favor.";
  const waLink = (text)=>`https://wa.me/${WHATSAPP_NUMBERS[0]}?text=${encodeURIComponent(text||DEFAULT_TEXT)}`;

  // Wire WhatsApp buttons
  const waBtns = ["whatsHeader","whatsHero","whatsFloat"].map(id=>document.getElementById(id)).filter(Boolean);
  waBtns.forEach(a=>a.href = waLink(DEFAULT_TEXT));

  // Zone chips
  const zones = ["Zona Norte","Zona Sul","Zona Leste","Zona Oeste","Centro","Zona Industrial"];
  const zoneChips = document.getElementById("zoneChips");
  if(zoneChips){
    zoneChips.innerHTML = zones.map(z=>`<span class="chip">${z}</span>`).join("");
  }

  // Elements
  const grid = document.getElementById("grid");
  const resultsCount = document.getElementById("resultsCount");
  const chips = document.getElementById("activeChips");

  const form = document.getElementById("searchForm");
  const qZone = document.getElementById("qZone");
  const qBairro = document.getElementById("qBairro");
  const qType = document.getElementById("qType");
  const qBeds = document.getElementById("qBeds");
  const clearBtn = document.getElementById("clearFilters");

  const sug = document.getElementById("bairroSug");

  // Year
  const y = document.getElementById("year");
  if(y) y.textContent = String(new Date().getFullYear());

  // Load bairros list (async) and set up autocomplete
  let bairros = (window.BAIRROS_SOROCABA || []).slice();
  if(window.loadBairrosSorocaba){
    window.loadBairrosSorocaba().then(list=>{ bairros = list.slice(); });
  }

  function openSug(items){
    if(!sug) return;
    if(!items.length){ sug.classList.remove("is-open"); sug.innerHTML=""; return; }
    sug.innerHTML = items.slice(0,12).map(n=>`<button type="button" role="option" data-name="${escapeHtml(n)}">${escapeHtml(n)} <small>• Sorocaba</small></button>`).join("");
    sug.classList.add("is-open");
    sug.querySelectorAll("button").forEach(b=>{
      b.addEventListener("click", ()=>{
        qBairro.value = b.getAttribute("data-name");
        sug.classList.remove("is-open");
        sug.innerHTML="";
        qBairro.focus();
      });
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }

  if(qBairro){
    qBairro.addEventListener("input", ()=>{
      const v = qBairro.value.trim().toLowerCase();
      if(v.length < 2){ openSug([]); return; }
      const items = bairros.filter(b=>b.toLowerCase().includes(v));
      openSug(items);
    });
    qBairro.addEventListener("blur", ()=> setTimeout(()=>openSug([]), 150));
    qBairro.addEventListener("focus", ()=>{
      const v = qBairro.value.trim().toLowerCase();
      if(v.length >= 2){
        openSug(bairros.filter(b=>b.toLowerCase().includes(v)));
      }
    });
  }

  function formatBRL(value){
    return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value||0));
  }

  function matches(item, f){
    if(f.zone && item.zone !== f.zone) return false;
    if(f.type && item.type !== f.type) return false;
    if(f.beds && Number(item.beds||0) < f.beds) return false;

    if(f.bairro){
      const needle = f.bairro.toLowerCase();
      const hay = `${item.bairro} ${item.location} ${item.title}`.toLowerCase();
      if(!hay.includes(needle)) return false;
    }
    return true;
  }

  function getFilters(){
    return {
      zone: qZone?.value || "",
      bairro: qBairro?.value.trim() || "",
      type: qType?.value || "",
      beds: qBeds?.value ? Number(qBeds.value) : null
    };
  }

  function setChips(f){
    if(!chips) return;
    const arr = [];
    if(f.zone) arr.push(["Zona", f.zone]);
    if(f.bairro) arr.push(["Bairro", f.bairro]);
    if(f.type) arr.push(["Tipo", f.type]);
    if(f.beds) arr.push(["Quartos", `${f.beds}+`]);
    chips.innerHTML = arr.map(([k,v])=>`<span class="chip">${escapeHtml(k)}: ${escapeHtml(v)}</span>`).join("");
  }

  function makeCarousel(images, id){
    const imgs = (images && images.length) ? images : ["assets/imoveis/placeholder.jpg"];
    const dots = imgs.map((_,i)=>`<span class="carousel__dot ${i===0?"is-active":""}" data-i="${i}"></span>`).join("");
    const slides = imgs.map(src=>`
      <div class="carousel__slide">
        <img src="${escapeHtml(src)}" alt="Foto do imóvel ${escapeHtml(id)}" loading="lazy">
      </div>
    `).join("");
    return `
      <div class="carousel" data-carousel="${escapeHtml(id)}">
        <div class="carousel__track" role="group" aria-label="Fotos do imóvel ${escapeHtml(id)}">
          ${slides}
        </div>
        <button class="carousel__nav prev" type="button" aria-label="Foto anterior">‹</button>
        <button class="carousel__nav next" type="button" aria-label="Próxima foto">›</button>
        <div class="carousel__dots" aria-hidden="true">${dots}</div>
      </div>
    `;
  }

  function render(list){
    grid.innerHTML = list.map(item=>`
      <article class="card">
        <a href="detalhe.html?id=${encodeURIComponent(item.id)}" class="card__media" aria-label="Abrir anúncio completo">
          ${makeCarousel(item.images, item.id)}
        </a>
        <div class="card__body">
          <div class="tagRow">
            <span class="tag">${escapeHtml(item.status)} • ${escapeHtml(item.type)}</span>
            <span class="price">${formatBRL(item.price)}${item.status==="Locação"?" / mês":""}</span>
          </div>
          <h3 class="title">${escapeHtml(item.title)}</h3>
          <div class="meta">${escapeHtml(item.zone)} • ${escapeHtml(item.bairro)}</div>
          <div class="specs">
            <span>🛏 ${Number(item.beds||0)}</span>
            <span>🛁 ${Number(item.baths||0)}</span>
            <span>📐 ${Number(item.area||0)} m²</span>
            <span>🚗 ${Number(item.parking||0)}</span>
          </div>
          <div class="meta">${escapeHtml(item.description||"")}</div>
          <a class="more" href="detalhe.html?id=${encodeURIComponent(item.id)}"><span>Ver anúncio completo →</span></a>
        </div>
      </article>
    `).join("");

    resultsCount.textContent = `${list.length} resultado(s)`;

    // Hook carousel controls
    document.querySelectorAll("[data-carousel]").forEach(root=>{
      const track = root.querySelector(".carousel__track");
      const prev = root.querySelector(".carousel__nav.prev");
      const next = root.querySelector(".carousel__nav.next");
      const dots = Array.from(root.querySelectorAll(".carousel__dot"));
      const slideW = ()=> track.getBoundingClientRect().width;

      function setActiveDot(){
        const i = Math.round(track.scrollLeft / slideW());
        dots.forEach((d,idx)=>d.classList.toggle("is-active", idx===i));
      }

      track.addEventListener("scroll", ()=>{
        window.requestAnimationFrame(setActiveDot);
      }, {passive:true});

      prev.addEventListener("click", (e)=>{
        e.preventDefault();
        track.scrollBy({left:-slideW(), behavior:"smooth"});
      });
      next.addEventListener("click", (e)=>{
        e.preventDefault();
        track.scrollBy({left:slideW(), behavior:"smooth"});
      });
    });
  }

  const all = (window.LISTINGS||[]).slice();
  render(all);

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const f = getFilters();
    setChips(f);
    render(all.filter(it=>matches(it,f)));
  });

  clearBtn.addEventListener("click", ()=>{
    qZone.value="";
    qBairro.value="";
    qType.value="";
    qBeds.value="";
    chips.innerHTML="";
    render(all);
  });
})();
