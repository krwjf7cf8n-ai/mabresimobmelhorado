
(function(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const item = (window.LISTINGS||[]).find(x=>x.id===id) || (window.LISTINGS||[])[0];
  const root = document.getElementById("detailRoot");
  if(!item){
    root.innerHTML = "<p>Imóvel não encontrado.</p>";
    return;
  }

  const waBtn = document.getElementById("whatsDetail");
  const text = `Olá! Tenho interesse no imóvel ${item.id} (${item.title}). Pode me enviar mais detalhes?`;
  if(window.__MABRES_WA__) waBtn.href = window.__MABRES_WA__.link(text);
  else waBtn.href = `https://wa.me/5515997284640?text=${encodeURIComponent(text)}`;

  const formatBRL = (v)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v||0));

  const imgs = (item.images||[]).map(src=>`
    <div class="carousel__slide"><img src="${escapeHtml(src)}" alt="Foto do imóvel ${escapeHtml(item.id)}"></div>
  `).join("");

  root.innerHTML = `
    <div class="detail__grid">
      <div>
        <div class="carousel">
          <div class="carousel__track">${imgs}</div>
          <button class="carousel__nav prev" type="button" aria-label="Foto anterior">‹</button>
          <button class="carousel__nav next" type="button" aria-label="Próxima foto">›</button>
        </div>

        <div class="detailCard" style="margin-top:12px">
          <h1>${escapeHtml(item.title)}</h1>
          <div class="muted">${escapeHtml(item.status)} • ${escapeHtml(item.type)} • ${escapeHtml(item.zone)} • ${escapeHtml(item.bairro)}</div>
          <p style="margin:10px 0 0">${escapeHtml(item.descriptionLong || item.description || "")}</p>
          ${item.features && item.features.length ? `<ul class="ul">${item.features.map(f=>`<li>${escapeHtml(f)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>

      <aside class="detailCard">
        <div class="tagRow">
          <span class="tag">${escapeHtml(item.status)}</span>
          <span class="price">${formatBRL(item.price)}${item.status==="Locação"?" / mês":""}</span>
        </div>

        <div class="kv">
          <div><span>Quartos</span><strong>${Number(item.beds||0)}</strong></div>
          <div><span>Banheiros</span><strong>${Number(item.baths||0)}</strong></div>
          <div><span>Área</span><strong>${Number(item.area||0)} m²</strong></div>
          <div><span>Vagas</span><strong>${Number(item.parking||0)}</strong></div>
        </div>

        <a class="btn" style="width:100%;margin-top:12px" href="${waBtn.href}" target="_blank" rel="noopener">Falar no WhatsApp</a>
        <p class="muted" style="margin-top:10px;font-size:12px">Dica: envie o código <strong>${escapeHtml(item.id)}</strong> para atendimento mais rápido.</p>
      </aside>
    </div>
  `;

  const car = root.querySelector(".carousel");
  const track = car.querySelector(".carousel__track");
  const prev = car.querySelector(".carousel__nav.prev");
  const next = car.querySelector(".carousel__nav.next");
  const slideW = ()=> track.getBoundingClientRect().width;

  prev.addEventListener("click", ()=> track.scrollBy({left:-slideW(), behavior:"smooth"}));
  next.addEventListener("click", ()=> track.scrollBy({left:slideW(), behavior:"smooth"}));

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }
})();
