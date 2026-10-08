package org.springframework.macpercam.CATLab.proyecto;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.macpercam.CATLab.estudiante.Estudiante;
import org.springframework.macpercam.CATLab.estudiante.EstudianteRepository;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.macpercam.CATLab.glosario.Glosario;
import org.springframework.macpercam.CATLab.glosario.GlosarioRepository;
import org.springframework.macpercam.CATLab.proyecto.idioma.Idioma;
import org.springframework.macpercam.CATLab.proyecto.idioma.IdiomaRepository;
import org.springframework.macpercam.CATLab.segmento.EstadoSegmento;
import org.springframework.macpercam.CATLab.segmento.Segmento;
import org.springframework.macpercam.CATLab.segmento.SegmentoRepository;
import org.springframework.macpercam.CATLab.segmento.SegmentoService;
import org.springframework.macpercam.CATLab.tm.Tm;
import org.springframework.macpercam.CATLab.tm.TmRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


@Service
public class ProyectoService {

    private ProyectoRepository proyectoRp;
    private IdiomaRepository idiomaRp;
    private EstudianteRepository estudianteRp;
    private GlosarioRepository glosarioRp;
    private SegmentoService segmentoService;
    private SegmentoRepository segmentoRepository;
    private TmRepository tmRepository;

    @Autowired
    public ProyectoService(ProyectoRepository proyectoRp, IdiomaRepository idiomaRp, EstudianteRepository estudianteRp, 
            GlosarioRepository glosarioRp, SegmentoService segmentoService, 
            SegmentoRepository segmentoRepository, TmRepository tmRepository) {
        this.proyectoRp = proyectoRp;
        this.idiomaRp = idiomaRp;
        this.estudianteRp = estudianteRp;
        this.glosarioRp = glosarioRp;
        this.segmentoService = segmentoService;
        this.segmentoRepository = segmentoRepository;
        this.tmRepository = tmRepository;
    }

    // #region CRUD
    @Transactional(readOnly = true)
    public List<Proyecto> findAll(){
        return (List<Proyecto>) proyectoRp.findAll();
    }

    @Transactional(readOnly = true)
    public Proyecto findById(Integer id){
        return proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
    }

    @Transactional(readOnly = true)
    public List<Proyecto> findProjectsByUserId(Integer userId){
        Estudiante estudiante = estudianteRp.findByUser(userId).orElseThrow(() -> new ResourceNotFoundException("Estudiante", "userId", userId));
        List<Proyecto> proyectos = new ArrayList<>(estudiante.getProyectos());
        return proyectos;
    }

    public List<Proyecto> findProjectsByTmId(Integer tmId) {
        Tm tm = tmRepository.findById(tmId).orElseThrow(() -> new ResourceNotFoundException("Tm", "ID", tmId));
        List<Proyecto> proyectos = proyectoRp.findByTmId(tm.getId());
        return proyectos;
    }

    @Transactional()
    public Proyecto save(SaveProyectoDTO proyecto, MultipartFile file, String username) throws IOException{
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Debe adjuntar un archivo PDF para crear el proyecto.");
        }

        String mimeType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        String nombreArchivo = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        boolean esPdf = mimeType.equals("application/pdf") || nombreArchivo.endsWith(".pdf");
        if (!esPdf) {
            throw new IllegalArgumentException("Solo se admiten archivos PDF.");
        }

        Proyecto p = new Proyecto();
        p.setEstado(EstadoProyecto.BORRADOR);
        p.setName(proyecto.getName());
        Idioma idiomaOrigen = idiomaRp.findById(proyecto.getIdiomaOrigen_id()).orElseThrow(() -> new ResourceNotFoundException("Idioma", "ID", proyecto.getIdiomaOrigen_id()));
        Idioma idiomaDestino = idiomaRp.findById(proyecto.getIdiomaDestino_id()).orElseThrow(() -> new ResourceNotFoundException("Idioma", "ID", proyecto.getIdiomaDestino_id()));
        p.setIdiomaOrigen(idiomaOrigen);
        p.setIdiomaDestino(idiomaDestino);
        
        Tm tm = tmRepository.findById(proyecto.getTm_id()).orElseThrow(() -> new ResourceNotFoundException("Tm", "ID", proyecto.getTm_id()));
        if (!(
            (tm.getIdiomaA().getId().equals(idiomaOrigen.getId())) &&
            tm.getIdiomaB().getId().equals(idiomaDestino.getId())
            ||
            (tm.getIdiomaA().getId().equals(idiomaDestino.getId()) &&
            tm.getIdiomaB().getId().equals(idiomaOrigen.getId()))
        )) {
            throw new IllegalArgumentException(
                "TM must be compatible with the project's source and target languages."
            );
        }
        p.setTm(tm);

        Glosario g = new Glosario();
        glosarioRp.save(g);
        p.setGlosario(g);

        Estudiante actual = estudianteRp.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Estudiante", "username", username));
        Set<Estudiante> estudiantes = new HashSet<>();
        estudiantes.add(actual);
        p.setEstudiantes(estudiantes);

        Path carpeta = Paths.get("uploads");
        if (!Files.exists(carpeta)) {
            Files.createDirectories(carpeta);
        }

        String nombreAlmacenado = UUID.randomUUID() + ".pdf";
        Path ruta = carpeta.resolve(nombreAlmacenado);
        Files.copy(file.getInputStream(), ruta);

        Documento doc = new Documento();
        doc.setNombreOriginal(file.getOriginalFilename());
        doc.setNombreAlmacenado(nombreAlmacenado);
        doc.setRuta("uploads/" + nombreAlmacenado);
        doc.setTipoMime("application/pdf");
        doc.setTamanyo(file.getSize());

        doc.setProyecto(p);
        p.setDocumento(doc);

        Proyecto proyectoGuardado = proyectoRp.save(p);

        try {
            segmentoService.generarSegmentos(file, proyectoGuardado);   
        }catch (Exception e) {
            throw new RuntimeException("Error al generar los segmentos del proyecto: " + e.getMessage(), e);
        }

        List<Segmento> segmentos = segmentoService.findByProyectoId(proyectoGuardado.getId());
        if(segmentos.isEmpty()) {
            throw new RuntimeException("No se encontraron segmentos para el proyecto.");
        }

        return proyectoGuardado;
    }

    @Transactional()
    public void delete(Integer id){
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        if (p.getEstado() == EstadoProyecto.PUBLICADO) {
            throw new IllegalStateException("No se puede eliminar un proyecto que ya ha sido publicado.");
        }
        List<Segmento> segmentos = segmentoService.findByProyectoId(id);
        segmentoRepository.deleteAll(segmentos);    
        proyectoRp.delete(p);
    }

    @Transactional()
    public Proyecto update(Integer id, UpdateProyectoDTO proyecto) {
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        if (p.getEstado() == EstadoProyecto.PUBLICADO  || p.getEstado() == EstadoProyecto.CORREGIDO) {
            throw new IllegalStateException("Published projects cannot be edited.");
        }
        
        p.setName(proyecto.getName());

        Tm tm = tmRepository.findById(proyecto.getTm_id()).orElseThrow(() -> new ResourceNotFoundException("Tm", "ID", proyecto.getTm_id()));
        if (!(
            (tm.getIdiomaA().getId() == p.getIdiomaOrigen().getId() &&
            tm.getIdiomaB().getId() == p.getIdiomaDestino().getId())
            ||
            (tm.getIdiomaA().getId() == p.getIdiomaDestino().getId() &&
            tm.getIdiomaB().getId() == p.getIdiomaOrigen().getId())
        )) {
            throw new IllegalArgumentException(
                "TM must be compatible with the project's source and target languages."
            );
        }
        p.setTm(tm);

        return proyectoRp.save(p);
    }

    // #endregion CRUD


    // #region FLUJO DE ESTADOS

    
    private boolean esColaborativo(Proyecto p) {
        return p.getEstudiantes() != null && p.getEstudiantes().size() > 1;
    }

    @Transactional()
    public Proyecto publicarProyecto(Integer id) {
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        if (esColaborativo(p)) {
            // TODO: Implementar la lógica para publicar proyectos colaborativos
            throw new UnsupportedOperationException("La publicación de proyectos colaborativos aún no está implementada.");
        }
        else {
            return publicarIndividual(id);
        }
    }

    @Transactional()
    public Proyecto publicarIndividual(Integer id) {
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        
        if (p.getEstado() != EstadoProyecto.BORRADOR) {
            throw new IllegalStateException("Solo se pueden publicar proyectos en estado BORRADOR.");
        }
        List<Segmento> segmentos = segmentoService.findByProyectoId(id);
        if (!segmentos.stream().allMatch(s -> s.getEstado() == EstadoSegmento.REVISADO)){
            throw new IllegalStateException("Projects must have all segments revised before publishing    .");
        }
        
        p.setEstado(EstadoProyecto.PUBLICADO);
        segmentos.stream().forEach(s -> {s.setEstado(EstadoSegmento.PUBLICADO);});

        return proyectoRp.save(p);
    }
    @Transactional()
    // TODO: hay que revisar esto mejor, lo mismo es mejor comprobar más cosas aparte del estado
    public /*Proyecto*/ String publicarColaborativo(Integer id) {
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        if (p.getEstado() != EstadoProyecto.ACEPTADO) {
            throw new IllegalStateException("Solo se pueden publicar proyectos colaborativos en estado ACEPTADO.");
        }
        p.setEstado(EstadoProyecto.PUBLICADO);
        //return proyectoRp.save(p);
        return "No se ha implementado proyectos colaborativos.";
    }

    @Transactional()
    public Proyecto reeditarProyecto(Integer id) {
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        if (p.getEstado() != EstadoProyecto.CORREGIDO) {
            throw new IllegalStateException("Solo se pueden reeditar proyectos en estado CORREGIDO.");
        }
        p.setEstado(EstadoProyecto.BORRADOR);
        List<Segmento> segmentos = segmentoService.findByProyectoId(id);
        segmentos.stream().forEach(s -> {s.setEstado(EstadoSegmento.BORRADOR);});

        return proyectoRp.save(p);
    }
    // #endregion FLUJO DE ESTADOS

    // #region  PROFESORES

    @Transactional(readOnly = true)
    public List<Proyecto> getProyectosProfesor(){
        return ((List<Proyecto>)proyectoRp.findAll()).stream().filter(p-> p.getEstado()
            == EstadoProyecto.PUBLICADO || p.getEstado() == EstadoProyecto.ACEPTADO || p.getEstado() == EstadoProyecto.CORREGIDO) .toList();
    }

    @Transactional()
    public Proyecto marcarCorregido(Integer id){
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> 
            new ResourceNotFoundException("Proyecto", "ID", id));
        
            if (p.getEstado() != EstadoProyecto.PUBLICADO){
            throw new IllegalStateException("Solo se pueden marcar como corregidos proyectos en estado PUBLICADO.");
        }
        List<Segmento> segmentos = segmentoService.findByProyectoId(id);
        if (!segmentos.stream().allMatch(s -> s.getEstado() == EstadoSegmento.CORREGIDO)){
            throw new IllegalStateException("Proyects must have all segments in state GRADED.");
        }

        p.setEstado(EstadoProyecto.CORREGIDO);
        
        return proyectoRp.save(p);
    }

    @Transactional()
    public Proyecto cancelarCorregido(Integer id){
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> 
            new ResourceNotFoundException("Proyecto", "ID", id));
        if (p.getEstado() != EstadoProyecto.CORREGIDO){
            throw new IllegalStateException("Solo se pueden cancelar proyectos en estado CORREGIDO.");
        }
        p.setEstado(EstadoProyecto.PUBLICADO);
        return proyectoRp.save(p);
    }

    // #endregion  PROFESORES

    // #region IDIOMA
    @Transactional(readOnly = true)
    public List<Idioma> findAllIdiomas() {
        return (List<Idioma>) idiomaRp.findAll();
    }

    @Transactional(readOnly = true)
    public Idioma findIdiomaById(Integer id) {
        return idiomaRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Idioma", "ID", id));
    }

    @Transactional(readOnly = true)
    public List<Idioma> findIdiomasProyecto(Integer proyectoId) {
        Proyecto p = proyectoRp.findById(proyectoId).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", proyectoId));
        List<Idioma> idiomas = new ArrayList<>();
        idiomas.add(p.getIdiomaOrigen());
        idiomas.add(p.getIdiomaDestino());
        return idiomas;
    }

    // #endregion IDIOMA


}
