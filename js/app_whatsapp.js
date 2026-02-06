
(function(){
  const WHATSAPP_NUMBERS = ["5515997284640","5515991183202"];
  const DEFAULT_TEXT = "Olá! Vim pelo site da Mabres Negócios Imobiliários. Quero atendimento, por favor.";
  window.__MABRES_WA__ = {
    active: 0,
    setActive(i){ this.active = (i===1?1:0); },
    link(text){ return `https://wa.me/${WHATSAPP_NUMBERS[this.active]}?text=${encodeURIComponent(text||DEFAULT_TEXT)}`; }
  };
})();
