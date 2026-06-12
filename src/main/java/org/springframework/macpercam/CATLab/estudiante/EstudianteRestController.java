package org.springframework.macpercam.CATLab.estudiante;

import java.net.URISyntaxException;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.macpercam.CATLab.auth.payload.response.MessageResponse;
import org.springframework.macpercam.CATLab.user.Authorities;
import org.springframework.macpercam.CATLab.user.User;
import org.springframework.macpercam.CATLab.user.UserService;
import org.springframework.macpercam.CATLab.util.RestPreconditions;
import org.springframework.macpercam.CATLab.user.AuthoritiesService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/estudiantes")
@SecurityRequirement(name = "bearerAuth")
public class EstudianteRestController {

    private final EstudianteService estudianteService;
	private final UserService userService;
    private final AuthoritiesService authoritiesService;   

	@Autowired
	public EstudianteRestController(EstudianteService estudianteService, UserService userService, AuthoritiesService authoritiesService) {
		this.estudianteService = estudianteService;
		this.userService = userService;
		this.authoritiesService = authoritiesService;
	}

	@GetMapping
	public ResponseEntity<List<Estudiante>> findAll() {
		return new ResponseEntity<>((List<Estudiante>) estudianteService.findAll(), HttpStatus.OK);
	}

	@GetMapping(value = "{estudianteId}")
	public ResponseEntity<Estudiante> findById(@PathVariable("estudianteId") int id) {
		return new ResponseEntity<>(estudianteService.findEstudianteById(id), HttpStatus.OK);
	}

	@GetMapping(value = "/user/{userId}")
	public ResponseEntity<Estudiante> findByUserId(@PathVariable("userId") int userId) {
		return new ResponseEntity<>(estudianteService.findEstudianteByUserId(userId), HttpStatus.OK);
	}

}
