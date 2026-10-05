package org.springframework.macpercam.CATLab.proyecto;

import org.springframework.macpercam.CATLab.tm.Tm;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaveProyectoDTO {
    private String name;
    private Integer idiomaOrigen_id;
    private Integer idiomaDestino_id;
    private Integer tm_id;

}
