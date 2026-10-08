package org.springframework.macpercam.CATLab.tm;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor  
public class TmMatchDTO {
    private Integer tuId;
    private String source;
    private String target;

}
