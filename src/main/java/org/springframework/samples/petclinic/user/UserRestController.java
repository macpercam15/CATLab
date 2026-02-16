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
package org.springframework.samples.petclinic.user;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.samples.petclinic.auth.payload.response.MessageResponse;
import org.springframework.samples.petclinic.exceptions.AccessDeniedException;
import org.springframework.samples.petclinic.util.RestPreconditions;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/users")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Users", description = "User management API - Requires ADMIN role")
class UserRestController {

	private final UserService userService;
	private final AuthoritiesService authService;

	@Autowired
	public UserRestController(UserService userService, AuthoritiesService authService) {
		this.userService = userService;
		this.authService = authService;
	}

	@Operation(summary = "List all users", description = "Get all users or filter by authority/role. Requires ADMIN role.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Successfully retrieved list of users"),
		@ApiResponse(responseCode = "401", description = "Not authenticated"),
		@ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
	})
	@GetMapping
	public ResponseEntity<List<User>> findAll(
		@Parameter(description = "Filter by authority (ADMIN, CLINIC_OWNER, OWNER, VET)")
		@RequestParam(required = false) String auth) {
		List<User> res;
		if (auth != null) {
			res = (List<User>) userService.findAllByAuthority(auth);
		} else
			res = (List<User>) userService.findAll();
		return new ResponseEntity<>(res, HttpStatus.OK);
	}

	@Operation(summary = "List all authorities", description = "Get all available user roles/authorities. Requires ADMIN role.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "Successfully retrieved list of authorities"),
		@ApiResponse(responseCode = "401", description = "Not authenticated"),
		@ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
	})
	@GetMapping("authorities")
	public ResponseEntity<List<Authorities>> findAllAuths() {
		List<Authorities> res = (List<Authorities>) authService.findAll();
		return new ResponseEntity<>(res, HttpStatus.OK);
	}

	@Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID. Requires ADMIN role.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "User found"),
		@ApiResponse(responseCode = "401", description = "Not authenticated"),
		@ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required"),
		@ApiResponse(responseCode = "404", description = "User not found")
	})
	@GetMapping(value = "{id}")
	public ResponseEntity<User> findById(
		@Parameter(description = "User ID", required = true)
		@PathVariable("id") Integer id) {
		return new ResponseEntity<>(userService.findUser(id), HttpStatus.OK);
	}

	@Operation(summary = "Create new user", description = "Create a new user in the system. Requires ADMIN role.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "201", description = "User created successfully",
			content = @Content(schema = @Schema(implementation = User.class))),
		@ApiResponse(responseCode = "400", description = "Invalid user data"),
		@ApiResponse(responseCode = "401", description = "Not authenticated"),
		@ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required"),
		@ApiResponse(responseCode = "409", description = "Username already exists")
	})
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ResponseEntity<User> create(
		@Parameter(description = "User to create", required = true)
		@RequestBody @Valid User user) {
		User savedUser = userService.saveUser(user);
		return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
	}

	@Operation(summary = "Update user", description = "Update an existing user's information. Requires ADMIN role.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "User updated successfully",
			content = @Content(schema = @Schema(implementation = User.class))),
		@ApiResponse(responseCode = "400", description = "Invalid user data"),
		@ApiResponse(responseCode = "401", description = "Not authenticated"),
		@ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required"),
		@ApiResponse(responseCode = "404", description = "User not found")
	})
	@PutMapping(value = "{userId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<User> update(
		@Parameter(description = "User ID to update", required = true)
		@PathVariable("userId") Integer id,
		@Parameter(description = "Updated user data", required = true)
		@RequestBody @Valid User user) {
		RestPreconditions.checkNotNull(userService.findUser(id), "User", "ID", id);
		return new ResponseEntity<>(this.userService.updateUser(user, id), HttpStatus.OK);
	}

	@Operation(summary = "Delete user", description = "Delete a user from the system. Cannot delete yourself. Requires ADMIN role.")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "User deleted successfully",
			content = @Content(schema = @Schema(implementation = MessageResponse.class))),
		@ApiResponse(responseCode = "401", description = "Not authenticated"),
		@ApiResponse(responseCode = "403", description = "Access denied - Cannot delete yourself or ADMIN role required"),
		@ApiResponse(responseCode = "404", description = "User not found")
	})
	@DeleteMapping(value = "{userId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<MessageResponse> delete(
		@Parameter(description = "User ID to delete", required = true)
		@PathVariable("userId") int id) {
		RestPreconditions.checkNotNull(userService.findUser(id), "User", "ID", id);
		if (userService.findCurrentUser().getId() != id) {
			userService.deleteUser(id);
			return new ResponseEntity<>(new MessageResponse("User deleted!"), HttpStatus.OK);
		} else
			throw new AccessDeniedException("You can't delete yourself!");
	}

}
