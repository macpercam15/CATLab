package org.springframework.macpercam.CATLab.administrador;

import java.util.Collection;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.macpercam.CATLab.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class AdministradorService {

    private AdministradorRepository pr;

    @Autowired
    public AdministradorService(AdministradorRepository pr) {
        this.pr = pr;
    }
        
    @Transactional(readOnly = true)
    public Iterable<Administrador> findAll() throws DataAccessException {
        return pr.findAll();
    }

    @Transactional(readOnly = true)
    public Collection<Administrador> findAdministradorByFirstName(String firstName) throws DataAccessException {
        return pr.findByFirstName(firstName);
    }

    @Transactional(readOnly = true)
    public Administrador findAdministradorById(int id) throws DataAccessException {
        return pr.findById(id).orElseThrow(() -> new ResourceNotFoundException("Administrador", "ID", id));
    }

    @Transactional(readOnly = true)
    public Optional<Administrador> findAdministradorByUserId(int userId) throws DataAccessException {
        return pr.findByUser(userId);
    }

    @Transactional
	public Administrador saveAdministrador(Administrador administrador) throws DataAccessException {
		pr.save(administrador);
		return administrador;
	}

	@Transactional
	public void deleteAdministradorByUser(int userId) throws DataAccessException {
		Optional<Administrador> toDelete = findAdministradorByUserId(userId);
		if (toDelete.isPresent()) {
			pr.delete(toDelete.get());
		} else {
            throw new ResourceNotFoundException("Administrador", "User ID", userId);
        }
	}
    
}
