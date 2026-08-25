package centro_deporte.manager;

import centro_deporte.enums.Deportes;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CentroDeporte implements ICentroDeporte {
    private List<String> listaDeportes;

    public CentroDeporte() {
        List<Deportes> lista = List.of(Deportes.values());

        listaDeportes = new ArrayList<>();

        for (Deportes deportes : lista)
            listaDeportes.add(deportes.toString());
    }

    @Override
    public List<String> obtenerDeportes() {
        return listaDeportes;
    }

    @Override
    public List<String> obtenerDeportes(String letra) {
        List<String> retorno = new ArrayList<>();

        for (String deporte : listaDeportes){
            if (deporte.startsWith(letra)) {
                //return Collections.emptyList();
                retorno.add(deporte);
            }
        }
        return retorno;
    }

    @Override
    public void crearDeporte(String nombreDeporte) {
        listaDeportes.add(nombreDeporte + "[DEPORTE]");
    }

    @Override
    public void modificarDeporte(String nombreDeporte, String nuevoNombre) {
        List<String> nuevaListaDeportes = new ArrayList<>();

        for (String deporte : listaDeportes)
            if (deporte.equals(nombreDeporte))
                nuevaListaDeportes.add(nuevoNombre);
            else
                nuevaListaDeportes.add(deporte);

            listaDeportes = nuevaListaDeportes;
    }

    @Override
    public void eliminarDeporte(String nombreDeporte) {
        listaDeportes.remove(nombreDeporte);
        //listaDeportes.remove(nombreDeporte);

    }
}
