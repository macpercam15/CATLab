package org.springframework.macpercam.CATLab.auth.payload.request;

import jakarta.validation.constraints.NotBlank;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
	
	// User
	@NotBlank
	private String username;
	
	@NotBlank
	private String authority;

	@NotBlank
	private String password;
	
	//Both
	@NotBlank
	private String name;
	
	@NotBlank
	private String surname;

	@NotBlank
	private String dni;

	private String address;
	private String telephone;

}
