/*
 * Copyright 2002-2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.macpercam.CATLab.user;

import java.util.Optional;

import jakarta.validation.Valid;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.macpercam.CATLab.administrador.Administrador;
import org.springframework.macpercam.CATLab.administrador.AdministradorService;
import org.springframework.macpercam.CATLab.estudiante.Estudiante;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.macpercam.CATLab.profesor.Profesor;
import org.springframework.macpercam.CATLab.profesor.ProfesorService;
import org.springframework.macpercam.CATLab.estudiante.EstudianteService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

	private UserRepository userRepository;
	private ProfesorService profesorService;
	private EstudianteService estudianteService;
	private AdministradorService administradorService;
	private final PasswordEncoder encoder;

	@Autowired
	public UserService(UserRepository userRepository, ProfesorService profesorService, EstudianteService estudianteService, AdministradorService administradorService, PasswordEncoder encoder) {
		this.userRepository = userRepository;
		this.profesorService = profesorService;
		this.estudianteService = estudianteService;
		this.administradorService = administradorService;
		this.encoder = encoder;
	}

	@Transactional
	public User saveUser(UserCreateRequest request){
		User user;
		user = new User();

		user.setUsername(request.getUsername());

		String rawPassword = request.getPassword();
		rawPassword = defaultPasswordForAuthority(request.getAuthority());
		user.setPassword(encoder.encode(rawPassword));

		user.setAuthority(request.getAuthority());
		userRepository.save(user);


		if (user.getAuthority() != null) {
			switch (user.getAuthority().getAuthority()) {
			case "PROFESOR":
				Profesor profesor = new Profesor();
				profesor.setFirstName(request.getName());
				profesor.setLastName(request.getSurname());
				profesor.setEmail(request.getEmail());
				profesor.setUser(user);
				profesorService.saveProfesor(profesor);
				break;
			case "ESTUDIANTE":
				Estudiante estudiante = new Estudiante();
				estudiante.setFirstName(request.getName());
				estudiante.setLastName(request.getSurname());
				estudiante.setEmail(request.getEmail());
				estudiante.setUser(user);
				estudianteService.saveEstudiante(estudiante);
				break;
			case "ADMIN":
				Administrador admin = new Administrador();
				admin.setFirstName(request.getName());
				admin.setLastName(request.getSurname());
				admin.setEmail(request.getEmail());
				admin.setUser(user);
				administradorService.saveAdministrador(admin);
				break;
			}
		}

		return user;
	}

	private String defaultPasswordForAuthority(Authorities authority) {
		if (authority == null || authority.getAuthority() == null) {
			return "";
		}
		switch (authority.getAuthority()) {
		case "ADMIN":
			return "4dm1n";
		case "PROFESOR":
			return "pr0fes0r";
		case "ESTUDIANTE":
			return "3studiante";
		default:
			return "";
		}
	}

	@Transactional(readOnly = true)
	public User findUser(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
	}

	@Transactional(readOnly = true)
	public User findUser(Integer id) {
		return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
	}

	@Transactional(readOnly = true)
	public User findCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null)
			throw new ResourceNotFoundException("Nobody authenticated!");
		else
			return userRepository.findByUsername(auth.getName())
					.orElseThrow(() -> new ResourceNotFoundException("User", "Username", auth.getName()));
	}

	public Boolean existsUser(String username) {
		return userRepository.existsByUsername(username);
	}

	@Transactional(readOnly = true)
	public Iterable<User> findAll() {
		return userRepository.findAll();
	}

	public Iterable<User> findAllByAuthority(String auth) {
		return userRepository.findAllByAuthority(auth);
	}

	@Transactional
	public User updateUser(@Valid UserUpdateRequest user, Integer idToUpdate) {
		User toUpdate = findUser(idToUpdate);

		// Username
		if (!user.getUsername().equals(toUpdate.getUsername())) {
			toUpdate.setUsername(user.getUsername());
		}

		// Password
		if (user.getPassword() != null && !user.getPassword().isBlank()) {
			// Solo si la contraseña enviada no coincide con la anterior (en caso de que el frontend envíe texto plano)
			if (!encoder.matches(user.getPassword(), toUpdate.getPassword())) {
				toUpdate.setPassword(encoder.encode(user.getPassword()));
			}
		}

		// Authority
		if (user.getAuthority() != null && !user.getAuthority().equals(toUpdate.getAuthority())) {
			toUpdate.setAuthority(user.getAuthority());
		}

		String authority = toUpdate.getAuthority().getAuthority();

		switch (authority) {
			case "ESTUDIANTE" -> {
				Estudiante rol = estudianteService.findEstudianteByUserId(toUpdate.getId());

				if (user.getName() != null
						&& !user.getName().isBlank()
						&& !user.getName().equals(rol.getFirstName())) {
					rol.setFirstName(user.getName());
				}

				if (user.getSurname() != null
						&& !user.getSurname().isBlank()
						&& !user.getSurname().equals(rol.getLastName())) {
					rol.setLastName(user.getSurname());
				}

				if (user.getEmail() != null
						&& !user.getEmail().isBlank()
						&& !user.getEmail().equals(rol.getEmail())) {
					rol.setEmail(user.getEmail());
				}

				estudianteService.saveEstudiante(rol);
			}
			case "PROFESOR" -> {
				Profesor rol = profesorService.findProfesorByUserId(toUpdate.getId());

				if (user.getName() != null
						&& !user.getName().isBlank()
						&& !user.getName().equals(rol.getFirstName())) {
					rol.setFirstName(user.getName());
				}

				if (user.getSurname() != null
						&& !user.getSurname().isBlank()
						&& !user.getSurname().equals(rol.getLastName())) {
					rol.setLastName(user.getSurname());
				}

				if (user.getEmail() != null
						&& !user.getEmail().isBlank()
						&& !user.getEmail().equals(rol.getEmail())) {
					rol.setEmail(user.getEmail());
				}

				profesorService.saveProfesor(rol);
			}

			case "ADMIN" -> {
				Administrador rol = administradorService.findAdministradorByUserId(toUpdate.getId());

				if (user.getName() != null
						&& !user.getName().isBlank()
						&& !user.getName().equals(rol.getFirstName())) {
					rol.setFirstName(user.getName());
				}

				if (user.getSurname() != null
						&& !user.getSurname().isBlank()
						&& !user.getSurname().equals(rol.getLastName())) {
					rol.setLastName(user.getSurname());
				}

				if (user.getEmail() != null
						&& !user.getEmail().isBlank()
						&& !user.getEmail().equals(rol.getEmail())) {
					rol.setEmail(user.getEmail());
				}

				administradorService.saveAdministrador(rol);
			}

		}
		return userRepository.save(toUpdate);
	}

	@Transactional
	public User updateCurrentUser(@Valid UserProfileUpdateRequest request) {
		User userToUpdate = findCurrentUser();

		if (userToUpdate.getAuthority().getAuthority().equals("ESTUDIANTE")) {
			Estudiante rolToUpdate = estudianteService.findEstudianteByUserId(userToUpdate.getId());
			rolToUpdate.setFirstName(request.getFirstName());
			rolToUpdate.setLastName(request.getLastName());
			rolToUpdate.setEmail(request.getEmail());
			estudianteService.saveEstudiante(rolToUpdate);
		} else if (userToUpdate.getAuthority().getAuthority().equals("PROFESOR")) {
			Profesor rolToUpdate = profesorService.findProfesorByUserId(userToUpdate.getId());
			rolToUpdate.setFirstName(request.getFirstName());
			rolToUpdate.setLastName(request.getLastName());
			rolToUpdate.setEmail(request.getEmail());
			profesorService.saveProfesor(rolToUpdate);
		} else if (userToUpdate.getAuthority().getAuthority().equals("ADMIN")) {
			Administrador rolToUpdate = administradorService.findAdministradorByUserId(userToUpdate.getId());
			rolToUpdate.setFirstName(request.getFirstName());
			rolToUpdate.setLastName(request.getLastName());
			rolToUpdate.setEmail(request.getEmail());
			administradorService.saveAdministrador(rolToUpdate);
		}

		if (request.getUsername() != null && !request.getUsername().isBlank()) {
			userToUpdate.setUsername(request.getUsername());
		}
		if (request.getPassword() != null && !request.getPassword().isBlank()) {
			if (!encoder.matches(request.getPassword(), userToUpdate.getPassword())) {
				userToUpdate.setPassword(encoder.encode(request.getPassword()));
			}
		}

		return userRepository.save(userToUpdate);
	}

	
	@Transactional
	public void deleteUser(Integer userId) {

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

		switch (user.getAuthority().getAuthority()) {
			case "ESTUDIANTE":
				estudianteService.deleteEstudianteByUserId(userId);
				break;

			case "PROFESOR":
				profesorService.deleteProfesorByUserId(userId);
				break;

			case "ADMIN":
				administradorService.deleteAdministradorByUser(userId);
				break;
		}

    	userRepository.delete(user);
	}

}
