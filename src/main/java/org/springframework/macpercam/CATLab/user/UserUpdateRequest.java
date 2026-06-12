package org.springframework.macpercam.CATLab.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private String username;
    private String password;
    private Authorities authority;

    private String name;
    private String surname;
    private String email;
}
