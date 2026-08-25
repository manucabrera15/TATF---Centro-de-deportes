package centro_deporte.manager;

import java.util.List;

/**
 * Interfaz que define las operaciones básicas para gestionar los deportes en un centro deportivo.
 */
public interface ICentroDeporte {
    static ICentroDeporte create() {
        return new CentroDeporte();
    }

    /**
     * Obtiene una lista de nombres de todos los deportes disponibles.
     *
     * @return Lista de nombres de deportes.
     */
    List<String> obtenerDeportes();

    /**
     * Obtiene una lista de nombres de deportes que comienzan con la letra especificada.
     *
     * @param letra Letra inicial para filtrar los deportes.
     * @return Lista de nombres de deportes que comienzan con la letra dada.
     */
    List<String> obtenerDeportes(String letra);

    /**
     * Crea un nuevo deporte y lo agrega al centro deportivo.
     *
     * @param nombreDeporte El nombre del nuevo deporte a crear.
     */
    void crearDeporte(String nombreDeporte);

    /**
     * Modifica el nombre de un deporte existente en el centro deportivo.
     *
     * @param nombreDeporte El nombre actual del deporte a modificar.
     * @param nuevoNombre   El nuevo nombre que se asignará al deporte.
     */
    void modificarDeporte(String nombreDeporte, String nuevoNombre);

    /**
     * Elimina un deporte del centro deportivo.
     *
     * @param nombreDeporte El nombre del deporte a eliminar.
     */
    void eliminarDeporte(String nombreDeporte);
}
