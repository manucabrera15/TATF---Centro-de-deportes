/*
 * app.js
 * -----------------------------------------------------------------------
 * Orquesta el juego: monta el iframe del gimnasio, carga cada round,
 * escucha lo que escribe el alumno (resaltado en vivo + confirmación),
 * aplica los efectos de un acierto (elegir género, equipar un accesorio,
 * marcar una inspección) y avanza de round en round.
 *
 * Nota sobre `srcdoc`: bajo file:// un <iframe src="otro.html"> queda con
 * origen "opaco" y `contentDocument` es inaccesible (no se puede leer ni
 * modificar el DOM de adentro, que es justo lo que necesita este juego).
 * Con `srcdoc` el iframe hereda el origen del documento padre y todo
 * funciona con doble clic, sin servidor.
 */
(function () {
  'use strict';

  var RL = window.RL;

  var estado = {
    doc: null,
    indice: 0,
    objetivoActual: null,
    elementosResaltados: [],
    debounceId: null
  };

  var els = {}; // referencias del DOM exterior, cacheadas en iniciar()

  function iniciar() {
    els.iframe = document.getElementById('iframe-gimnasio');
    els.visor = document.getElementById('visor-codigo');
    els.progreso = document.getElementById('progreso');
    els.badgeModo = document.getElementById('badge-modo');
    els.badgeTecnica = document.getElementById('badge-tecnica');
    els.tituloRound = document.getElementById('titulo-round');
    els.consigna = document.getElementById('consigna');
    els.form = document.getElementById('form-selector');
    els.entrada = document.getElementById('entrada-selector');
    els.botonConfirmar = document.getElementById('boton-confirmar');
    els.mensaje = document.getElementById('mensaje');
    els.botonPista = document.getElementById('boton-pista');
    els.botonSolucion = document.getElementById('boton-solucion');
    els.botonSiguiente = document.getElementById('boton-siguiente');
    els.consola = document.getElementById('consola');
    els.pantallaFinal = document.getElementById('pantalla-final');
    els.totalRounds = document.getElementById('total-rounds');

    els.iframe.addEventListener('load', function () {
      estado.doc = els.iframe.contentDocument;
      RL.visor.construir(estado.doc, els.visor);
      RL.espejo.sincronizar(estado.doc);
      cargarRound(0);
    });
    els.iframe.setAttribute('srcdoc', RL.vestuario.construirGimnasio());

    els.entrada.addEventListener('input', function () {
      clearTimeout(estado.debounceId);
      estado.debounceId = setTimeout(previsualizar, 180);
    });
    els.form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      confirmar();
    });
    els.botonPista.addEventListener('click', function () {
      var nivel = RL.niveles[estado.indice];
      mostrarMensaje('💡 ' + nivel.pista, 'neutral');
    });
    els.botonSolucion.addEventListener('click', function () {
      var nivel = RL.niveles[estado.indice];
      mostrarMensaje('👁 Una solución posible: ' + nivel.solucion, 'neutral');
      els.entrada.value = nivel.solucion;
      previsualizar();
    });
    els.botonSiguiente.addEventListener('click', function () {
      cargarRound(estado.indice + 1);
    });
  }

  function cargarRound(indice) {
    if (indice >= RL.niveles.length) {
      mostrarPantallaFinal();
      return;
    }
    estado.indice = indice;
    var nivel = RL.niveles[indice];
    estado.objetivoActual = RL.motor.resolverObjetivo(nivel, estado.doc);

    els.progreso.textContent = 'Ronda ' + (indice + 1) + ' / ' + RL.niveles.length;
    els.badgeModo.textContent = nivel.modo === 'xpath' ? 'XPath' : 'CSS';
    els.badgeModo.className = 'badge-modo badge-modo-' + nivel.modo;
    els.badgeTecnica.textContent = nivel.tecnica;
    els.tituloRound.textContent = 'Round ' + (indice + 1) + ' — ' + nivel.titulo;
    els.consigna.textContent = nivel.consigna;

    els.entrada.value = '';
    els.entrada.disabled = false;
    els.botonConfirmar.disabled = false;
    els.botonConfirmar.textContent = nivel.tipo === 'equipar' ? 'Equipar' : 'Confirmar';
    els.botonSiguiente.classList.add('oculto');
    limpiarMensaje();
    limpiarResaltadoIframe();
    RL.visor.limpiar();
    RL.visor.construir(estado.doc, els.visor); // por si cambió data-equipado en el round anterior

    els.entrada.focus();
  }

  function previsualizar() {
    var nivel = RL.niveles[estado.indice];
    var valor = els.entrada.value;
    if (!valor.trim()) {
      limpiarResaltadoIframe();
      RL.visor.resaltar([]);
      return;
    }
    var resultado = RL.motor.evaluar(valor, nivel.modo, estado.doc);
    if (!resultado.ok) {
      limpiarResaltadoIframe();
      RL.visor.resaltar([]);
      return;
    }
    RL.visor.resaltar(resultado.nodos);
    resaltarEnIframe(resultado.nodos);
  }

  function confirmar() {
    var nivel = RL.niveles[estado.indice];
    var valor = els.entrada.value;
    var resultado = RL.motor.evaluar(valor, nivel.modo, estado.doc);
    var veredicto = RL.motor.juzgar(resultado, nivel, estado.objetivoActual);

    if (resultado.ok) {
      RL.visor.resaltar(resultado.nodos);
      resaltarEnIframe(resultado.nodos);
    }

    if (!veredicto.exito) {
      mostrarMensaje(veredicto.mensaje, veredicto.estado === 'error' ? 'error' : 'aviso');
      return;
    }

    var extra = '';
    if (nivel.patronTecnica && !nivel.patronTecnica.test(valor.trim())) {
      extra = ' (Funcionó, pero esta ronda buscaba practicar «' + nivel.tecnica +
        '». Un ejemplo: ' + nivel.solucion + ')';
    }
    mostrarMensaje(veredicto.mensaje + extra, 'exito');
    aplicarEfecto(nivel, veredicto);

    els.entrada.disabled = true;
    els.botonConfirmar.disabled = true;
    els.botonSiguiente.classList.remove('oculto');
    els.botonSiguiente.focus();
  }

  function aplicarEfecto(nivel, veredicto) {
    if (nivel.tipo === 'genero') {
      aplicarGenero(veredicto.genero);
    } else if (nivel.tipo === 'equipar') {
      equiparAccesorio(nivel);
    }
    // 'inspeccionar', 'inspeccionar-multiple' y 'valor' ya quedan resaltados
    // en el iframe y el visor; no hay un efecto adicional que aplicar.
  }

  function aplicarGenero(genero) {
    var peleador = estado.doc.getElementById('peleador');
    var ring = estado.doc.getElementById('ring');
    peleador.setAttribute('data-genero', genero);
    peleador.classList.add('visible');
    ring.style.display = 'none';
    var siluetas = peleador.querySelectorAll('.silueta');
    Array.prototype.forEach.call(siluetas, function (img) {
      img.classList.toggle('silueta-activa', img.getAttribute('data-genero-img') === genero);
    });
    RL.espejo.sincronizar(estado.doc);
  }

  function equiparAccesorio(nivel) {
    var origen = estado.doc.getElementById(nivel.objetivoId);
    var slot = estado.doc.querySelector('.slot[data-slot="' + nivel.slot + '"]');
    if (!origen || !slot) return;
    origen.setAttribute('data-equipado', 'true');

    var imgOrigen = origen.querySelector('img');
    slot.innerHTML = '';
    if (imgOrigen) {
      var clon = imgOrigen.cloneNode(true);
      clon.removeAttribute('onerror');
      slot.appendChild(clon);
    }
    slot.classList.add('slot-lleno', 'slot-pop');
    setTimeout(function () { slot.classList.remove('slot-pop'); }, 320);
    RL.espejo.sincronizar(estado.doc);
  }

  function resaltarEnIframe(nodos) {
    limpiarResaltadoIframe();
    (nodos || []).forEach(function (nodo) {
      var el = null;
      if (nodo.nodeType === 1) el = nodo;
      else if (nodo.nodeType === 2) el = nodo.ownerElement;
      else if (nodo.nodeType === 3) el = nodo.parentElement;
      if (el && el.classList) {
        el.classList.add('resaltado');
        estado.elementosResaltados.push(el);
      }
    });
  }

  function limpiarResaltadoIframe() {
    estado.elementosResaltados.forEach(function (el) { el.classList.remove('resaltado'); });
    estado.elementosResaltados = [];
  }

  function mostrarMensaje(texto, tipo) {
    els.mensaje.textContent = texto;
    els.mensaje.className = 'mensaje mensaje-' + tipo;
  }

  function limpiarMensaje() {
    els.mensaje.textContent = '';
    els.mensaje.className = 'mensaje';
  }

  function mostrarPantallaFinal() {
    els.totalRounds.textContent = RL.niveles.length;
    els.consola.classList.add('oculto');
    els.pantallaFinal.classList.remove('oculto');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
