import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { styled } from '@mui/material/styles';
import hero from '../assets/hero.png';

const StyledBox = styled('div')(({ theme }) => ({
  alignSelf: 'center',
  width: '100%',
  height: 400,
  marginTop: theme.spacing(8),
  borderRadius: (theme.vars || theme).shape.borderRadius,
  outline: '6px solid',
  outlineColor: 'hsla(220, 25%, 80%, 0.2)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.grey[200],
  boxShadow: '0 0 12px 8px hsla(220, 25%, 80%, 0.2)',
  backgroundImage: `url(${hero})`,
  backgroundSize: 'cover',
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(10),
    height: 700,
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 24px 12px hsla(210, 100%, 25%, 0.2)',
    outlineColor: 'hsla(220, 20%, 42%, 0.1)',
    borderColor: (theme.vars || theme).palette.grey[700],
  }),
}));

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)',
        ...theme.applyStyles('dark', {
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
        }),
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%' } }}
        >
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
              textAlign: 'center',
            }}
          >
            All&nbsp;
            <Typography
  component="span"
  variant="h1"
  sx={{
    fontSize: 'inherit',
    color: '#f3aa02',
  }}
>
  Events
</Typography>

            &nbsp;Se Knowledge Brhao
          </Typography>

          <Typography
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
            }}
          >
            Bina mushkilat ke hasil karein faiz-free qarza chand asaan steps mein.
            Aapka bharosa, hamari zimmedari. Sirf CNIC number se shuruat karein.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: '100%', sm: '400px' } }}
          >
            <InputLabel htmlFor="cnic-hero" sx={visuallyHidden}>
              CNIC Number
            </InputLabel>
            <TextField
              id="cnic-hero"
              hiddenLabel
              size="small"
              variant="outlined"
              aria-label="Enter your CNIC number"
              placeholder="Apna CNIC Number daalein"
              fullWidth
              slotProps={{
                htmlInput: {
                  autoComplete: 'off',
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  'aria-label': 'Enter your CNIC number',
                },
              }}
            />
            <Button
  variant="contained"
  size="small"
  sx={{
    minWidth: 'fit-content',
    whiteSpace: 'nowrap',
    backgroundColor: 'black',
    color: '#e09c00',
    '&:hover': {
      backgroundColor: 'black',
    },
  }}
>
  Event Start
</Button>

          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            Qarza shuru karne par aap hamari&nbsp;
            <Link href="#" color="primary">
              Shara'it o Zawabit
            </Link>
            &nbsp;se ittifaq karte hain.
          </Typography>

          <Typography
            variant="caption"
            color="success.main"
            sx={{ textAlign: 'center', fontWeight: 500 }}
          >
            100% Shariah Compliant | Approved by Muhammad Moeed
          </Typography>
        </Stack>

        <StyledBox id="image" />
      </Container>
    </Box>
  );
}
