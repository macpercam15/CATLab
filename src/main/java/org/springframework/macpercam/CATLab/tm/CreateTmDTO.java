package org.springframework.macpercam.CATLab.tm;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTmDTO {
    private String name;
    private Integer idiomaA_id;
    private Integer idiomaB_id;
}
