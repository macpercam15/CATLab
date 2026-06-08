package org.springframework.macpercam.CATLab.administrador;

import java.net.URISyntaxException;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.macpercam.CATLab.auth.payload.response.MessageResponse;
import org.springframework.macpercam.CATLab.estudiante.Estudiante;
import org.springframework.macpercam.CATLab.user.Authorities;
import org.springframework.macpercam.CATLab.user.AuthoritiesService;
import org.springframework.macpercam.CATLab.user.User;
import org.springframework.macpercam.CATLab.user.UserService;
import org.springframework.macpercam.CATLab.util.RestPreconditions;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/administradores")
@SecurityRequirement(name = "bearerAuth")
public class AdministradorRestController{

    private final AdministradorService administradorService;
	private final UserService userService;
    private final AuthoritiesService authoritiesService;

    @Autowired
    public AdministradorRestController(AdministradorService administradorService, UserService userService, AuthoritiesService authoritiesService) {
        this.administradorService = administradorService;   
        this.userService = userService;
        this.authoritiesService = authoritiesService;
    }
    
    
    @GetMapping
	public ResponseEntity<List<Administrador>> findAll() {
		return new ResponseEntity<>((List<Administrador>) administradorService.findAll(), HttpStatus.OK);
	}

	@GetMapping(value = "{administradorId}")
	public ResponseEntity<Administrador> findById(@PathVariable("administradorId") int id) {
		return new ResponseEntity<>(administradorService.findAdministradorById(id), HttpStatus.OK);
	}

}
