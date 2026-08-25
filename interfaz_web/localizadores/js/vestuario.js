/*
 * vestuario.js
 * -----------------------------------------------------------------------
 * Entrega el documento HTML del gimnasio (ring + vestuario + esquina con
 * objetos de utilería) que vive DENTRO del iframe: el "DOM bajo prueba"
 * contra el que el alumno escribe selectores CSS/XPath. El HTML en sí es
 * puro texto y vive en gimnasio-html.js (RL.gimnasioHTML); acá solo está
 * la lógica que lo expone al resto del juego.
 *
 * Se entrega como un string (RL.vestuario.construirGimnasio()) porque el
 * iframe se monta con `srcdoc`, no con `src` (ver notas en app.js sobre
 * por qué: con file:// un iframe con src a otro .html queda con origen
 * opaco y no se puede leer contentDocument).
 *
 * Convenciones de diseño (para quien edite gimnasio-html.js más adelante):
 *  - Cada accesorio "equipable" tiene un id propio y data-slot, que es la
 *    clave que usa app.js para saber en qué parte del boxeador colocarlo.
 *  - Los objetos de la esquina (campana, cartel, reloj, mensaje del
 *    entrenador) no se equipan: sirven para practicar selectores sin
 *    gastar accesorios reales, y para las técnicas que no representan
 *    "una sola cosa" (uniones, ejes de XPath, etc).
 *  - Todo <p class="etiqueta"> se escribe en una sola línea de texto, sin
 *    saltos internos: algunos rounds de XPath comparan el string-value
 *    exacto del nodo (por ejemplo //li[p="Casco"]) y un salto de
 *    línea de más rompería la comparación.
 */
(function () {
  'use strict';

  var RL = (window.RL = window.RL || {});

  function construirGimnasio() {
    return RL.gimnasioHTML;
  }

  RL.vestuario = {
    construirGimnasio: construirGimnasio
  };
})();
