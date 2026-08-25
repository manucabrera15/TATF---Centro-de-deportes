/*
 * espejo.js
 * -----------------------------------------------------------------------
 * Refleja, en un panel grande fuera del iframe, el estado actual del
 * peleador (género elegido + accesorios equipados) que vive DENTRO del
 * iframe del gimnasio. Es puro espejo: solo lee el DOM bajo prueba, nunca
 * lo modifica ni participa en la evaluación de los rounds.
 */
(function () {
  'use strict';

  var RL = (window.RL = window.RL || {});

  var SLOTS = [
    'casco', 'bucal', 'venda-izq', 'venda-der',
    'guante-izq', 'guante-der', 'short', 'botas'
  ];

  function sincronizar(doc) {
    var contenedor = document.getElementById('espejo-peleador');
    if (!contenedor || !doc) return;

    var peleador = doc.getElementById('peleador');
    var genero = peleador ? peleador.getAttribute('data-genero') : '';

    var marco = contenedor.querySelector('.espejo-silueta-contenedor');
    if (marco) marco.classList.toggle('con-peleador', !!genero);

    var siluetas = contenedor.querySelectorAll('.espejo-silueta');
    Array.prototype.forEach.call(siluetas, function (img) {
      img.classList.toggle('espejo-silueta-activa', !!genero && img.getAttribute('data-genero-img') === genero);
    });

    SLOTS.forEach(function (slotNombre) {
      var slotOrigen = doc.querySelector('.slot[data-slot="' + slotNombre + '"]');
      var slotDestino = contenedor.querySelector('.espejo-slot[data-slot="' + slotNombre + '"]');
      if (!slotDestino) return;
      var imgOrigen = slotOrigen ? slotOrigen.querySelector('img') : null;
      slotDestino.innerHTML = '';
      slotDestino.classList.toggle('espejo-slot-lleno', !!imgOrigen);
      if (imgOrigen) {
        var clon = imgOrigen.cloneNode(true);
        clon.removeAttribute('onerror');
        slotDestino.appendChild(clon);
      }
    });
  }

  RL.espejo = { sincronizar: sincronizar };
})();
