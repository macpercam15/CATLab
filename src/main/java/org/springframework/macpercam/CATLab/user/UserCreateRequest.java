package org.springframework.macpercam.CATLab.user;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest {
    @NotEmpty(message = "Username is required to create a user.")
    private String username;
    private String password;
    @NotNull(message = "Authority is required to create a user.")
    private Authorities authority;

    @NotEmpty(message = "Name is required to create a user.")
    private String name;
    @NotEmpty(message = "Surname is required to create a user.")
    private String surname;
    @NotEmpty(message = "Email is required to create a user.")
    private String email;
}
