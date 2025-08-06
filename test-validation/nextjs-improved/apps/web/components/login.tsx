




import React from 'react';
import { 
  Card,
  Button,
  Input,
  Checkbox,
  Alert,
  Stack,
  Container,
  Typography,
  Box,
  Separator,
} from '@xaheen-ai/design-system';
'E-post er påkrevd';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ugyldig e-postadresse';
    }

    if (!formData.password) {
      errors.password = 'Passord er påkrevd';
    } else if (formData.password.length < 6) {
      errors.password = 'Passord må være minst 6 tegn';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Login attempt:', formData);
      
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Innlogging feilet',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    
            nextjs-improved
            
          </Typography>
          <Typography variant="body" size="lg" color="muted" align="center">
            
            Logg inn på din konto
            
          </Typography>
        </Stack>

        <Card variant="elevated" spacing="10">
          <Stack spacing="6">
            <Stack spacing="2">
              <Typography variant="heading" size="xl">
                
                Velkommen tilbake
                
              </Typography>
              <Typography variant="body" size="sm" color="muted">
                
                Skriv inn dine påloggingsopplysninger
                
              </Typography>
            </Stack>
            
            <Stack spacing="6">
              {/* Error Alert - ONLY semantic components */}
              {error && (
                <Alert variant="destructive" spacing="4">
                  <Stack direction="horizontal" align="center" spacing="3">
                    
                  E-post
                  
                </Typography>
                <Box variant="input-container">
                  "din@epost.no"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    "E-postadresse"
                  />
                </Box>
                
                  Passord
                  
                </Typography>
                <Box variant="input-container">
                  "Skriv inn passord"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    "Passord"
                  />
                  
                  Husk meg
                  
                </Typography>
              </Stack>

              {/* Submit Button */}
              <Button 
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
              >
                
                Logg inn
                
              </Button>

              {/* Forgot Password */}
              <Stack align="center">
                <Button variant="link" size="sm">
                  
                  Glemt passord?
                  
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        
            Har du ikke konto?
            
          </Typography>
          <Button variant="link" size="sm">
            
            Registrer deg
            
          </Button>
        </Stack>
        

        
              Eller fortsett med
              
            </Typography>
          </Stack>

          <Grid columns={2} spacing="4">
            <Button variant="outline" size="lg">
              BankID
            </Button>
            <Button variant="outline" size="lg">
              Vipps
            </Button>
          </Grid>
        </Stack>
        
      </Container>
    </Box>
  );
}


// Example usage:
/*
// Basic login page
< />

// Login with Norwegian authentication
< 
  includeNorwegianAuth={true}
  locale="nb"
/>

// Login with custom authentication
< 
  onLogin={(email, password) => customLogin(email, password)}
  enableValidation={true}
/>
*/

