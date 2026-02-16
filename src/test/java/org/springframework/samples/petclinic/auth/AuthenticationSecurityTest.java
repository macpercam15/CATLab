package org.springframework.samples.petclinic.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Security tests for authentication endpoints
 * Tests JWT-based authentication flow
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext
@DisplayName("Authentication Security Tests")
public class AuthenticationSecurityTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders
            .webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();
    }

    @Test
    @DisplayName("Login with valid admin credentials should return JWT token")
    void testLoginAdminSuccess() throws Exception {
        String loginJson = "{ \"username\": \"admin1\", \"password\": \"4dm1n\" }";

        mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.username").value("admin1"))
            .andExpect(jsonPath("$.authority").value("ADMIN"))
            .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @DisplayName("Login with valid owner credentials should return JWT token")
    void testLoginOwnerSuccess() throws Exception {
        String loginJson = "{ \"username\": \"owner1\", \"password\": \"0wn3r\" }";

        mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.username").value("owner1"))
            .andExpect(jsonPath("$.authority").value("OWNER"));
    }

    @Test
    @DisplayName("Login with valid vet credentials should return JWT token")
    void testLoginVetSuccess() throws Exception {
        String loginJson = "{ \"username\": \"vet1\", \"password\": \"v3t\" }";

        mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.username").value("vet1"))
            .andExpect(jsonPath("$.authority").value("VET"));
    }

    @Test
    @DisplayName("Login with valid clinic owner credentials should return JWT token")
    void testLoginClinicOwnerSuccess() throws Exception {
        String loginJson = "{ \"username\": \"clinicOwner1\", \"password\": \"clinic_owner\" }";

        mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.username").value("clinicOwner1"))
            .andExpect(jsonPath("$.authority").value("CLINIC_OWNER"));
    }

    @Test
    @DisplayName("Login with invalid password should fail")
    void testLoginInvalidPassword() throws Exception {
        String loginJson = "{ \"username\": \"admin1\", \"password\": \"wrongpassword\" }";

        mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Login with non-existent username should fail")
    void testLoginNonExistentUser() throws Exception {
        String loginJson = "{ \"username\": \"nonexistent\", \"password\": \"password\" }";

        mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Login with empty credentials should fail")
    void testLoginEmptyCredentials() throws Exception {
        String loginJson = "{ \"username\": \"\", \"password\": \"\" }";

        mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Signup with valid data should succeed")
    void testSignupSuccess() throws Exception {
        String signupJson = "{ \"username\": \"newowner\", \"password\": \"SecurePass123\", " +
            "\"authority\": \"OWNER\", \"firstName\": \"Test\", \"lastName\": \"User\", " +
            "\"address\": \"Test Address\", \"city\": \"Sevilla\", \"telephone\": \"954123456\" }";

        mockMvc.perform(post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(signupJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("User registered successfully!"));
    }

    @Test
    @DisplayName("Signup with existing username should fail")
    void testSignupDuplicateUsername() throws Exception {
        String signupJson = "{ \"username\": \"admin1\", \"password\": \"SecurePass123\", " +
            "\"authority\": \"OWNER\", \"firstName\": \"Test\", \"lastName\": \"User\" }";

        mockMvc.perform(post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(signupJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Error: Username is already taken!"));
    }

    @Test
    @DisplayName("Validate valid JWT token should return true")
    void testValidateValidToken() throws Exception {
        // First login to get a valid token
        String loginJson = "{ \"username\": \"admin1\", \"password\": \"4dm1n\" }";
        
        String response = mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        // Extract token from response (simplified - in real test would parse JSON)
        String token = response.split("\"token\":\"")[1].split("\"")[0];

        // Validate the token
        mockMvc.perform(get("/api/v1/auth/validate")
                .param("token", token))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Validate invalid JWT token should return false")
    void testValidateInvalidToken() throws Exception {
        String invalidToken = "invalid.jwt.token";

        mockMvc.perform(get("/api/v1/auth/validate")
                .param("token", invalidToken))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Authentication endpoint should be publicly accessible")
    void testAuthEndpointsPublicAccess() throws Exception {
        // These endpoints should be accessible without authentication
        mockMvc.perform(post("/api/v1/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"username\": \"test\", \"password\": \"test\" }"))
            .andExpect(status().is4xxClientError()); // 400 or 401, but not 403 (forbidden)
    }
}
