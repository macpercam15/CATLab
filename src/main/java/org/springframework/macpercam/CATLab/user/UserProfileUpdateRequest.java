package org.springframework.macpercam.CATLab.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequest {

	@NotBlank
	private String name;

	@NotBlank
	private String surname;

	private String password;
}
