package org.springframework.macpercam.CATLab.proyecto;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.macpercam.CATLab.proyecto.idioma.Idioma;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/proyectos")
@SecurityRequirement(name = "bearerAuth")
public class ProyectoController {
    private final ProyectoService proyectoService;

    @Autowired
    public ProyectoController(ProyectoService proyectoService) {
        this.proyectoService = proyectoService;
    }

    @GetMapping
    public List<Proyecto> getAllProyectos() {
        return proyectoService.findAll();
    }

    @GetMapping(value = "/{id}")
    public Proyecto getProyectoById(@PathVariable Integer id) {
        return proyectoService.findById(id);
    }

    @PostMapping(value = "/new", consumes = {"multipart/form-data"})
    public Proyecto createProyecto(
            @RequestPart("proyecto") SaveProyectoDTO proyecto, 
            @RequestPart("file") MultipartFile file, 
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        
        return proyectoService.save(proyecto, file, userDetails.getUsername());
    }

    @PutMapping(value = "/{id}")
    public Proyecto updateProyecto(@PathVariable Integer id, @RequestBody UpdateProyectoDTO proyecto) {
        return proyectoService.update(id, proyecto);
    }

    @GetMapping(value = "/idiomas")
    public List<Idioma> getAllIdiomas() {
        return proyectoService.findAllIdiomas();
    }

    @GetMapping(value = "/idiomas/{id}")
    public Idioma getIdiomaById(@PathVariable Integer id) {
        return proyectoService.findIdiomaById(id);
    }

    @GetMapping(value = "/{id}/idiomas")
    public List<Idioma> getIdiomasByProyectoId(@PathVariable Integer id) {
        return proyectoService.findIdiomasProyecto(id);
    }
}
