# Escenarios y Guiones (Next.js)

Herramienta para el manejo de guiones y datos referentes: escenarios de prueba, sus guiones paso a paso, y funciones auxiliares reutilizables. Un escenario puede llamar a múltiples funciones auxiliares, y tanto escenarios como funciones pueden llamar a otras funciones auxiliares directamente desde sus pasos.

## Stack

- **Next.js 16** con **App Router**.
- **TypeScript**.
- **Tailwind CSS 4** (junto con una hoja de estilos propia en `app/globals.css` que define el sistema de diseño oscuro — colores, tipografía, componentes como `.btn`, `.panel`, `.chip`, `.steps-table`, etc. — usando las utilidades de Tailwind donde tiene sentido y CSS a medida para los componentes más particulares).
- **pnpm** como gestor de paquetes.
- Persistencia en **`localStorage`** del navegador (no hay backend). Todos los componentes que leen/escriben datos son Client Components; la data se carga en un `useEffect` para evitar desajustes entre el render de servidor y el del cliente.

## Ejecución

```bash
pnpm install
pnpm dev       # servidor de desarrollo en http://localhost:3000
pnpm build     # build de producción
pnpm start     # sirve el build de producción
pnpm lint      # ESLint
```

## Funcionalidades

- Crear, ver, editar y eliminar **escenarios**: nombre, descripción,
  precondiciones, variables (solo `nombre`, sin valor) y guión de pasos.
- Un escenario referencia funciones auxiliares llamándolas directamente
  desde un paso con `[[Nombre función]]`; la lista de funciones auxiliares
  usadas se deriva automáticamente de esos llamados (no hay un selector
  aparte).
- Crear, ver, editar y eliminar **funciones auxiliares**: nombre,
  parámetros (que funcionan como variables utilizables en los pasos con
  `{{parámetro}}`), descripción y guión de pasos. También pueden llamar a
  otras funciones auxiliares desde sus pasos.
- El guión de pasos solo registra el **paso funcional** (ya no hay un campo
  de "resultado esperado").
- Al insertar una función auxiliar con parámetros (desde el selector o
  escribiendo `[[`), se abre un bloque flotante para completar el valor de
  cada parámetro antes de insertarla; en la fila se muestra como una ficha
  visual (chip), no como texto plano.
- Autocompletado al escribir `{{` o `[[` dentro de un paso, y predictivo de
  nombres ya usados al agregar una variable nueva.
- Atajo **Ctrl+Enter** (⌘+Enter en Mac) para agregar una fila nueva, tanto
  en el guión de pasos como en la lista de variables — con un tooltip que
  lo recuerda tras una pausa al tipear.
- En "Ver escenarios" / "Ver funciones", cada tarjeta arranca colapsada
  (solo título, descripción, editar y eliminar) y se expande con un botón
  para ver el resto de los datos.
- Exportar todos los datos guardados en JSON o en texto plano.
- Exportar el dato actualmente en edición (antes de guardarlo) como JSON.
- Eliminar todos los datos guardados desde el menú superior.
