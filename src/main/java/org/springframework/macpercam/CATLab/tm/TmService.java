package org.springframework.macpercam.CATLab.tm;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.macpercam.CATLab.estudiante.Estudiante;
import org.springframework.macpercam.CATLab.estudiante.EstudianteRepository;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.macpercam.CATLab.proyecto.Proyecto;
import org.springframework.macpercam.CATLab.proyecto.ProyectoRepository;
import org.springframework.macpercam.CATLab.proyecto.idioma.Idioma;
import org.springframework.macpercam.CATLab.proyecto.idioma.IdiomaRepository;
import org.springframework.macpercam.CATLab.segmento.Segmento;
import org.springframework.macpercam.CATLab.segmento.SegmentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service 
public class TmService {

    private TmRepository tmrepo;
    private TuRepository tuRepo;
    private ProyectoRepository proyectoRepo;
    private IdiomaRepository idiomaRepo;
    private EstudianteRepository estudianteRepo;
    private SegmentoRepository segmentoRepo;

    @Autowired 
    public TmService(TmRepository tmrepo, ProyectoRepository proyectoRepo, TuRepository tuRepo,
        IdiomaRepository idiomaRepo, EstudianteRepository estudianteRepo, SegmentoRepository segmentoRepo) {
        this.tmrepo = tmrepo;
        this.proyectoRepo = proyectoRepo;
        this.tuRepo = tuRepo;
        this.idiomaRepo = idiomaRepo;
        this.estudianteRepo = estudianteRepo;
        this.segmentoRepo = segmentoRepo;

    }


    // #region CRUD
    @Transactional(readOnly = true)
    public List<Tm> getAllTms() {
        return (List<Tm>) tmrepo.findAll();
    }

    @Transactional(readOnly = true)
    public Tm getTmById(Integer id) {
        return tmrepo.findById(id).orElseThrow(() -> new RuntimeException("TM not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Tm getTmByProjectId(Integer projectId) {
        Proyecto p = proyectoRepo.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        Tm tm = p.getTm();
        return tm;
    }

    @Transactional(readOnly = true)
    public List<Tm> getTmsByUserId(Integer userId) {
        Estudiante estudiante = estudianteRepo.findByUser(userId).orElseThrow(() -> new ResourceNotFoundException("Estudiante", "userId", userId));
        return tmrepo.findByStudentId(estudiante.getId());
    }

    @Transactional
    public Tm createTm(CreateTmDTO createTmDTO, String username) {
        Tm tm = new Tm();
        tm.setName(createTmDTO.getName());
        Idioma idioma_a = idiomaRepo.findById(createTmDTO.getIdiomaA_id()).orElseThrow(() -> new RuntimeException("Idioma A not found with id: " + createTmDTO.getIdiomaA_id()));
        Idioma idioma_b = idiomaRepo.findById(createTmDTO.getIdiomaB_id()).orElseThrow(() -> new RuntimeException("Idioma B not found with id: " + createTmDTO.getIdiomaB_id()));
        tm.setIdiomaA(idioma_a);
        tm.setIdiomaB(idioma_b);
        
        Estudiante actual = estudianteRepo.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Estudiante", "username", username));
        tm.setEstudiante(actual);
        
        return tmrepo.save(tm);
    }

    @Transactional
    public Tm editTm(Integer id, EditTMDTO editTm) {
        Tm tm = tmrepo.findById(id).orElseThrow(() -> new RuntimeException("TM not found with id: " + id));
        tm.setName(editTm.getName());
        return tmrepo.save(tm);
    }

    @Transactional
    public void deleteTm(Integer id) {
        Tm tm = tmrepo.findById(id).orElseThrow(() -> new RuntimeException("TM not found with id: " + id));
        
        List<Proyecto> proyectos = proyectoRepo.findByTmId(tm.getId());
        if (!proyectos.isEmpty()) {
            throw new RuntimeException("Cannot delete TM with id: " + id + " because it is associated with existing projects.");
        }
        List<Tu> tus = getTusByTmId(id);
        for (Tu tu : tus) {
            tuRepo.delete(tu);
        }
        tmrepo.delete(tm);
    }

    // #region CRUD - TUs
    @Transactional(readOnly = true)
    public List<Tu> getTusByTmId(Integer tmId) {
        Tm tm = tmrepo.findById(tmId).orElseThrow(() -> new RuntimeException("TM not found with id: " + tmId));
        List<Tu> tus = tuRepo.findByTmId(tm.getId());
        return tus;
    }

    @Transactional 
    public Tu editTu(Integer tuId, EditTuDTO editTuDTO) {
        Tu tu = tuRepo.findById(tuId).orElseThrow(() -> new RuntimeException("TU not found with id: " + tuId));
        if (buscarEquivalente(tu.getTm().getId(), editTuDTO.getOrigen(), editTuDTO.getDestino(), tuId) != null) {
            throw new RuntimeException("A TU with the same origin and target already exists in this TM.");
        }
        // List <Tu> existingTus = tuRepo.findByTmId(tu.getTm().getId());
        // for (Tu existingTu : existingTus) {
        //     if (!existingTu.getId().equals(tuId) && existingTu.getOrigen().equals(editTuDTO.getOrigen()) && existingTu.getDestino().equals(editTuDTO.getDestino())) {
        //         throw new RuntimeException("A TU with the same origin and target already exists in this TM.");
        //     }
        // }
        tu.setOrigen(editTuDTO.getOrigen());
        tu.setDestino(editTuDTO.getDestino());
        tu.setUltimaActualizacion(LocalDateTime.now());
        return tuRepo.save(tu);
    }

    @Transactional void deleteTu(Integer tuId) {
        Tu tu = tuRepo.findById(tuId).orElseThrow(() -> new RuntimeException("TU not found with id: " + tuId));
        tuRepo.delete(tu);
    }

    @Transactional 
    public Tu createTu(Integer tmId, EditTuDTO editTuDTO) {
        Tm tm = tmrepo.findById(tmId).orElseThrow(() -> new RuntimeException("TM not found with id: " + tmId));
        if (buscarEquivalente(tmId, editTuDTO.getOrigen(), editTuDTO.getDestino(), null) != null) {
            throw new RuntimeException("A TU with the same origin and target already exists in this TM.");
        }
        // List<Tu> existingTus = tuRepo.findByTmId(tmId);
        // for (Tu existingTu : existingTus) {
        //     if (existingTu.getOrigen().equals(editTuDTO.getOrigen()) && existingTu.getDestino().equals(editTuDTO.getDestino())) {
        //         throw new RuntimeException("A TU with the same origin and target already exists in this TM.");
        //     }
        // }
        Tu tu = new Tu();
        tu.setOrigen(editTuDTO.getOrigen());
        tu.setDestino(editTuDTO.getDestino());
        tu.setTm(tm);
        tu.setUsoCount(0);
        tu.setUltimaActualizacion(LocalDateTime.now());
        return tuRepo.save(tu);
    }

    // #endregion CRUD - TUs
    // #endregion CRUD

    // #region Level 1
    private boolean mismoSentido(Tm tm, Proyecto p){
        return Objects.equals(tm.getIdiomaA().getId(), p.getIdiomaOrigen().getId());
    }

    private String limpiar(String s){
        return s == null ? "" : s.trim();
    }

    // Al marcar como revisado:
    @Transactional 
    public void guardarDesdeSegmento(Segmento segmento){
        Proyecto p = segmento.getProyecto();
        if (p== null || p.getTm() == null) return;
        Tm tm = p.getTm();

        String source = limpiar(segmento.getTextoOriginal());
        String target = limpiar(segmento.getTextoTraducido());
        if (source.isEmpty() || target.isEmpty()) return;

        String origen = mismoSentido(tm, p) ? source : target;
        String destino = mismoSentido(tm, p) ? target : source;

        // if (tuRepo.existsByTmIdAndOrigenAndDestino(tm.getId(), origen, destino)) return;
        Tu existente = buscarEquivalente(tm.getId(), origen, destino, null);
        if (existente != null) {
            Tu yaEnlazada = segmento.getTuId();
            boolean mismaUt = yaEnlazada != null && Objects.equals(yaEnlazada.getId(), existente.getId());
            if (!mismaUt) { // al volver a revisar el mismo segmento no se cuenta otra vez
                existente.setUsoCount(usos(existente) + 1);
                tuRepo.save(existente);
            }
            segmento.setTuId(existente);
            return;
        }

        Tu tu = new Tu();
        tu.setTm(tm);
        tu.setOrigen(origen);
        tu.setDestino(destino);
        tu.setUsoCount(0);
        tu.setUltimaActualizacion(LocalDateTime.now());
        tuRepo.save(tu); 
        
        segmento.setTuId(tu);
    }

    // // Coincidencias al 100% TODO: Cambiar al 70%
    // @Transactional(readOnly = true)
    // public List<TmMatchDTO> buscarCoincidencias(Integer segmentoId){
    //     Segmento segmento = segmentoRepo.findById(segmentoId)
    //         .orElseThrow(() -> new RuntimeException("Segmento not found with id: " + segmentoId));
        
    //     Proyecto p = segmento.getProyecto();
    //     List<TmMatchDTO> resultado = new ArrayList<>();
    //     if (p== null || p.getTm() == null) return resultado;
    //     Tm tm = p.getTm();

    //     String texto = limpiar(segmento.getTextoOriginal());
    //     if (texto.isEmpty()) return resultado;

    //     if (mismoSentido(tm, p)){
    //         for (Tu tu : tuRepo.findByTmIdAndOrigen(tm.getId(), texto)){
    //             resultado.add(new TmMatchDTO(tu.getId(), tu.getOrigen(), tu.getDestino()));
    //         }
    //     } else {
    //         for (Tu tu : tuRepo.findByTmIdAndDestino(tm.getId(), texto)){
    //             resultado.add(new TmMatchDTO(tu.getId(), tu.getOrigen(), tu.getDestino()));
    //         }
    //     }
    //     return resultado;
    // }

    // #endregion Level 1

    // #region Level 2
    public static final int UMBRAL_POR_DEFECTO = 70;
    public static final int UMBRAL_MINIMO = 50;
    public static final int MAX_RESULTADOS = 10;

    private int usos(Tu tu){
        return tu.getUsoCount() == null ? 0 : tu.getUsoCount();
    }

    private Tu buscarEquivalente(Integer tmId, String origen, String destino, Integer excluirId){
        String o = TmText.normalizar(origen);
        String d = TmText.normalizar(destino);
        for (Tu t : tuRepo.findByTmId(tmId)){
            if (excluirId != null && Objects.equals(t.getId(), excluirId)) continue;
            if (TmText.normalizar(t.getOrigen()).equals(o) && TmText.normalizar(t.getDestino()).equals(d)) return t;
        }
        return null;
    }

    private record Candidato(TmMatchDTO dto, Tu tu) {}

    @Transactional(readOnly = true)
    public List<TmMatchDTO> buscarCoincidencias(Integer segmentoId){
        return buscarCoincidencias(segmentoId, UMBRAL_POR_DEFECTO);
    }

    @Transactional(readOnly = true)
    public List<TmMatchDTO> buscarCoincidencias(Integer segmentoId, Integer umbralPct){
        Segmento segmento = segmentoRepo.findById(segmentoId)
            .orElseThrow(() -> new RuntimeException("Segmento not found with id: " + segmentoId));
 
        Proyecto p = segmento.getProyecto();
        if (p == null || p.getTm() == null) return new ArrayList<>();
        Tm tm = p.getTm();
 
        String texto = limpiar(segmento.getTextoOriginal());
        if (texto.isEmpty()) return new ArrayList<>();
 
        int umbral = umbralPct == null ? UMBRAL_POR_DEFECTO
            : Math.max(UMBRAL_MINIMO, Math.min(100, umbralPct));
 
        boolean directo = mismoSentido(tm, p);
        List<TmText.Token> segTokens = TmText.tokenizar(texto);
        List<String> segClaves = TmText.clavesFuzzy(segTokens);
        String segNormalizado = TmText.normalizar(texto);
        var segPlaceables = TmText.placeables(segTokens);
 
        List<Candidato> candidatos = new ArrayList<>();
 
        for (Tu tu : tuRepo.findByTmId(tm.getId())) {
            // Orientamos la UT al sentido del proyecto
            String utSource = directo ? tu.getOrigen() : tu.getDestino();
            String utTarget = directo ? tu.getDestino() : tu.getOrigen();
            if (utSource == null || utTarget == null || utSource.isBlank()) continue;
 
            List<TmText.Token> utTokens = TmText.tokenizar(utSource);
            List<String> utClaves = TmText.clavesFuzzy(utTokens);
 
            int max = Math.max(segClaves.size(), utClaves.size());
            if (max == 0) continue;
 
            // Descarte rápido por longitud: no puede llegar al umbral
            double maxDist = max * (1 - umbral / 100.0);
            if (Math.abs(segClaves.size() - utClaves.size()) > maxDist) continue;
 
            int dist = TmText.distancia(utClaves, segClaves);
            int pct = (int) Math.floor(100.0 * (max - dist) / max);
 
            // Solo difiere en mayúsculas/minúsculas → nunca 100 %
            if (pct == 100 && !TmText.normalizar(utSource).equals(segNormalizado)) pct = 99;
            if (pct < umbral) continue;
 
            TmText.Adaptacion adap = TmText.adaptar(segTokens, utTokens, utTarget);
            boolean mismosPlaceables = TmText.placeables(utTokens).equals(segPlaceables);
 
            String tipo;
            if (pct == 100) tipo = mismosPlaceables ? "EXACT" : "PLACEABLES";
            else tipo = "FUZZY";
 
            candidatos.add(new Candidato(new TmMatchDTO(
                tu.getId(),
                utSource,
                adap.texto(),
                utTarget,
                pct,
                tipo,
                adap.cambiado(),
                adap.aviso(),
                usos(tu),
                tu.getUltimaActualizacion(),
                TmText.diff(utTokens, segTokens)
            ), tu));
        }
 
        Comparator<Candidato> orden = Comparator
            .comparingInt((Candidato c) -> c.dto().getMatchPercentage()).reversed()
            .thenComparing((Candidato c) -> c.dto().getUltimaActualizacion(),
                Comparator.nullsLast(Comparator.reverseOrder()))
            .thenComparing((Candidato c) -> c.dto().getUsoCount(), Comparator.reverseOrder());
 
        candidatos.sort(orden);
 
        List<TmMatchDTO> resultado = new ArrayList<>();
        for (Candidato c : candidatos) {
            if (resultado.size() >= MAX_RESULTADOS) break;
            resultado.add(c.dto());
        }
        return resultado;
    }
    // //#endregion Level 2

}
