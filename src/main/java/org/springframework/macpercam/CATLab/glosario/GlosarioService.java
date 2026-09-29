package org.springframework.macpercam.CATLab.glosario;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.macpercam.CATLab.segmento.Segmento;
import org.springframework.macpercam.CATLab.segmento.SegmentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class GlosarioService {

    private EntradaGlosarioRepository entradaRepo;
    private GlosarioRepository glosarioRepo;
    private SegmentoRepository segmentoRepo;

    @Autowired
    public GlosarioService(EntradaGlosarioRepository entradaGlosarioRp, GlosarioRepository glosarioRp, SegmentoRepository segmentoRepo) {
        this.entradaRepo = entradaGlosarioRp;
        this.glosarioRepo = glosarioRp;
        this.segmentoRepo = segmentoRepo;
    }

    @Transactional(readOnly = true)
    public List<EntradaGlosario> getAllEntradasByGlosarioId(int glosarioId){
        Glosario glosario = glosarioRepo.findById(glosarioId).orElseThrow(() -> new ResourceNotFoundException("Glosario", "ID", glosarioId));
        List<EntradaGlosario> entradas = entradaRepo.getAllEntradasByGlosarioId(glosario.getId());
        return entradas;
    }

    @Transactional(readOnly = true)
    public EntradaGlosario getEntradaById(int id){
        return entradaRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("EntradaGlosario", "ID", id));
    }

    @Transactional()
    public EntradaGlosario createEntrada(SaveEntradaDTO data) throws DataAccessException{
        EntradaGlosario entrada = new EntradaGlosario();
        entrada.setOrigen(data.getOrigen());
        entrada.setDestino(data.getDestino());

        Glosario gl = glosarioRepo.findById(data.getGlosarioId()).orElseThrow(() -> new ResourceNotFoundException("Glosario", "ID", data.getGlosarioId()));
        entrada.setGlosario(gl);

        entradaRepo.save(entrada);
        return entrada;
    }

    @Transactional()
    public EntradaGlosario updateEntrada(int id, UpdateEntradaDTO data) throws DataAccessException{
        EntradaGlosario entrada = entradaRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("EntradaGlosario", "ID", id));
        entrada.setOrigen(data.getOrigen());
        entrada.setDestino(data.getDestino());

        entradaRepo.save(entrada);
        return entrada;
    }

    @Transactional()
    public void deleteEntrada(int id) throws DataAccessException{
        EntradaGlosario entrada = entradaRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("EntradaGlosario", "ID", id));
        entradaRepo.delete(entrada);
    }

    @Transactional(readOnly = true)
    public Iterable<Glosario> getAllGlosarios() {
        return glosarioRepo.findAll();
    }

    @Transactional(readOnly = true)
    public Glosario getGlosarioById(int id) {
        return glosarioRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Glosario", "ID", id));
    }

    @Transactional()
    public Glosario createGlosario() {
        Glosario glosario = new Glosario();
        return glosarioRepo.save(glosario);
    }

    @Transactional()
    public void deleteGlosario(int id) {
        Glosario glosario = glosarioRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Glosario", "ID", id));
        glosarioRepo.delete(glosario);
    }

    @Transactional(readOnly = true)
    public List<EntradaGlosario> getCoincidenciasBySegmentoId(int segmentoId) {
        Segmento s = segmentoRepo.findById(segmentoId).orElseThrow(() -> new ResourceNotFoundException("Segmento", "ID", segmentoId));
        Glosario g = s.getProyecto().getGlosario();
        String texto = s.getTextoOriginal();
        if (g == null || texto == null || texto.isEmpty()) {
            return List.of();
        }

        return entradaRepo.getAllEntradasByGlosarioId(g.getId()).stream()
            .filter(e -> e.getOrigen() != null && !e.getOrigen().isBlank())
            .filter(e -> {
                Pattern p = Pattern.compile(
                        "(?<![\\p{L}\\p{N}])" + Pattern.quote(e.getOrigen().trim()) + "(?![\\p{L}\\p{N}])",
                        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
                return p.matcher(texto).find();
            })
            .toList();
    }

}
