// Confere se todo href/src local dos .html aponta para um arquivo que existe,
// com a grafia EXATA do nome (o runner Linux diferencia maiúsculas de minúsculas).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const raiz = resolve(".");
const erros = [];

// Lista os .html da raiz do projeto (ignora node_modules, docs etc.)
const paginas = readdirSync(raiz).filter((n) => n.endsWith(".html"));

// Existe o caminho com a grafia exata? Compara cada trecho com o nome real no disco.
function existeComGrafiaExata(caminho) {
  const partes = relative(raiz, caminho).split(sep);
  let atual = raiz;
  for (const parte of partes) {
    if (!readdirSync(atual).includes(parte)) return false;
    atual = join(atual, parte);
  }
  return statSync(atual).isFile();
}

for (const pagina of paginas) {
  const html = readFileSync(join(raiz, pagina), "utf8");
  // Pega href="..." e src="..." (aspas simples ou duplas)
  for (const m of html.matchAll(/\b(href|src)\s*=\s*(["'])(.*?)\2/gis)) {
    const [, atributo, , valor] = m;
    const linha = html.slice(0, m.index).split("\n").length;
    const onde = `${pagina}:${linha} ${atributo}="${valor}"`;

    if (valor.trim() === "") {
      erros.push(`${onde} -> valor vazio`);
      continue;
    }
    // Externos e âncoras não são arquivos locais
    if (/^(https?:|mailto:|tel:|data:|#)/i.test(valor)) continue;
    // Começar com "/" quebra no subcaminho /Germinaflix/
    if (valor.startsWith("/")) {
      erros.push(`${onde} -> caminho absoluto quebra em /Germinaflix/`);
      continue;
    }
    const limpo = decodeURIComponent(valor.split(/[?#]/)[0]);
    const alvo = resolve(dirname(join(raiz, pagina)), limpo);
    if (!existeComGrafiaExata(alvo)) {
      erros.push(`${onde} -> arquivo não existe (ou grafia diferente)`);
    }
  }
}

if (erros.length) {
  console.error(`✗ ${erros.length} problema(s) de link local:\n` + erros.map((e) => "  " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ Links locais OK em ${paginas.length} página(s).`);
