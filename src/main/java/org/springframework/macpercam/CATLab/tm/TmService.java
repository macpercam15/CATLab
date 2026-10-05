package org.springframework.macpercam.CATLab.tm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service 
public class TmService {

    private TmRepository tmrepo;

    @Autowired 
    public TmService(TmRepository tmrepo) {
        this.tmrepo = tmrepo;
    }

}
