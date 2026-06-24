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
        List<EntradaGlosario> entradas = entradaRepo.getAllEntradasByGlosarioId(glosarioId);
        return entradas;
    }

    @Transactional(readOnly = true)
    public EntradaGlosario getEntradaById(int id){
        return entradaRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("EntradaGlosario", "ID", id));
    }

    @Transactional()
    public EntradaGlosario createEntrada(saveEntradaDTO entradaIn) throws DataAccessException{
        EntradaGlosario entrada = new EntradaGlosario();
        entrada.setOrigen(entradaIn.getOrigen());
        entrada.setDestino(entradaIn.getDestino());

        Glosario gl = glosarioRepo.findById(entradaIn.getGlosarioId()).orElseThrow(() -> new ResourceNotFoundException("Glosario", "ID", entradaIn.getGlosarioId()));
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

}
