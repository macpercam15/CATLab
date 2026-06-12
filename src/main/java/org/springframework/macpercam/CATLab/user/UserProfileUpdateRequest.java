package org.springframework.macpercam.CATLab.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequest {

	private String firstName;

	private String lastName;

	private String email;

	private String username;

	private String password;
}
