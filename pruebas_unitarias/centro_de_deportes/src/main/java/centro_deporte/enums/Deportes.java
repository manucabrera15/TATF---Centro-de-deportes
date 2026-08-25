package centro_deporte.enums;

public enum Deportes {
    ATLETISMO("Atletismo"),
    BALONCESTO("Baloncesto"),
    BOXEO("Boxeo"),
    CICLISMO("Ciclismo"),
    ESCALADA("Escalada"),
    ESGRIMA("Esgrima"),
    FUTBOL("Fútbol"),
    GIMNASIA("Gimnasia"),
    GOLF("Golf"),
    JUDO("Judo"),
    KARATE("Karate"),
    NATACION("Natación"),
    PATINAJE("Patinaje"),
    REMO("Remo"),
    RUGBY("Rugby"),
    SALTO_ESQUI("Salto en Esquí"),
    SURF("Surf"),
    TAEKWONDO("Taekwondo"),
    TENIS("Tenis"),
    VELA("Vela"),
    VOLEIBOL("Voleibol");

    private final String value;

    Deportes(String value) {
        this.value = value;
    }


    @Override
    public String toString() {
        return value;
    }
}
