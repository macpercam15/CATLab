package org.springframework.macpercam.CATLab.tm;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import io.swagger.v3.oas.annotations.Parameter;
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

    // #region CRUD - TMs
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


    @GetMapping ("/student/{userId}")
    public List<Tm> getTmsByStudentId(@PathVariable Integer userId) {
        return tmService.getTmsByUserId(userId);
    }

    @PostMapping ("/new")
    public Tm createTm(@RequestBody CreateTmDTO tm, 
        @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails){
        return tmService.createTm(tm, userDetails.getUsername());
    }

    @PutMapping ("/edit/{id}")
    public Tm editTm(@PathVariable Integer id, @RequestBody EditTMDTO tm) {
        return tmService.editTm(id, tm);
    }

    @PostMapping ("delete/{id}")
    public void deleteTm(@PathVariable Integer id) {
        tmService.deleteTm(id);
    }

    // #endregion CRUD - TMs
    // #region CRUD - TUs
    @GetMapping ("/{tmId}/tus")
    public List<Tu> getTusByTmId(@PathVariable Integer tmId) {
        return tmService.getTusByTmId(tmId);
    }
    @PutMapping ("/tu/edit/{tuId}")
    public Tu editTu(@PathVariable Integer tuId, @RequestBody EditTuDTO tu) {
        return tmService.editTu(tuId, tu);
    }

    @PostMapping ("/tu/delete/{tuId}")
    public void deleteTu(@PathVariable Integer tuId) {
        tmService.deleteTu(tuId);
    }

    @PostMapping ("/tu/create/{tmId}")
    public Tu createTu(@PathVariable Integer tmId, @RequestBody EditTuDTO tu) {
        return tmService.createTu(tmId, tu);
    }
    // #endregion CRUD - TUs

    // #region match
    @GetMapping ("/segmento/{segmentoId}/matches")
    public List<TmMatchDTO> getMatchesForSegmento(@PathVariable Integer segmentoId) {
        return tmService.buscarCoincidencias(segmentoId);
    }
    // #endregion match

}
