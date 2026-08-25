/*
 * referencia.js
 * -----------------------------------------------------------------------
 * Modal con las tablas de referencia de selectores CSS y XPath (el mismo
 * contenido de localizadores-css.txt / localizadores-xpath.txt, pasado a
 * HTML estático con la paleta del sitio en vez del pegado crudo de esos
 * archivos). Es solo de consulta: no interactúa con el motor del juego.
 */
(function () {
  'use strict';

  function iniciar() {
    var modal = document.getElementById('modal-referencia');
    var titulo = document.getElementById('modal-referencia-titulo');
    var tablaCss = document.getElementById('tabla-referencia-css');
    var tablaXpath = document.getElementById('tabla-referencia-xpath');
    var botonCss = document.getElementById('boton-tabla-css');
    var botonXpath = document.getElementById('boton-tabla-xpath');
    var tabCss = document.getElementById('modal-tab-css');
    var tabXpath = document.getElementById('modal-tab-xpath');
    var botonCerrar = document.getElementById('modal-referencia-cerrar');

    function mostrar(modo) {
      var esCss = modo === 'css';
      titulo.textContent = esCss ? 'Selectores CSS' : 'Selectores XPath';
      tablaCss.classList.toggle('oculto', !esCss);
      tablaXpath.classList.toggle('oculto', esCss);
      tabCss.classList.toggle('opacity-50', !esCss);
      tabXpath.classList.toggle('opacity-50', esCss);
    }

    function abrir(modo) {
      mostrar(modo);
      modal.classList.remove('oculto');
    }

    function cerrar() {
      modal.classList.add('oculto');
    }

    botonCss.addEventListener('click', function () { abrir('css'); });
    botonXpath.addEventListener('click', function () { abrir('xpath'); });
    tabCss.addEventListener('click', function () { mostrar('css'); });
    tabXpath.addEventListener('click', function () { mostrar('xpath'); });
    botonCerrar.addEventListener('click', cerrar);
    modal.addEventListener('click', function (ev) {
      if (ev.target === modal) cerrar();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modal.classList.contains('oculto')) cerrar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
