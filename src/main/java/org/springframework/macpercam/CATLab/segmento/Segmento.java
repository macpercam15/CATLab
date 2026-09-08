package org.springframework.macpercam.CATLab.segmento;

import org.springframework.macpercam.CATLab.model.BaseEntity;
import org.springframework.macpercam.CATLab.proyecto.Proyecto;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "segmentos")
public class Segmento extends BaseEntity{

    @Column(columnDefinition = "TEXT")
    private String textoOriginal;

    @Column(columnDefinition = "TEXT")
    private String textoTraducido;

    private EstadoSegmento estado;

    private String feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id")
    private Proyecto proyecto;

}
