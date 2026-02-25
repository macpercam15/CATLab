package org.springframework.macpercam.CATLab.profesor;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

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
@RequestMapping("/api/profesores")
@SecurityRequirement(name = "bearerAuth")
public class ProfesorRestController {

    private final ProfesorService profesorService;
	private final UserService userService;
    private final AuthoritiesService authoritiesService;   

	@Autowired
	public ProfesorRestController(ProfesorService profesorService, UserService userService, AuthoritiesService authoritiesService) {
		this.profesorService = profesorService;
		this.userService = userService;
		this.authoritiesService = authoritiesService;
	}

	@GetMapping
	public ResponseEntity<List<Profesor>> findAll() {
		return new ResponseEntity<>((List<Profesor>) profesorService.findAll(), HttpStatus.OK);
	}

	@GetMapping(value = "{profesorId}")
	public ResponseEntity<Profesor> findById(@PathVariable("profesorId") int id) {
		return new ResponseEntity<>(profesorService.findProfesorById(id), HttpStatus.OK);
	}

	@PostMapping()
	@ResponseStatus(HttpStatus.CREATED)
	public ResponseEntity<Profesor> create(@RequestBody @Valid Profesor profesor) throws URISyntaxException {
		Profesor newProfesor = new Profesor();
		BeanUtils.copyProperties(profesor, newProfesor, "id");
		User user = userService.findCurrentUser();
        Authorities profesorRole = authoritiesService.findByAuthority("PROFESOR");
        user.setAuthority(profesorRole);
		newProfesor.setUser(user);
		Profesor savedProfesor = this.profesorService.saveProfesor(newProfesor);

		return new ResponseEntity<>(savedProfesor, HttpStatus.CREATED);
	}

	@PutMapping(value = "{profesorId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<Profesor> update(@PathVariable("profesorId") int profesorId, @RequestBody @Valid ProfesorUpdateDTO profesor) {
		RestPreconditions.checkNotNull(profesorService.findProfesorById(profesorId), "Profesor", "ID", profesorId);
		return new ResponseEntity<>(this.profesorService.updateProfesor(profesor, profesorId), HttpStatus.OK);
	}

	@DeleteMapping(value = "{profesorId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<MessageResponse> delete(@PathVariable("profesorId") int id) {
		RestPreconditions.checkNotNull(profesorService.findProfesorById(id), "Profesor", "ID", id);
		profesorService.deleteProfesor(id);
		return new ResponseEntity<>(new MessageResponse("Profesor deleted!"), HttpStatus.OK);
	}

}
