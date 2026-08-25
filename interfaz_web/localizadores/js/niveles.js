/*
 * niveles.js
 * -----------------------------------------------------------------------
 * Definición declarativa de los rounds del juego. El orden sigue el de las
 * dos tablas de referencia (localizadores-css.txt y localizadores-xpath.txt):
 * primero todas las filas de CSS, después todas las de XPath. Cada fila de
 * esas tablas tiene su round acá, así el recorrido es 1 a 1 con el material
 * de estudio.
 *
 * Campos de cada nivel:
 *   id          número de round (0 = especial, elegir peleador)
 *   titulo      nombre corto que se ve en la cabecera
 *   tecnica     etiqueta de la técnica de la tabla (para mostrar y para el
 *               aviso "funcionó, pero esta ronda practicaba...")
 *   modo        'css' | 'xpath' — fija qué motor de evaluación se usa
 *   tipo        'genero' | 'equipar' | 'inspeccionar' | 'inspeccionar-multiple' | 'valor'
 *   consigna    enunciado que lee el alumno
 *   pista       ayuda que aparece al pedirla
 *   solucion    un selector válido de ejemplo (no el único posible)
 *   objetivoId / objetivoIds   id(s) del elemento correcto en el vestuario.js
 *   slot        (solo tipo 'equipar') dónde se coloca en el boxeador
 *   atributo    (solo tipo 'valor') qué atributo del objetivo se compara
 *   patronTecnica  RegExp opcional: si el selector acierta pero no matchea
 *                  este patrón, se avisa "funcionó pero con otra técnica"
 */
(function () {
  'use strict';

  var RL = (window.RL = window.RL || {});

  RL.niveles = [
    {
      id: 0,
      titulo: 'Elegí a tu peleador',
      tecnica: 'selector de atributo (adelanto)',
      modo: 'css',
      tipo: 'genero',
      consigna: 'Antes del primer asalto, elegí si vas a vestir al boxeador o a la boxeadora. ' +
        'Los dos son botones de una zona con id="selector-genero".',
      pista: 'Podés apuntar por id (#opcion-boxeador / #opcion-boxeadora) o por atributo ' +
        '([data-genero="m"] / [data-genero="f"]).',
      solucion: '#opcion-boxeadora'
    },

    // ---- Tabla de selectores CSS -----------------------------------
    {
      id: 1,
      titulo: 'El bucal',
      tecnica: '.class',
      modo: 'css',
      tipo: 'equipar',
      objetivoId: 'bucal-azul',
      slot: 'bucal',
      consigna: 'Agarrá el bucal azul del estante de arriba.',
      pista: 'Los selectores de clase empiezan con un punto: .nombre-de-clase',
      solucion: '.bucal',
      patronTecnica: /^\.[\w-]+$/
    },
    {
      id: 2,
      titulo: 'El guante bueno',
      tecnica: 'class1.class2',
      modo: 'css',
      tipo: 'equipar',
      objetivoId: 'guante-izquierdo',
      slot: 'guante-izq',
      consigna: 'Hay dos guantes en el estante: uno reglamentario y otro de práctica. Agarrá ' +
        'el reglamentario.',
      pista: 'Pegá dos clases sin espacio en el medio para pedir que el elemento tenga ambas ' +
        'a la vez: .clase1.clase2',
      solucion: '.guante.reglamentario',
      patronTecnica: /^\.[\w-]+\.[\w-]+$/
    },
    {
      id: 3,
      titulo: 'Las botas',
      tecnica: '.class1 .class2',
      modo: 'css',
      tipo: 'equipar',
      objetivoId: 'botas-altas',
      slot: 'botas',
      consigna: 'Las botas están en el estante de abajo, junto con el short. Agarralas.',
      pista: 'Un espacio entre dos clases busca la segunda clase adentro de la primera, sin ' +
        'importar la profundidad: .estante-bajo .bota',
      solucion: '.estante-bajo .bota',
      patronTecnica: /^\.[\w-]+\s+\.[\w-]+$/
    },
    {
      id: 4,
      titulo: 'El short',
      tecnica: '#id',
      modo: 'css',
      tipo: 'equipar',
      objetivoId: 'short-rojo',
      slot: 'short',
      consigna: 'Agarrá el short por su id, que es único en toda la página.',
      pista: '# + el id exacto: #short-rojo',
      solucion: '#short-rojo',
      patronTecnica: /^#[\w-]+$/
    },
    {
      id: 5,
      titulo: 'El mensaje del entrenador',
      tecnica: 'element',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'consejo',
      consigna: 'No hay que equipar nada en este round: solo señalá el mensaje del entrenador. ' +
        'Es el único elemento de esa etiqueta en todo el gimnasio.',
      pista: 'Escribí solamente el nombre de la etiqueta HTML, sin puntos ni símbolos: aside',
      solucion: 'aside',
      patronTecnica: /^[a-z][a-z0-9]*$/
    },
    {
      id: 6,
      titulo: 'El casco',
      tecnica: 'element.class',
      modo: 'css',
      tipo: 'equipar',
      objetivoId: 'casco-negro',
      slot: 'casco',
      consigna: 'Agarrá el casco combinando su etiqueta con su clase.',
      pista: 'Pegá la etiqueta justo antes del punto de la clase, sin espacio: li.casco',
      solucion: 'li.casco',
      patronTecnica: /^[a-z][a-z0-9]*\.[\w-]+$/
    },
    {
      id: 7,
      titulo: 'La campana y el cartel',
      tecnica: 'element, element',
      modo: 'css',
      tipo: 'inspeccionar-multiple',
      objetivoIds: ['campana', 'cartel-marca'],
      consigna: 'Señalá, en un solo golpe, la campana Y el cartel de la marca (son dos ' +
        'elementos sin relación entre sí).',
      pista: 'La coma no busca uno adentro del otro: selecciona a los dos por separado. ' +
        '#campana, #cartel-marca',
      solucion: '#campana, #cartel-marca',
      patronTecnica: /,/
    },
    {
      id: 8,
      titulo: 'El texto del consejo',
      tecnica: 'element element',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'texto-consejo',
      consigna: 'Dentro del mensaje del entrenador hay un párrafo escondido dos niveles más ' +
        'abajo. Encontralo.',
      pista: 'Un espacio entre etiquetas busca la segunda sin importar cuántos niveles haya ' +
        'en el medio: aside p',
      solucion: 'aside p',
      patronTecnica: /^[a-z][a-z0-9]*\s+[a-z][a-z0-9]*$/
    },
    {
      id: 9,
      titulo: 'El título del consejo',
      tecnica: 'element > element',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'titulo-consejo',
      consigna: 'Ahora encontrá el título del mensaje, que sí está un solo nivel adentro del ' +
        'mensaje (a diferencia del párrafo del round anterior).',
      pista: 'El símbolo > exige que sea hijo directo, un único nivel: aside > h3',
      solucion: 'aside > h3',
      patronTecnica: />/
    },
    {
      id: 10,
      titulo: 'El reloj',
      tecnica: '[attribute]',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'reloj',
      consigna: 'De todos los objetos de la esquina, solo uno tiene un atributo data-round. ' +
        'Encontralo sin importar su valor.',
      pista: 'Un atributo entre corchetes, sin valor, solo pregunta si existe: [data-round]',
      solucion: '[data-round]',
      patronTecnica: /^\[[\w-]+\]$/
    },
    {
      id: 11,
      titulo: 'El cartel, otra vez',
      tecnica: '[attribute=value]',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'cartel-marca',
      consigna: 'Esta vez encontrá solamente el cartel de la marca (no la campana), usando el ' +
        'valor exacto de su atributo data-marca.',
      pista: '[atributo="valor"]: [data-marca="CES"]',
      solucion: '[data-marca="CES"]',
      patronTecnica: /^\[[\w-]+=/
    },
    {
      id: 12,
      titulo: 'El guante de práctica',
      tecnica: '[attribute~=value]',
      modo: 'css',
      tipo: 'equipar',
      objetivoId: 'guante-derecho',
      slot: 'guante-der',
      consigna: 'El guante derecho tiene la etiqueta data-tags="cuero practica". Agarralo ' +
        'buscando la palabra "practica" dentro de esa lista.',
      pista: '[atributo~="palabra"] busca una palabra completa dentro de una lista separada ' +
        'por espacios: [data-tags~="practica"]',
      solucion: '[data-tags~="practica"]',
      patronTecnica: /~=/
    },
    {
      id: 13,
      titulo: 'El short, con talle',
      tecnica: '[attribute|=value]',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'short-rojo',
      consigna: 'Ya tenés puesto el short, pero encontralo de nuevo usando su talle: es el ' +
        'único que empieza con "m-".',
      pista: '[atributo|="valor"] acepta el valor exacto o el valor seguido de un guion: ' +
        '[data-talle|="m"]',
      solucion: '[data-talle|="m"]',
      patronTecnica: /\|=/
    },
    {
      id: 14,
      titulo: 'La ficha del casco',
      tecnica: '[attribute^=value]',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'link-casco',
      consigna: 'Encontrá el enlace a la ficha del casco: es el único cuyo link empieza con ' +
        '"https://www.ces".',
      pista: '[atributo^="valor"]: el atributo debe EMPEZAR con ese valor. a[href^="https://www.ces"]',
      solucion: 'a[href^="https://www.ces"]',
      patronTecnica: /\^=/
    },
    {
      id: 15,
      titulo: 'La ficha del guante',
      tecnica: '[attribute$=value]',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'link-guante',
      consigna: 'Encontrá el enlace a la ficha del guante izquierdo: es el único que termina ' +
        'en ".uy".',
      pista: '[atributo$="valor"]: el atributo debe TERMINAR con ese valor. a[href$=".uy"]',
      solucion: 'a[href$=".uy"]',
      patronTecnica: /\$=/
    },
    {
      id: 16,
      titulo: 'La ficha de las botas',
      tecnica: '[attribute*=value]',
      modo: 'css',
      tipo: 'inspeccionar',
      objetivoId: 'link-botas',
      consigna: 'Encontrá el enlace a la ficha de las botas: es el único que contiene la ' +
        'palabra "boxeo" en cualquier parte.',
      pista: '[atributo*="valor"]: el atributo debe CONTENER ese valor en cualquier posición. ' +
        'a[href*="boxeo"]',
      solucion: 'a[href*="boxeo"]',
      patronTecnica: /\*=/
    },

    // ---- Tabla de selectores XPath ----------------------------------
    {
      id: 17,
      titulo: 'El nodo raíz',
      tecnica: 'nodename',
      modo: 'xpath',
      tipo: 'inspeccionar',
      objetivoId: null,
      objetivoEsRaiz: true,
      consigna: 'Cambiaste de técnica: ahora es XPath. Para calentar, escribí el nombre del ' +
        'nodo raíz del documento.',
      pista: 'Un nombre de nodo solo (sin barras) busca ese nodo desde el punto de partida ' +
        'actual, que es el documento entero: html',
      solucion: 'html',
      patronTecnica: /^[a-z][a-z0-9]*$/
    },
    {
      id: 18,
      titulo: 'El vestuario, por ruta absoluta',
      tecnica: '/ (ruta absoluta)',
      modo: 'xpath',
      tipo: 'inspeccionar',
      objetivoId: 'vestuario',
      consigna: 'Llegá hasta la sección del vestuario escribiendo la ruta completa desde la ' +
        'raíz. Es la segunda <section> dentro de <main>.',
      pista: 'Cada barra baja un nivel exacto, empezando desde la raíz: ' +
        '/html/body/main/section[2]',
      solucion: '/html/body/main/section[2]',
      patronTecnica: /^\/html\//
    },
    {
      id: 19,
      titulo: 'Todos los enlaces',
      tecnica: '// (en cualquier lugar)',
      modo: 'xpath',
      tipo: 'inspeccionar-multiple',
      objetivoIds: ['link-casco', 'link-guante', 'link-botas'],
      consigna: 'Encontrá los 3 enlaces a fichas de producto del vestuario, estén donde estén.',
      pista: '// busca en cualquier parte del documento, sin importar la profundidad: //a',
      solucion: '//a',
      patronTecnica: /^\/\/[a-z][a-z0-9]*$/
    },
    {
      id: 20,
      titulo: 'La campana, bajando un nivel',
      tecnica: '// /',
      modo: 'xpath',
      tipo: 'inspeccionar',
      objetivoId: 'campana',
      consigna: 'Entrá al hijo <span> de la esquina, sin importar dónde esté la esquina en el ' +
        'documento.',
      pista: 'Combiná // para llegar al padre desde cualquier lado, y / para bajar al hijo: ' +
        '//div[@class="esquina"]/span',
      solucion: '//div[@class="esquina"]/span',
      patronTecnica: /^\/\/.+\/[a-z]/
    },
    {
      id: 21,
      titulo: 'El nodo actual',
      tecnica: '. (nodo actual)',
      modo: 'xpath',
      tipo: 'inspeccionar',
      objetivoId: 'consejo',
      consigna: 'Encontrá el mensaje del entrenador, terminando la ruta con "/." para quedarte ' +
        'en el nodo actual.',
      pista: '//aside[@id="consejo"]/.',
      solucion: '//aside[@id="consejo"]/.',
      patronTecnica: /\/\.$/
    },
    {
      id: 22,
      titulo: 'El padre del texto',
      tecnica: '.. (nodo padre)',
      modo: 'xpath',
      tipo: 'inspeccionar',
      objetivoId: 'cuerpo-consejo',
      consigna: 'Partiendo del párrafo del consejo, subí un nivel para encontrar a su padre.',
      pista: '//p[@id="texto-consejo"]/..',
      solucion: '//p[@id="texto-consejo"]/..',
      patronTecnica: /\/\.\.$/
    },
    {
      id: 23,
      titulo: 'El link del guante, como texto',
      tecnica: '@ (atributos)',
      modo: 'xpath',
      tipo: 'valor',
      objetivoId: 'link-guante',
      atributo: 'href',
      consigna: 'En vez de traer el elemento <a>, traé el VALOR de su atributo href.',
      pista: '@ selecciona un atributo en vez de un elemento: //a[@id="link-guante"]/@href',
      solucion: '//a[@id="link-guante"]/@href',
      patronTecnica: /@href/
    },
    {
      id: 24,
      titulo: 'El casco, por su texto',
      tecnica: '[condición]',
      modo: 'xpath',
      tipo: 'inspeccionar',
      objetivoId: 'casco-negro',
      consigna: 'Encontrá el casco buscando un <li> cuyo párrafo interno diga exactamente ' +
        '"Casco".',
      pista: '//li[p="Casco"]',
      solucion: '//li[p="Casco"]',
      patronTecnica: /\[.+=.+\]/
    },

    // ---- Rounds extra: las vendas no tienen fila propia en las tablas
    // de referencia, así que estos dos repiten técnicas ya vistas
    // (#id y [attribute=value]) en vez de sumar una técnica nueva.
    {
      id: 25,
      titulo: 'La venda izquierda',
      tecnica: '#id',
      modo: 'css',
      tipo: 'equipar',
      objetivoId: 'venda-izquierda',
      slot: 'venda-izq',
      consigna: 'Antes de los guantes van las vendas: agarrá la venda izquierda por su id.',
      pista: '# + el id exacto: #venda-izquierda',
      solucion: '#venda-izquierda',
      patronTecnica: /^#[\w-]+$/
    },
    {
      id: 26,
      titulo: 'La venda derecha',
      tecnica: 'element[attribute=value]',
      modo: 'css',
      tipo: 'equipar',
      objetivoId: 'venda-derecha',
      slot: 'venda-der',
      consigna: 'Cerrá el vestuario agarrando la venda derecha por su atributo data-slot. Ojo: ' +
        'ese mismo atributo también está en el hueco vacío del brazo, así que vas a necesitar ' +
        'combinarlo con la etiqueta li para apuntar solo al estante.',
      pista: 'etiqueta[atributo="valor"]: li[data-slot="venda-der"]',
      solucion: 'li[data-slot="venda-der"]',
      patronTecnica: /^[a-z][a-z0-9]*\[[\w-]+=/
    }
  ];
})();
