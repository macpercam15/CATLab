package org.springframework.macpercam.CATLab.tm;

import org.springframework.beans.factory.annotation.Autowired;
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

}
