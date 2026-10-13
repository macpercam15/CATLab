package org.springframework.macpercam.CATLab.tm;

import java.time.LocalDateTime;

import org.springframework.macpercam.CATLab.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Getter 
@Setter 
@Table (name = "tu")
public class Tu extends BaseEntity{
    
    @Column(columnDefinition = "TEXT")
    String origen;
    
    @Column(columnDefinition = "TEXT")
    String destino;

    @ManyToOne
    @JoinColumn (name = "tm_id", referencedColumnName = "id")
    Tm tm;

    @Column(name = "uso_count")
    Integer usoCount = 0;

    @Column(name = "ultima_actualizacion")
    LocalDateTime ultimaActualizacion;

    @PrePersist 
    void prePersist() {
        if (usoCount == null)  usoCount = 0;
        if (ultimaActualizacion == null) ultimaActualizacion = LocalDateTime.now();  
    }
}
