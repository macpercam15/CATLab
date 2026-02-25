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
import org.springframework.web.bind.annotation.PutMapping;
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

	@PostMapping()
	@ResponseStatus(HttpStatus.CREATED)
	public ResponseEntity<Estudiante> create(@RequestBody @Valid Estudiante estudiante) throws URISyntaxException {
		Estudiante newEstudiante = new Estudiante();
		BeanUtils.copyProperties(estudiante, newEstudiante, "id");
		User user = userService.findCurrentUser();
        Authorities estudianteRole = authoritiesService.findByAuthority("ESTUDIANTE");
        user.setAuthority(estudianteRole);
		newEstudiante.setUser(user);
		Estudiante savedEstudiante = this.estudianteService.saveEstudiante(newEstudiante);

		return new ResponseEntity<>(savedEstudiante, HttpStatus.CREATED);
	}

	@PutMapping(value = "{estudianteId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<Estudiante> update(@PathVariable("estudianteId") int estudianteId, @RequestBody @Valid Estudiante estudiante) {
		RestPreconditions.checkNotNull(estudianteService.findEstudianteById(estudianteId), "Estudiante", "ID", estudianteId);
		return new ResponseEntity<>(this.estudianteService.updateEstudiante(estudiante, estudianteId), HttpStatus.OK);
	}

	@DeleteMapping(value = "{estudianteId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<MessageResponse> delete(@PathVariable("estudianteId") int id) {
		RestPreconditions.checkNotNull(estudianteService.findEstudianteById(id), "Estudiante", "ID", id);
		estudianteService.deleteEstudiante(id);
		return new ResponseEntity<>(new MessageResponse("Estudiante deleted!"), HttpStatus.OK);
	}

}
