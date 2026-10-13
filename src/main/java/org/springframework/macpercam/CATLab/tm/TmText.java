package org.springframework.macpercam.CATLab.tm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utilidades de la TM nivel 2: tokenización, placeables, distancia fuzzy,
 * diff y adaptación de placeables. Sin estado, sin dependencias de Spring.
 */
final class TmText {

    private TmText() {}

    enum Tipo {
        PALABRA, SIMBOLO, FECHA, IMPORTE, NUMERO;

        boolean esPlaceable() {
            return this == FECHA || this == IMPORTE || this == NUMERO;
        }
    }

    /** espacioAntes: había espacio en blanco antes del token (para reconstruir el texto). */
    record Token(String texto, Tipo tipo, boolean espacioAntes) {

        /** Clave para normalizar (distingue mayúsculas). Los placeables se sustituyen por su tipo. */
        String claveExacta() {
            return tipo.esPlaceable() ? "<" + tipo.name() + ">" : texto;
        }

        /** Clave para comparar de forma difusa (ignora mayúsculas). */
        String claveFuzzy() {
            return claveExacta().toLowerCase();
        }
    }

    record Adaptacion(String texto, boolean cambiado, boolean aviso) {}

    // ---------------------------------------------------------------- Tokenización

    private static final String FECHA =
        "\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[/.\\-]\\d{1,2}[/.\\-]\\d{2,4}";
    private static final String IMPORTE =
        "[€$£]\\s?\\d+(?:[.,]\\d+)*|\\d+(?:[.,]\\d+)*\\s?(?:€|\\$|£|EUR|USD|GBP)";
    private static final String NUMERO = "\\d+(?:[.,]\\d+)*";

    private static final Pattern TOKEN = Pattern.compile(
        "(?:(?<![\\p{L}\\d_])(?:(?<fecha>" + FECHA + ")|(?<importe>" + IMPORTE + ")|(?<numero>" + NUMERO + "))(?![\\p{L}\\d_]))"
        + "|(?<palabra>[\\p{L}\\p{N}_]+)"
        + "|(?<simbolo>[^\\s])");

    private static Tipo tipoDe(Matcher m) {
        if (m.group("fecha") != null) return Tipo.FECHA;
        if (m.group("importe") != null) return Tipo.IMPORTE;
        if (m.group("numero") != null) return Tipo.NUMERO;
        if (m.group("palabra") != null) return Tipo.PALABRA;
        return Tipo.SIMBOLO;
    }

    static List<Token> tokenizar(String s) {
        List<Token> out = new ArrayList<>();
        Matcher m = TOKEN.matcher(s == null ? "" : s);
        int prevEnd = 0;
        while (m.find()) {
            boolean espacio = !out.isEmpty() && m.start() > prevEnd;
            out.add(new Token(m.group(), tipoDe(m), espacio));
            prevEnd = m.end();
        }
        return out;
    }

    /** Texto normalizado: placeables → <TIPO>, espacios colapsados. Sirve para detectar UTs duplicadas. */
    static String normalizar(String s) {
        StringBuilder sb = new StringBuilder();
        for (Token t : tokenizar(s)) {
            if (sb.length() > 0) sb.append(' ');
            sb.append(t.claveExacta());
        }
        return sb.toString();
    }

    static List<String> clavesFuzzy(List<Token> tokens) {
        List<String> k = new ArrayList<>(tokens.size());
        for (Token t : tokens) k.add(t.claveFuzzy());
        return k;
    }

    static Map<Tipo, List<String>> placeables(List<Token> tokens) {
        Map<Tipo, List<String>> map = new EnumMap<>(Tipo.class);
        for (Token t : tokens) {
            if (t.tipo().esPlaceable()) {
                map.computeIfAbsent(t.tipo(), x -> new ArrayList<>()).add(t.texto());
            }
        }
        return map;
    }

    // ---------------------------------------------------------------- Distancia fuzzy

    /** Distancia de Levenshtein a nivel de token. */
    static int distancia(List<String> a, List<String> b) {
        int n = a.size(), m = b.size();
        int[] prev = new int[m + 1];
        int[] cur = new int[m + 1];
        for (int j = 0; j <= m; j++) prev[j] = j;
        for (int i = 1; i <= n; i++) {
            cur[0] = i;
            for (int j = 1; j <= m; j++) {
                int cost = a.get(i - 1).equals(b.get(j - 1)) ? 0 : 1;
                cur[j] = Math.min(Math.min(cur[j - 1] + 1, prev[j] + 1), prev[j - 1] + cost);
            }
            int[] tmp = prev; prev = cur; cur = tmp;
        }
        return prev[m];
    }

    // ---------------------------------------------------------------- Diff

    static final String EQUAL = "EQUAL";
    static final String DELETE = "DELETE";       // está en la UT pero no en el segmento actual
    static final String INSERT = "INSERT";       // está en el segmento actual pero no en la UT
    static final String PLACEABLE = "PLACEABLE"; // mismo tipo de placeable, distinto valor

    /**
     * Diff token a token entre el origen de la UT y el texto del segmento actual.
     * Se muestra sobre el origen de la UT: DELETE = sobra, INSERT = falta, PLACEABLE = valor distinto.
     */
    static List<TmMatchDTO.DiffPart> diff(List<Token> utTokens, List<Token> segTokens) {
        int n = utTokens.size(), m = segTokens.size();
        List<String> a = clavesFuzzy(utTokens), b = clavesFuzzy(segTokens);

        int[][] dp = new int[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                int cost = a.get(i - 1).equals(b.get(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i][j - 1] + 1, dp[i - 1][j] + 1), dp[i - 1][j - 1] + cost);
            }
        }

        List<TmMatchDTO.DiffPart> rev = new ArrayList<>();
        int i = n, j = m;
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && a.get(i - 1).equals(b.get(j - 1)) && dp[i][j] == dp[i - 1][j - 1]) {
                Token ut = utTokens.get(i - 1);
                boolean valorDistinto = ut.tipo().esPlaceable() && !ut.texto().equals(segTokens.get(j - 1).texto());
                rev.add(new TmMatchDTO.DiffPart(ut.texto(), valorDistinto ? PLACEABLE : EQUAL, ut.espacioAntes()));
                i--; j--;
            } else if (i > 0 && j > 0 && dp[i][j] == dp[i - 1][j - 1] + 1) {
                // sustitución: (al invertir) primero se verá DELETE y luego INSERT
                Token sg = segTokens.get(j - 1);
                Token ut = utTokens.get(i - 1);
                rev.add(new TmMatchDTO.DiffPart(sg.texto(), INSERT, sg.espacioAntes()));
                rev.add(new TmMatchDTO.DiffPart(ut.texto(), DELETE, ut.espacioAntes()));
                i--; j--;
            } else if (i > 0 && dp[i][j] == dp[i - 1][j] + 1) {
                Token ut = utTokens.get(i - 1);
                rev.add(new TmMatchDTO.DiffPart(ut.texto(), DELETE, ut.espacioAntes()));
                i--;
            } else {
                Token sg = segTokens.get(j - 1);
                rev.add(new TmMatchDTO.DiffPart(sg.texto(), INSERT, sg.espacioAntes()));
                j--;
            }
        }
        Collections.reverse(rev);
        return rev;
    }

    // ---------------------------------------------------------------- Adaptación de placeables

    /**
     * Adapta el destino de la UT a los placeables del segmento actual.
     * Cada placeable del destino se busca (mismo tipo y mismo texto) entre los placeables
     * del origen de la UT y se sustituye por el placeable que ocupa esa posición en el segmento.
     *
     * No se convierten formatos regionales (1.000,50 ↔ 1,000.50): si un placeable del destino
     * no tiene correspondencia en el origen, se deja tal cual y se activa "aviso".
     */
    static Adaptacion adaptar(List<Token> segTokens, List<Token> utOrigenTokens, String destinoUt) {
        Map<Tipo, List<String>> seg = placeables(segTokens);
        Map<Tipo, List<String>> src = placeables(utOrigenTokens);

        boolean hayDiferencias = !seg.equals(src);
        boolean compatible = true;
        for (Tipo t : Tipo.values()) {
            if (!t.esPlaceable()) continue;
            if (seg.getOrDefault(t, List.of()).size() != src.getOrDefault(t, List.of()).size()) {
                compatible = false;
            }
        }

        String destino = destinoUt == null ? "" : destinoUt;
        if (!hayDiferencias) return new Adaptacion(destino, false, false);

        Map<Tipo, Set<Integer>> usados = new EnumMap<>(Tipo.class);
        StringBuilder sb = new StringBuilder();
        Matcher m = TOKEN.matcher(destino);
        int last = 0;
        boolean cambiado = false, aviso = false;

        while (m.find()) {
            Tipo tipo = tipoDe(m);
            if (!tipo.esPlaceable()) continue;

            String texto = m.group();
            String reemplazo = null;

            if (compatible) {
                List<String> origenes = src.getOrDefault(tipo, List.of());
                Set<Integer> usadosTipo = usados.computeIfAbsent(tipo, x -> new HashSet<>());
                for (int idx = 0; idx < origenes.size(); idx++) {
                    if (!usadosTipo.contains(idx) && origenes.get(idx).equals(texto)) {
                        usadosTipo.add(idx);
                        reemplazo = seg.get(tipo).get(idx);
                        break;
                    }
                }
            }

            sb.append(destino, last, m.start());
            if (reemplazo == null) {
                aviso = true;
                sb.append(texto);
            } else {
                if (!reemplazo.equals(texto)) cambiado = true;
                sb.append(reemplazo);
            }
            last = m.end();
        }
        sb.append(destino.substring(last));

        return new Adaptacion(sb.toString(), cambiado, aviso);
    }
}