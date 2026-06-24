package org.springframework.macpercam.CATLab.glosario;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class GlosarioService {

    private EntradaGlosarioRepository entradaRepo;
    private GlosarioRepository glosarioRepo;

    @Autowired
    public GlosarioService(EntradaGlosarioRepository entradaGlosarioRp, GlosarioRepository glosarioRp) {
        this.entradaRepo = entradaGlosarioRp;
        this.glosarioRepo = glosarioRp;
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

}
