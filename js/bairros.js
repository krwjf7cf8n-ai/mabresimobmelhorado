
/**
 * Bairro autocomplete: carrega a lista de bairros de Sorocaba via MediaWiki API (Wikipedia)
 * Fonte: Lista de bairros de Sorocaba.
 */
window.BAIRROS_SOROCABA = [
  // fallback (principais) caso a busca online falhe
  "Campolim","Parque Campolim","Centro","Jardim Simus","Wanel Ville","Éden","Santa Rosália","Além Ponte","Aparecidinha",
  "Brigadeiro Tobias","Cajuru do Sul","Itavuvu","Ipanema","Vila Hortência","Jardim São Paulo","Parque São Bento","Jardim Gonçalves"
];

window.loadBairrosSorocaba = async function(){
  try{
    const url = "https://pt.wikipedia.org/w/api.php?action=parse&page=Lista_de_bairros_de_Sorocaba&prop=wikitext&format=json&origin=*";
    const res = await fetch(url, {cache:"force-cache"});
    if(!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    const w = data?.parse?.wikitext?.["*"];
    if(!w) throw new Error("no wikitext");

    // Extrai itens de lista com "* " e ignora cabeçalhos
    const lines = w.split("\n");
    const out = [];
    for(const line of lines){
      const m = line.match(/^\*\s+(.+?)\s*$/);
      if(!m) continue;
      let name = m[1]
        .replace(/\[\[(.+?)(\|(.+?))?\]\]/g, (_,a,__,c)=> (c||a)) // links wiki
        .replace(/\<.*?\>/g,"")
        .trim();
      // remove notas e parênteses finais desnecessários
      name = name.replace(/\s*\(.*?\)\s*$/,"").trim();
      if(!name) continue;
      // filtra coisas que não são bairros de verdade
      if(name.length < 2) continue;
      out.push(name);
    }
    const uniq = Array.from(new Set(out)).sort((a,b)=>a.localeCompare(b,"pt-BR"));
    if(uniq.length > 50) window.BAIRROS_SOROCABA = uniq;
    return window.BAIRROS_SOROCABA;
  }catch(e){
    return window.BAIRROS_SOROCABA;
  }
};
