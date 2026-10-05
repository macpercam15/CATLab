package org.springframework.macpercam.CATLab.proyecto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProyectoDTO {
    private String name;
    private Integer tm_id;
}
