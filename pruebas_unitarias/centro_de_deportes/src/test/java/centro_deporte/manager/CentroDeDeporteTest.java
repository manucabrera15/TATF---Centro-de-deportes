package centro_deporte.manager;

import org.junit.jupiter.api.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class CentroDeDeporteTest {

    private CentroDeporte centro;

    @BeforeAll
    static void beforeAll() {

        System.out.println("Iniciando las pruebas");
    }

    @AfterAll
    static void afterAll() {

        System.out.println("Finalizan las pruebas");
    }

    @BeforeEach
    void setUp() {
        centro = new CentroDeporte();
    }

    @AfterEach
    void tearDown() {
        centro = null;
    }

    @Test
    void obtenerDeportesDebeRetornarListaConElementos() {

        List<String> deportes = centro.obtenerDeportes();

        assertNotNull(deportes);

        assertFalse(deportes.isEmpty());
    }

    @Test
    void obtenerDeportesDebeContenerFutbol() {
        List<String> deportes = centro.obtenerDeportes();
        assertTrue(deportes.contains("Fútbol")
        );
    }

    @Test
    void obtenerDeportesPorLetraDebeRetornarElementos() {
        List<String> deportes = centro.obtenerDeportes("F");
        assertFalse(deportes.isEmpty());
    }

    @Test
    void crearDeporteDebeAgregarNuevoDeporte() {
        centro.crearDeporte("Padel");
        assertTrue(centro.obtenerDeportes()
                .contains("Padel[DEPORTE]"));
    }

    @Test
    void modificarDeporteDebeCambiarNombre() {
        centro.modificarDeporte(
                "Fútbol",
                "Padel"
        );
        assertTrue(centro.obtenerDeportes()
                .contains("Padel"));
    }

    @Test
    void eliminarDeporteDebeQuitarElemento() {
        centro.eliminarDeporte("Tenis");
        assertFalse(
                centro.obtenerDeportes()
        .contains("Tenis")
        );
    }


    }