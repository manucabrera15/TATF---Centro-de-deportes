/*
 * visor.js
 * -----------------------------------------------------------------------
 * Dibuja el árbol HTML del gimnasio como código, en el panel derecho, y
 * sincroniza el resaltado con lo que el selector del alumno va agarrando.
 *
 * Construye nodos de DOM reales (no innerHTML con el string del selector)
 * para no tener que lidiar con escapado manual, y guarda un Map de
 * "nodo real del iframe -> { contenedorLinea, resaltarSpan }" que permite
 * prender la línea correcta en O(1) cuando llega un resultado nuevo.
 *
 * El mismo Map sirve para elementos, atributos (Attr) y nodos de texto,
 * porque XPath puede devolver cualquiera de los tres.
 */
(function () {
  'use strict';

  var RL = (window.RL = window.RL || {});

  var ETIQUETAS_VOID = { img: 1, br: 1, hr: 1, input: 1, meta: 1, link: 1 };
  // El contenido de <style>/<script> no sirve para practicar selectores y,
  // sin colapsar, el <style> con el CSS del gimnasio ocuparía una línea
  // gigantesca que tapa el resto del árbol. Se muestran colapsados.
  var ETIQUETAS_COLAPSABLES = { style: 1, script: 1 };

  var mapaActual = null;
  var resaltadosActuales = [];

  function spanTexto(texto, clase) {
    var s = document.createElement('span');
    if (clase) s.className = clase;
    s.textContent = texto;
    return s;
  }

  function construirLinea(profundidad, piezas) {
    var div = document.createElement('div');
    div.className = 'linea-visor';
    div.style.paddingLeft = (profundidad * 14) + 'px';
    piezas.forEach(function (p) { div.appendChild(p); });
    return div;
  }

  function renderizarElemento(el, profundidad, contenedor, mapa) {
    var tagLower = el.tagName.toLowerCase();
    var esVoid = !!ETIQUETAS_VOID[tagLower];
    var hijosElemento = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 1; });
    var nodoTexto = (!esVoid && hijosElemento.length === 0 && el.childNodes.length === 1 &&
      el.childNodes[0].nodeType === 3) ? el.childNodes[0] : null;
    var sinContenido = !esVoid && hijosElemento.length === 0 && el.childNodes.length === 0;

    var piezas = [spanTexto('<' + tagLower, 'sv-tag')];
    var attrEntradas = [];
    Array.prototype.forEach.call(el.attributes, function (attr) {
      piezas.push(spanTexto(' ', ''));
      piezas.push(spanTexto(attr.name, 'sv-attr-name'));
      piezas.push(spanTexto('="', 'sv-punct'));
      var valorSpan = spanTexto(attr.value, 'sv-attr-value');
      piezas.push(valorSpan);
      piezas.push(spanTexto('"', 'sv-punct'));
      attrEntradas.push({ attrNode: el.getAttributeNode(attr.name), valorSpan: valorSpan });
    });

    var linea;

    if (esVoid) {
      piezas.push(spanTexto(' />', 'sv-tag'));
      linea = construirLinea(profundidad, piezas);
      contenedor.appendChild(linea);
      mapa.set(el, { contenedorLinea: linea });
      attrEntradas.forEach(function (a) {
        if (a.attrNode) mapa.set(a.attrNode, { contenedorLinea: linea, resaltarSpan: a.valorSpan });
      });
      return;
    }

    if (nodoTexto || sinContenido) {
      piezas.push(spanTexto('>', 'sv-tag'));
      var textoSpan = null;
      if (nodoTexto) {
        var colapsado = !!ETIQUETAS_COLAPSABLES[tagLower];
        textoSpan = spanTexto(colapsado ? '…' : nodoTexto.nodeValue, colapsado ? 'sv-punct' : 'sv-text');
        piezas.push(textoSpan);
      }
      piezas.push(spanTexto('</' + tagLower + '>', 'sv-tag'));
      linea = construirLinea(profundidad, piezas);
      contenedor.appendChild(linea);
      mapa.set(el, { contenedorLinea: linea });
      attrEntradas.forEach(function (a) {
        if (a.attrNode) mapa.set(a.attrNode, { contenedorLinea: linea, resaltarSpan: a.valorSpan });
      });
      if (nodoTexto) mapa.set(nodoTexto, { contenedorLinea: linea, resaltarSpan: textoSpan });
      return;
    }

    piezas.push(spanTexto('>', 'sv-tag'));
    linea = construirLinea(profundidad, piezas);
    contenedor.appendChild(linea);
    mapa.set(el, { contenedorLinea: linea });
    attrEntradas.forEach(function (a) {
      if (a.attrNode) mapa.set(a.attrNode, { contenedorLinea: linea, resaltarSpan: a.valorSpan });
    });

    hijosElemento.forEach(function (hijo) { renderizarElemento(hijo, profundidad + 1, contenedor, mapa); });

    var lineaCierre = construirLinea(profundidad, [spanTexto('</' + tagLower + '>', 'sv-tag')]);
    contenedor.appendChild(lineaCierre);
  }

  function construir(doc, contenedor) {
    contenedor.innerHTML = '';
    var mapa = new Map();
    renderizarElemento(doc.documentElement, 0, contenedor, mapa);
    mapaActual = mapa;
    resaltadosActuales = [];
  }

  function limpiar() {
    resaltadosActuales.forEach(function (entry) {
      entry.contenedorLinea.classList.remove('resaltado-linea');
      if (entry.resaltarSpan) entry.resaltarSpan.classList.remove('resaltado-span');
    });
    resaltadosActuales = [];
  }

  function resaltar(nodos) {
    limpiar();
    if (!mapaActual) return;
    var primero = null;
    (nodos || []).forEach(function (n) {
      var entry = mapaActual.get(n);
      if (!entry) return;
      entry.contenedorLinea.classList.add('resaltado-linea');
      if (entry.resaltarSpan) entry.resaltarSpan.classList.add('resaltado-span');
      if (!primero) primero = entry.contenedorLinea;
      resaltadosActuales.push(entry);
    });
    if (primero && primero.scrollIntoView) {
      primero.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  RL.visor = {
    construir: construir,
    resaltar: resaltar,
    limpiar: limpiar
  };
})();
