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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


@Service
public class ProyectoService {

    private ProyectoRepository proyectoRp;
    private IdiomaRepository idiomaRp;
    private EstudianteRepository estudianteRp;
    private GlosarioRepository glosarioRp;

    @Autowired
    public ProyectoService(ProyectoRepository proyectoRp, IdiomaRepository idiomaRp, EstudianteRepository estudianteRp, GlosarioRepository glosarioRp) {
        this.proyectoRp = proyectoRp;
        this.idiomaRp = idiomaRp;
        this.estudianteRp = estudianteRp;
        this.glosarioRp = glosarioRp;
    }

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
        // p.setTm(proyecto.getTM());

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

        return proyectoRp.save(p);
    }

    @Transactional()
    public void delete(Integer id){
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        proyectoRp.delete(p);
    }

    @Transactional()
    public Proyecto update(Integer id, UpdateProyectoDTO proyecto) {
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        p.setName(proyecto.getName());
        // p.setTm(proyecto.getTM());
        return proyectoRp.save(p);
    }

    public List<Idioma> findIdiomasProyecto(Integer proyectoId) {
        Proyecto p = proyectoRp.findById(proyectoId).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", proyectoId));
        List<Idioma> idiomas = new ArrayList<>();
        idiomas.add(p.getIdiomaOrigen());
        idiomas.add(p.getIdiomaDestino());
        return idiomas;
    }

    private boolean esColaborativo(Proyecto p) {
        return p.getEstudiantes() != null && p.getEstudiantes().size() > 1;
    }

    public Proyecto publicarProyecto(Integer id) {
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        if (esColaborativo(p)) {
            // TODO: Implementar la lógica para publicar proyectos colaborativos
            //return publicarColaborativo(id);
            return p;
        }
        else {
            return publicarIndividual(id);
        }
    }

    public Proyecto publicarIndividual(Integer id) {
        Proyecto p = proyectoRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto", "ID", id));
        if (p.getEstado() != EstadoProyecto.BORRADOR) {
            throw new IllegalStateException("Solo se pueden publicar proyectos en estado BORRADOR.");
        }
        // TODO: Verificar que todos los segmentos están en revisados antes de traducir.
        p.setEstado(EstadoProyecto.PUBLICADO);
        return proyectoRp.save(p);
    }

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

    //Section: Idioma

    public List<Idioma> findAllIdiomas() {
        return (List<Idioma>) idiomaRp.findAll();
    }

    public Idioma findIdiomaById(Integer id) {
        return idiomaRp.findById(id).orElseThrow(() -> new ResourceNotFoundException("Idioma", "ID", id));
    }


}
