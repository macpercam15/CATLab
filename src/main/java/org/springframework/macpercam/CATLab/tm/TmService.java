package org.springframework.macpercam.CATLab.tm;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.macpercam.CATLab.estudiante.Estudiante;
import org.springframework.macpercam.CATLab.estudiante.EstudianteRepository;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.macpercam.CATLab.proyecto.Proyecto;
import org.springframework.macpercam.CATLab.proyecto.ProyectoRepository;
import org.springframework.macpercam.CATLab.proyecto.ProyectoService;
import org.springframework.macpercam.CATLab.proyecto.idioma.Idioma;
import org.springframework.macpercam.CATLab.proyecto.idioma.IdiomaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service 
public class TmService {

    private TmRepository tmrepo;
    private TuRepository tuRepo;
    private ProyectoRepository proyectoRepo;
    private IdiomaRepository idiomaRepo;
    private ProyectoService proyectoService;
    private EstudianteRepository estudianteRepo;

    @Autowired 
    public TmService(TmRepository tmrepo, ProyectoRepository proyectoRepo, TuRepository tuRepo,
        IdiomaRepository idiomaRepo, ProyectoService proyectoService, EstudianteRepository estudianteRepo) {
        this.tmrepo = tmrepo;
        this.proyectoRepo = proyectoRepo;
        this.tuRepo = tuRepo;
        this.idiomaRepo = idiomaRepo;
        this.proyectoService = proyectoService;
        this.estudianteRepo = estudianteRepo;
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
    public List<Tu> getTusByTmId(Integer tmId) {
        Tm tm = tmrepo.findById(tmId).orElseThrow(() -> new RuntimeException("TM not found with id: " + tmId));
        List<Tu> tus = tuRepo.findByTmId(tm.getId());
        return tus;
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
        
        List<Proyecto> proyectos = proyectoService.findProjectsByTmId(id);
        if (!proyectos.isEmpty()) {
            throw new RuntimeException("Cannot delete TM with id: " + id + " because it is associated with existing projects.");
        }
        List<Tu> tus = getTusByTmId(id);
        for (Tu tu : tus) {
            tuRepo.delete(tu);
        }
        tmrepo.delete(tm);
    }
    // #endregion CRUD

}
