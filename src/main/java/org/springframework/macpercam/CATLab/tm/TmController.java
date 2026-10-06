package org.springframework.macpercam.CATLab.tm;

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
@RequestMapping ("/api/tm")
@SecurityRequirement(name = "bearerAuth")
public class TmController {

    private final TmService tmService;

    @Autowired 
    public TmController(TmService tmService) {
        this.tmService = tmService;
    }

    @GetMapping("/all") 
    public List<Tm> getAllTms() {
        return tmService.getAllTms();
    }

    @GetMapping ("/{id}")
    public Tm getTmById(@PathVariable Integer id) {
        return tmService.getTmById(id);
    }

    @GetMapping ("/project/{projectId}")
    public Tm getTmByProjectId(@PathVariable Integer projectId) {
        return tmService.getTmByProjectId(projectId);
    }

    @GetMapping ("/{tmId}/tus")
    public List<Tu> getTusByTmId(@PathVariable Integer tmId) {
        return tmService.getTusByTmId(tmId);
    }

    @GetMapping ("/student/{userId}")
    public List<Tm> getTmsByStudentId(@PathVariable Integer userId) {
        return tmService.getTmsByUserId(userId);
    }

    @PostMapping ("/new")
    public Tm createTm(@RequestBody CreateTmDTO tm) {
        return tmService.createTm(tm);
    }

    @PutMapping ("/edit/{id}")
    public Tm editTm(@PathVariable Integer id, @RequestBody EditTMDTO tm) {
        return tmService.editTm(id, tm);
    }

    @PostMapping ("delete/{id}")
    public void deleteTm(@PathVariable Integer id) {
        tmService.deleteTm(id);
    }

}
