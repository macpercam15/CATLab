package org.springframework.macpercam.CATLab.glosario;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/glosarios")
@SecurityRequirement(name = "bearerAuth")
public class GlosarioRestController {

    private final GlosarioService glosarioService;

    public GlosarioRestController(GlosarioService glosarioService) {
        this.glosarioService = glosarioService;
    }

    @GetMapping()
    public Iterable<Glosario> getAllGlosarios() {
        return glosarioService.getAllGlosarios();
    }

    @GetMapping(value = "/{id}")
    public Glosario getGlosarioById(@PathVariable("id") int id) {
        return glosarioService.getGlosarioById(id);
    }

    @PostMapping(value = "/create")
    public Glosario createGlosario() {
        return glosarioService.createGlosario();
    }

    @PostMapping(value = "/delete/{id}")
    public void deleteGlosario(@PathVariable("id") int id) {
        glosarioService.deleteGlosario(id);
    }

}
