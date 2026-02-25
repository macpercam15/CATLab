package org.springframework.macpercam.CATLab.estudiante;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EstudianteUpdateDTO {
    private String firstName;
    private String lastName;
    private String dni;
    private Integer phoneNumber;

}
