package org.springframework.macpercam.CATLab.glosario;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class saveEntradaDTO {
    @NotEmpty
    private String origen;
    @NotEmpty
    private String destino;
    @NotEmpty
    private Integer glosarioId;

}
