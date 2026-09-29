package org.springframework.macpercam.CATLab.glosario;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaveEntradaDTO {
    @NotEmpty
    private String origen;
    @NotEmpty
    private String destino;
    @NotEmpty
    private Integer proyectoId;

}
