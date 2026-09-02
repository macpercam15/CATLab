// package org.springframework.macpercam.CATLab.proyecto;

// import static org.junit.jupiter.api.Assertions.assertThrows;
// import static org.mockito.Mockito.mock;
// import static org.mockito.Mockito.when;

// import java.util.Optional;

// import org.junit.jupiter.api.Test;
// import org.springframework.macpercam.CATLab.estudiante.Estudiante;
// import org.springframework.macpercam.CATLab.estudiante.EstudianteRepository;
// import org.springframework.macpercam.CATLab.proyecto.idioma.Idioma;
// import org.springframework.macpercam.CATLab.proyecto.idioma.IdiomaRepository;
// import org.springframework.mock.web.MockMultipartFile;

// class ProyectoServiceTest {

//     @Test
//     void saveRejectsNonPdfFile() {
//         ProyectoRepository proyectoRepository = mock(ProyectoRepository.class);
//         IdiomaRepository idiomaRepository = mock(IdiomaRepository.class);
//         EstudianteRepository estudianteRepository = mock(EstudianteRepository.class);

//         Idioma origen = new Idioma();
//         Idioma destino = new Idioma();
//         Estudiante estudiante = new Estudiante();

//         when(idiomaRepository.findById(1)).thenReturn(Optional.of(origen));
//         when(idiomaRepository.findById(2)).thenReturn(Optional.of(destino));
//         when(estudianteRepository.findByUsername("alumno")).thenReturn(Optional.of(estudiante));

//         ProyectoService proyectoService = new ProyectoService(proyectoRepository, idiomaRepository, estudianteRepository);

//         SaveProyectoDTO proyecto = new SaveProyectoDTO();
//         proyecto.setName("Proyecto demo");
//         proyecto.setIdiomaOrigen_id(1);
//         proyecto.setIdiomaDestino_id(2);

//         MockMultipartFile file = new MockMultipartFile(
//                 "file",
//                 "documento.txt",
//                 "text/plain",
//                 "contenido no pdf".getBytes()
//         );

//         assertThrows(IllegalArgumentException.class, () -> proyectoService.save(proyecto, file, "alumno"));
//     }
// }
