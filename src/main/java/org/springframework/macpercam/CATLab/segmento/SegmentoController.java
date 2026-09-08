package org.springframework.macpercam.CATLab.segmento;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/segmentos")
@SecurityRequirement(name = "bearerAuth")
public class SegmentoController {

    private final SegmentoService segmentoService;

    @Autowired
    public SegmentoController(SegmentoService segmentoService) {
        this.segmentoService = segmentoService;
    }

    @GetMapping("/all")
    public List<Segmento> getAllSegmentos() {
        return segmentoService.findAll();
    }

    @GetMapping("/segmento/{segmentoId}")
    public Segmento getSegmentoById(@PathVariable Integer segmentoId) {
        return segmentoService.findById(segmentoId);
    }
    
    @GetMapping("/proyecto/{proyectoId}")
    public List<Segmento> getSegmentosByProyectoId(@PathVariable Integer proyectoId) {
        return segmentoService.findByProyectoId(proyectoId);
    }

}
