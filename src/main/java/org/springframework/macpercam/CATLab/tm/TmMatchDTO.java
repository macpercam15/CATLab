package org.springframework.macpercam.CATLab.tm;

import java.time.LocalDateTime;
import java.util.List;

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
    private String originalTarget;
    private int matchPercentage;
    private String matchType;
    private boolean placeablesAdapted;
    private boolean placeableWarning;
    private int usoCount;
    private LocalDateTime ultimaActualizacion;
    private List<DiffPart> diff;


    @Getter
    @Setter
    @AllArgsConstructor 
    @NoArgsConstructor 
    public static class DiffPart {

        private String text;
        private String type;
        private boolean spaceBefore;
    }

}
