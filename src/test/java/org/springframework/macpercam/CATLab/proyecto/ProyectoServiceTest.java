package org.springframework.macpercam.CATLab.proyecto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.macpercam.CATLab.estudiante.EstudianteRepository;
import org.springframework.macpercam.CATLab.glosario.GlosarioRepository;
import org.springframework.macpercam.CATLab.proyecto.idioma.IdiomaRepository;
import org.springframework.mock.web.MockMultipartFile;

class ProyectoServiceTest {

	@Test
	void saveRejectsNonPdfFile() {
		ProyectoRepository proyectoRepository = mock(ProyectoRepository.class);
		IdiomaRepository idiomaRepository = mock(IdiomaRepository.class);
		EstudianteRepository estudianteRepository = mock(EstudianteRepository.class);
		GlosarioRepository glosarioRepository = mock(GlosarioRepository.class);

		ProyectoService proyectoService = new ProyectoService(
				proyectoRepository,
				idiomaRepository,
				estudianteRepository,
				glosarioRepository
		);

		SaveProyectoDTO proyecto = new SaveProyectoDTO();
		proyecto.setName("Proyecto demo");
		proyecto.setIdiomaOrigen_id(1);
		proyecto.setIdiomaDestino_id(2);

		MockMultipartFile file = new MockMultipartFile(
				"file",
				"documento.txt",
				"text/plain",
				"contenido no pdf".getBytes()
		);

		assertThrows(IllegalArgumentException.class, () -> proyectoService.save(proyecto, file, "alumno"));
	}

	@Test
	void getProyectosProfesorIncludesCorrectedProjects() {
		ProyectoRepository proyectoRepository = mock(ProyectoRepository.class);
		IdiomaRepository idiomaRepository = mock(IdiomaRepository.class);
		EstudianteRepository estudianteRepository = mock(EstudianteRepository.class);
		GlosarioRepository glosarioRepository = mock(GlosarioRepository.class);

		Proyecto published = new Proyecto();
		published.setEstado(EstadoProyecto.PUBLICADO);

		Proyecto corrected = new Proyecto();
		corrected.setEstado(EstadoProyecto.CORREGIDO);

		Proyecto draft = new Proyecto();
		draft.setEstado(EstadoProyecto.BORRADOR);

		when(proyectoRepository.findAll()).thenReturn(List.of(published, corrected, draft));

		ProyectoService proyectoService = new ProyectoService(
				proyectoRepository,
				idiomaRepository,
				estudianteRepository,
				glosarioRepository
		);

		List<Proyecto> proyectosProfesor = proyectoService.getProyectosProfesor();

		assertEquals(2, proyectosProfesor.size());
		assertEquals(EstadoProyecto.PUBLICADO, proyectosProfesor.get(0).getEstado());
		assertEquals(EstadoProyecto.CORREGIDO, proyectosProfesor.get(1).getEstado());
	}
}
