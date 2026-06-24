package org.springframework.macpercam.CATLab.glosario;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/entradas")
@SecurityRequirement(name = "bearerAuth")
public class EntradaGlosarioRestController {

    private final GlosarioService glosarioService;

    @Autowired
    public EntradaGlosarioRestController(GlosarioService glosarioService) {
        this.glosarioService = glosarioService;
    }

    @GetMapping(value = "/glosario/{glosarioId}")
    public List<EntradaGlosario> getAllEntradasByGlosarioId(@PathVariable("glosarioId") int glosarioId) {
        return glosarioService.getAllEntradasByGlosarioId(glosarioId);
    }

    @GetMapping(value = "/{id}")
    public EntradaGlosario getEntradaById(@PathVariable("id") int id) {
        return glosarioService.getEntradaById(id);
    }

    @PostMapping(value = "/create")
    public EntradaGlosario createEntrada(@RequestBody SaveEntradaDTO entrada) {
        return glosarioService.createEntrada(entrada);
    }

    @PutMapping(value = "/update/{id}")
    public EntradaGlosario updateEntrada(@PathVariable("id") int id, @RequestBody UpdateEntradaDTO entrada) {
        return glosarioService.updateEntrada(id, entrada);
    }

    @PostMapping(value = "/delete/{id}")
    public void deleteEntrada(@PathVariable("id") int id) {
        glosarioService.deleteEntrada(id);
    }

}
