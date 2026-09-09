package org.springframework.macpercam.CATLab.segmento;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PutMapping("/marcarTraducido/{segmentoId}")
    public Segmento marcarTraducido(@PathVariable Integer segmentoId) {
        return segmentoService.marcarTraducido(segmentoId);
    }

    @PutMapping("/marcarRevisado/{segmentoId}")
    public Segmento marcarRevisado(@PathVariable Integer segmentoId) {
        return segmentoService.marcarRevisado(segmentoId);
    }

    @PutMapping("/marcarCorregido/{segmentoId}")
    public Segmento marcarCorregido(@PathVariable Integer segmentoId) {
        return segmentoService.marcarCorregido(segmentoId);
    }

    @PutMapping("/volverAPublicado/{segmentoId}")
    public Segmento volverAPublicado(@PathVariable Integer segmentoId) {
        return segmentoService.volverAPublicado(segmentoId);
    }

    @PutMapping("/marcarBorrador/{segmentoId}")
    public Segmento marcarBorrador(@PathVariable Integer segmentoId) {
        return segmentoService.marcarBorrador(segmentoId);
    }

    @PutMapping("/traducir/{segmentoId}")
    public Segmento traducir(@PathVariable Integer segmentoId, @RequestBody String textoTraducido) {
        
        System.out.println("CONTROLLER RECIBE: [" + textoTraducido + "]");

        return segmentoService.actualizarTraduccion(segmentoId, textoTraducido);
    }

    @PutMapping("/feedback/{segmentoId}")
    public Segmento actualizarFeedback(@PathVariable Integer segmentoId, @RequestBody String feedback) {
        return segmentoService.actualizarFeedback(segmentoId, feedback);
    }

}
