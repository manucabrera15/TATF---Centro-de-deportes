import { FilePlusIcon, LayersIcon, ListCheckIcon } from "@/components/icons";

const CONCEPTS = [
  {
    title: "Escenarios",
    Icon: FilePlusIcon,
    intro: "Los escenarios son conjuntos estructurados de pruebas. Componentes clave:",
    items: [
      ["Nombre", "Identificador único y descriptivo."],
      ["Descripción", "Resumen del propósito y alcance del escenario."],
      ["Precondiciones", "Estado inicial requerido para ejecutar el escenario."],
      ["Pasos funcionales", "Secuencia de acciones y verificaciones a realizar."],
      ["Funciones auxiliares", "Un escenario puede llamar a una o varias funciones auxiliares reutilizables."],
    ],
    outro:
      "Los escenarios ayudan a organizar y ejecutar pruebas de manera sistemática, asegurando una cobertura completa de la funcionalidad.",
  },
  {
    title: "Guiones",
    Icon: ListCheckIcon,
    intro: "Los guiones son la secuencia de pasos funcionales a ejecutar. Características principales:",
    items: [
      ["Acciones", "Describen acciones específicas a realizar."],
      ["Reutilización", "Pueden apoyarse en llamados a funciones auxiliares."],
      ["Rol", "Son parte fundamental de los escenarios de prueba."],
    ],
    outro: null as string | null,
  },
  {
    title: "Funciones auxiliares",
    Icon: LayersIcon,
    intro: "Componentes reutilizables que facilitan la ejecución de tareas específicas. Detalles importantes:",
    items: [
      ["Nombre", "Identificador único para la función."],
      ["Parámetros", "Datos de entrada necesarios para la función."],
      ["Descripción", "Explicación del propósito y uso de la función."],
      ["Pasos funcionales", "Secuencia de acciones que realiza la función."],
    ],
    outro: "Permiten modularizar y simplificar los guiones, mejorando la mantenibilidad y reutilización entre escenarios." as string | null,
  },
];

export default function WelcomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__eyebrow">
          <LayersIcon />
          <span>TATF · Suite de pruebas</span>
        </div>
        <h1>Escenarios, guiones y funciones auxiliares</h1>
        <p>
          Herramienta para diseñar escenarios de prueba, documentar sus guiones paso a paso y reutilizar funciones
          auxiliares entre distintos escenarios.
        </p>
      </section>

      <div className="concept-grid">
        {CONCEPTS.map((c) => (
          <div className="concept" key={c.title}>
            <div className="concept__header">
              <c.Icon />
              <span>{c.title}</span>
            </div>
            <div className="concept__body">
              <p>{c.intro}</p>
              <ul>
                {c.items.map(([term, desc]) => (
                  <li key={term}>
                    <strong>{term}:</strong> {desc}
                  </li>
                ))}
              </ul>
              {c.outro ? <p style={{ marginTop: 10 }}>{c.outro}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
