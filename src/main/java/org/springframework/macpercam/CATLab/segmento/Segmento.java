package org.springframework.macpercam.CATLab.segmento;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.macpercam.CATLab.model.BaseEntity;
import org.springframework.macpercam.CATLab.proyecto.Proyecto;
import org.springframework.macpercam.CATLab.tm.Tu;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @Enumerated(EnumType.STRING)
    private EstadoSegmento estado;

    private String feedback;

    @JsonIgnore 
    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "tu_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Tu tuId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id")
    private Proyecto proyecto;

}
