package org.springframework.macpercam.CATLab.tm;

import org.springframework.macpercam.CATLab.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

}
