package org.springframework.macpercam.CATLab.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest {
    private String username;
    private String password;
    private Authorities authority;

    private String firstName;
    private String lastName;
    private String email;
}
