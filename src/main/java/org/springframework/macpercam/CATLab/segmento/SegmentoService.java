package org.springframework.macpercam.CATLab.segmento;

import java.io.InputStream;
import java.text.BreakIterator;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.macpercam.CATLab.proyecto.Documento;
import org.springframework.macpercam.CATLab.proyecto.Proyecto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SegmentoService {

    private final SegmentoRepository segmentoRepository;

    @Autowired
    public SegmentoService(SegmentoRepository segmentoRepository) {
        this.segmentoRepository = segmentoRepository;
    }

// #region PDF
    public void generarSegmentos(MultipartFile file, Proyecto proyecto) throws Exception {
        String codigoIdioma = proyecto.getIdiomaOrigen().getCodigo(); 
        Locale locale = Locale.forLanguageTag(codigoIdioma);

        String texto = extraerTextoDePDf(file);
        List<String> frases = separarEnFrases(texto, locale);

        List<Segmento> segmentos = frases.stream().map(f -> {
            Segmento s = new Segmento();
            s.setTextoOriginal(f);
            s.setEstado(EstadoSegmento.BORRADOR);
            s.setProyecto(proyecto);
            return s;
        }).toList();

        segmentoRepository.saveAll(segmentos);
    }

    private String extraerTextoDePDf(MultipartFile file) throws Exception {
        try (PDDocument documento = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(documento);
        }
    }

    private List<String> separarEnFrases(String text, Locale locale) {
        List<String> sentences = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return sentences;
        }

        // 1. Unir únicamente palabras partidas por guion al final de línea
        String textoLimpio = text.replaceAll("(?<=\\w)-\\r?\\n(?=\\w)", "");

        // 2. Separar por puntuación (. ! ?) O por cualquier salto de línea
        String[] partes = textoLimpio.split("(?<=[.!?])\\s+|[\\r\\n]+");

        for (String parte : partes) {
            String frase = parte.trim().replaceAll(" +", " ");
            if (!frase.isEmpty()) {
                sentences.add(frase);
            }
        }

        return sentences;
    }
// #endregion PDF
// #region CRUD
    // #region R
    public List<Segmento> findAll() {
        return (List<Segmento>) segmentoRepository.findAll();
    }

    public List<Segmento> findByProyectoId(Integer proyectoId) {
        return segmentoRepository.findByProyectoId(proyectoId);
    }

    public Segmento findById(Integer id) {
        return segmentoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Segmento", "ID", id));
    }
    // #endregion R
// #endregion CRUD
}
