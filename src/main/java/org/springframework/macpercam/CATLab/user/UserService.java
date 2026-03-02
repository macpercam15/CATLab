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
	private final PasswordEncoder encoder;

	@Autowired
	public UserService(UserRepository userRepository, ProfesorService profesorService, EstudianteService estudianteService, PasswordEncoder encoder) {
		this.userRepository = userRepository;
		this.profesorService = profesorService;
		this.estudianteService = estudianteService;
		this.encoder = encoder;
	}

	@Transactional
	public User saveUser(User request) {
		User user;
		user = new User();
		user.setUsername(request.getUsername());
		user.setPassword(encoder.encode(request.getPassword())); // encode siempre
		user.setAuthority(request.getAuthority());

		return userRepository.save(user);
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
	public User updateUser(@Valid User user, Integer idToUpdate) {
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

		// Authority / rol
		if (user.getAuthority() != null && !user.getAuthority().equals(toUpdate.getAuthority())) {
			toUpdate.setAuthority(user.getAuthority());
		}

		return userRepository.save(toUpdate);
	}

	@Transactional
	public void deleteUser(Integer id) {
		User toDelete = findUser(id);
		deleteRelations(id, toDelete.getAuthority().getAuthority());
		this.userRepository.delete(toDelete);
	}

	private void deleteRelations(Integer id, String auth) {
		switch (auth) {
		case "PROFESOR":
			Optional<Profesor> profesor = profesorService.findProfesorByUserId(id);
			if (profesor.isPresent())
				profesorService.deleteProfesor(profesor.get().getId());
			this.userRepository.deleteProfesorRelation(id);
			break;
		case "ESTUDIANTE":
			Optional<Estudiante> estudiante = estudianteService.findEstudianteByUserId(id);
			if (estudiante.isPresent()) {
				estudianteService.deleteEstudiante(estudiante.get().getId());
			}
			this.userRepository.deleteEstudianteRelation(id);
			break;
		// default:
		// 	// The only relations that have user are Owner and Vet
		// 	break;
		}

	}

}
