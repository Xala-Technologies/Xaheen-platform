




import React from 'react';
import { 
  Card,
  Button,
  Input,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Stack,
  Grid,
  Container,
  Typography,
  Box,
  Separator,
} from '@xaheen-ai/design-system';

                Dashboard
                
              </Typography>
            </Stack>
            
            <Stack direction="horizontal" align="center" spacing="4">
              {/* Search - Enhanced 8pt Grid System */}
              <Box variant="search-container">
                "Søk..."
                  aria-label="Søk i dashboard"
                />
              </Box>
              
              {/* Icon Buttons - WCAG compliant sizing */}
              <Button 
                variant="ghost" 
                size="icon"
                aria-label="Varsler"
              >
                "Innstillinger"
              >
                BN</AvatarFallback>
              </Avatar>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Separator />

      {/* Main Content - Enhanced 8pt Grid System */}
      <Box variant="main" spacing="16">
        <Container>
          {/* Stats Grid - Professional sizing standards */}
          <Grid columns="responsive" spacing="6" marginBottom="16">
            {/* Total Users Card */}
            <Card variant="elevated" spacing="8">
              <Stack direction="horizontal" justify="between" align="center" marginBottom="4">
                <Typography variant="label" size="sm">
                  
                  Totale Brukere
                  
                </Typography>
                2,847
                </Typography>
                <Typography variant="caption" size="xs" color="muted">
                  
                  +12% fra forrige måned
                  
                </Typography>
              </Stack>
            </Card>

            {/* Revenue Card */}
            <Card variant="elevated" spacing="8">
              <Stack direction="horizontal" justify="between" align="center" marginBottom="4">
                <Typography variant="label" size="sm">
                  
                  Inntekt
                  
                </Typography>
                
                  kr 125,430
                  
                </Typography>
                <Typography variant="caption" size="xs" color="muted">
                  
                  +8% fra forrige måned
                  
                </Typography>
              </Stack>
            </Card>

            {/* Growth Card */}
            <Card variant="elevated" spacing="8">
              <Stack direction="horizontal" justify="between" align="center" marginBottom="4">
                <Typography variant="label" size="sm">
                  
                  Vekst
                  
                </Typography>
                12.5%
                </Typography>
                <Typography variant="caption" size="xs" color="muted">
                  
                  +2% fra forrige måned
                  
                </Typography>
              </Stack>
            </Card>

            {/* Activity Card */}
            <Card variant="elevated" spacing="8">
              <Stack direction="horizontal" justify="between" align="center" marginBottom="4">
                <Typography variant="label" size="sm">
                  
                  Aktivitet
                  
                </Typography>
                89%
                </Typography>
                <Typography variant="caption" size="xs" color="muted">
                  
                  +5% fra forrige måned
                  
                </Typography>
              </Stack>
            </Card>
          </Grid>

          {/* Content Grid - Enhanced layout system */}
          <Grid columns="responsive" spacing="6">
            {/* Recent Activity */}
            <Box gridColumn=}}}}>
              <Card variant="elevated" spacing="8">
                <Stack direction="horizontal" justify="between" align="center" marginBottom="6">
                  <Stack spacing="2">
                    <Typography variant="heading" size="lg">
                      
                      Nylig Aktivitet
                      
                    </Typography>
                    <Typography variant="body" size="sm" color="muted">
                      
                      Siste handlinger i systemet
                      
                    </Typography>
                  </Stack>
                  <Button size="sm">
                    
                    Se alle
                    
                  </Button>
                </Stack>
                
                <Stack spacing="4">
                  
                  {/* Sample activity items */}
                  <Stack direction="horizontal" align="center" spacing="4">
                    <Avatar size="sm">
                      <AvatarFallback>ON</AvatarFallback>
                    </Avatar>
                    <Stack spacing="1" flex="1">
                      <Typography variant="body" size="sm" weight="medium">Ola Nordmann</Typography>
                      <Typography variant="body" size="sm" color="muted">opprettet ny bruker</Typography>
                    </Stack>
                    <Typography variant="caption" size="xs" color="muted">5 min siden</Typography>
                  </Stack>
                  
                  <Stack direction="horizontal" align="center" spacing="4">
                    <Avatar size="sm">
                      <AvatarFallback>KH</AvatarFallback>
                    </Avatar>
                    <Stack spacing="1" flex="1">
                      <Typography variant="body" size="sm" weight="medium">Kari Hansen</Typography>
                      <Typography variant="body" size="sm" color="muted">oppdaterte profil</Typography>
                    </Stack>
                    <Typography variant="caption" size="xs" color="muted">15 min siden</Typography>
                  </Stack>
                  
                </Stack>
              </Card>
            </Box>

            {/* Quick Actions */}
            <Card variant="elevated" spacing="8">
              <Stack spacing="6">
                <Stack spacing="2">
                  <Typography variant="heading" size="lg">
                    
                    Hurtighandlinger
                    
                  </Typography>
                  <Typography variant="body" size="sm" color="muted">
                    
                    Vanlige oppgaver
                    
                  </Typography>
                </Stack>
                
                <Stack spacing="3">
                  <Button variant="primary" size="md" fullWidth justify="start">
                    
                    Legg til bruker
                    
                  </Button>
                  
                  <Button variant="outline" size="md" fullWidth justify="start">
                    
                    Se rapporter
                    
                  </Button>
                  
                  <Button variant="outline" size="md" fullWidth justify="start">
                    
                    Innstillinger
                    
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}


// Example usage:
/*
// Basic dashboard
< />

// Dashboard with Norwegian localization
< 
  locale="nb"
/>

// Dashboard with real-time data
< 
  enableRealtime={true}
  refreshInterval={30000}
/>

// Dashboard with custom refresh interval
< 
  locale="nb"
  enableRealtime={true}
  refreshInterval={60000}
/>
*/

