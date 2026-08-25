/*
 * motor.js
 * -----------------------------------------------------------------------
 * Evaluación de selectores CSS/XPath contra el documento del gimnasio, y
 * el veredicto de cada round ("golpe al aire", "golpe impreciso", etc).
 * No toca el DOM del juego ni el iframe directamente: recibe `doc` (el
 * contentDocument del iframe) como parámetro, así queda testeable aislado.
 */
(function () {
  'use strict';

  var RL = (window.RL = window.RL || {});

  /**
   * Evalúa un selector contra `doc`.
   * @returns {{ok:boolean, nodos:Array, error:?string}}
   *   nodos puede contener elementos, atributos o nodos de texto (XPath).
   */
  function evaluar(selector, modo, doc) {
    if (!selector || !selector.trim()) {
      return { ok: true, nodos: [], error: null, vacioPorFalta: true };
    }
    try {
      if (modo === 'xpath') {
        var resultado = doc.evaluate(
          selector, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
        );
        var nodos = [];
        for (var i = 0; i < resultado.snapshotLength; i++) {
          nodos.push(resultado.snapshotItem(i));
        }
        return { ok: true, nodos: nodos, error: null };
      }
      var lista = doc.querySelectorAll(selector);
      return { ok: true, nodos: Array.prototype.slice.call(lista), error: null };
    } catch (e) {
      return { ok: false, nodos: [], error: traducirError(e, modo, selector) };
    }
  }

  function traducirError(e, modo, selector) {
    var msg = String((e && e.message) || e || '');
    var abiertos = (selector.match(/\[/g) || []).length;
    var cerrados = (selector.match(/\]/g) || []).length;
    if (abiertos > cerrados) {
      return (modo === 'xpath' ? 'Expresión XPath inválida' : 'Selector CSS inválido') +
        ': falta cerrar el corchete "]".';
    }
    if (/paren/i.test(msg) || (selector.match(/\(/g) || []).length !== (selector.match(/\)/g) || []).length) {
      return (modo === 'xpath' ? 'Expresión XPath inválida' : 'Selector CSS inválido') +
        ': revisá los paréntesis.';
    }
    if (modo === 'xpath' && /node.?set/i.test(msg)) {
      return 'Esa expresión XPath no devuelve elementos, atributos ni texto directamente ' +
        '(evitá funciones como count() o string() acá).';
    }
    if (modo === 'xpath') {
      return 'Esa expresión XPath no es válida. Revisá la sintaxis (barras, corchetes, comillas).';
    }
    return 'Ese selector CSS no es válido. Revisá la sintaxis (puntos, corchetes, comillas).';
  }

  /** Resuelve, una vez por round, cuál es el elemento/valor correcto. */
  function resolverObjetivo(nivel, doc) {
    if (nivel.tipo === 'genero') return {};
    if (nivel.tipo === 'inspeccionar-multiple') {
      return { nodos: nivel.objetivoIds.map(function (id) { return doc.getElementById(id); }) };
    }
    if (nivel.tipo === 'valor') {
      var el = doc.getElementById(nivel.objetivoId);
      return { valorEsperado: el ? el.getAttribute(nivel.atributo) : null };
    }
    if (nivel.objetivoEsRaiz) return { nodo: doc.documentElement };
    return { nodo: doc.getElementById(nivel.objetivoId) };
  }

  function obtenerValorNodo(nodo) {
    if (nodo == null) return null;
    if (nodo.nodeType === 2) return nodo.value; // Attr
    if (nodo.nodeType === 3) return nodo.nodeValue; // Text
    if (nodo.nodeType === 1) return nodo.textContent; // Element
    return nodo.nodeValue != null ? nodo.nodeValue : String(nodo);
  }

  function nombreDeNodo(nodo, nivelTitulo) {
    if (!nodo) return nivelTitulo;
    if (nodo.nodeType === 1 && nodo.getAttribute) {
      return nodo.getAttribute('data-nombre') || nodo.id || nodo.tagName.toLowerCase();
    }
    return String(obtenerValorNodo(nodo));
  }

  /**
   * @returns {{estado:string, exito:boolean, mensaje:string, genero:?string}}
   */
  function juzgar(resultadoEvaluar, nivel, objetivoResuelto) {
    if (!resultadoEvaluar.ok) {
      return { estado: 'error', exito: false, mensaje: '✖ ' + resultadoEvaluar.error };
    }
    var nodos = resultadoEvaluar.nodos;

    if (nodos.length === 0) {
      return {
        estado: 'vacio', exito: false,
        mensaje: resultadoEvaluar.vacioPorFalta
          ? 'Escribí un selector para tirar el golpe.'
          : '🥊 Golpe al aire: ningún elemento coincide con ese selector.'
      };
    }

    if (nivel.tipo === 'genero') {
      if (nodos.length > 1) {
        return {
          estado: 'impreciso', exito: false,
          mensaje: '⚠ Ese selector toca ' + nodos.length + ' elementos. Apuntá a uno solo de los dos botones.'
        };
      }
      var opcion = nodos[0];
      if (opcion.classList && opcion.classList.contains('opcion-genero')) {
        return {
          estado: 'exito', exito: true, mensaje: '✔ ¡Elegido!',
          genero: opcion.getAttribute('data-genero')
        };
      }
      return { estado: 'no-es', exito: false, mensaje: '✋ Ese no es uno de los botones para elegir peleador.' };
    }

    if (nivel.tipo === 'inspeccionar-multiple') {
      var esperados = objetivoResuelto.nodos.filter(Boolean);
      if (nodos.length !== esperados.length) {
        return {
          estado: 'impreciso', exito: false,
          mensaje: '⚠ Tocaste ' + nodos.length + ' elemento(s), pero este round pide exactamente ' +
            esperados.length + '.'
        };
      }
      var todosPresentes = esperados.every(function (e) { return nodos.indexOf(e) !== -1; });
      if (todosPresentes) {
        return { estado: 'exito', exito: true, mensaje: '✔ ¡Directo! Encontraste los ' + nodos.length + ' elementos.' };
      }
      return { estado: 'no-es', exito: false, mensaje: '✋ Tocaste ' + nodos.length + ' elemento(s), pero no son los que pide este round.' };
    }

    if (nivel.tipo === 'valor') {
      if (nodos.length > 1) {
        return { estado: 'impreciso', exito: false, mensaje: '⚠ Tocaste ' + nodos.length + ' resultados, apuntá a uno solo.' };
      }
      var valorCandidato = obtenerValorNodo(nodos[0]);
      if (valorCandidato === objetivoResuelto.valorEsperado) {
        return { estado: 'exito', exito: true, mensaje: '✔ ¡Directo! El valor es: "' + valorCandidato + '"' };
      }
      return {
        estado: 'no-es', exito: false,
        mensaje: '✋ Encontraste un valor ("' + valorCandidato + '"), pero no es el que pide este round.'
      };
    }

    // tipo 'equipar' | 'inspeccionar' (un único objetivo)
    if (nodos.length > 1) {
      return {
        estado: 'impreciso', exito: false,
        mensaje: '⚠ Golpe impreciso: tocaste ' + nodos.length + ' elementos. Apuntá a uno solo.'
      };
    }
    var unico = nodos[0];
    if (unico === objetivoResuelto.nodo) {
      return { estado: 'exito', exito: true, mensaje: '✔ ¡Directo!' };
    }
    return {
      estado: 'no-es', exito: false,
      mensaje: '✋ Agarraste "' + nombreDeNodo(unico, 'otro elemento') + '", pero este round pide "' +
        nombreDeNodo(objetivoResuelto.nodo, nivel.titulo) + '".'
    };
  }

  RL.motor = {
    evaluar: evaluar,
    resolverObjetivo: resolverObjetivo,
    juzgar: juzgar,
    obtenerValorNodo: obtenerValorNodo
  };
})();
