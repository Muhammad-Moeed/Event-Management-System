import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppAppBar from '../UI/AppBar';
import Hero from '../UI/Hero';
import Highlights from '../UI/Highlights';
import Footer from '../UI/Footer';

export default function MarketingPage(props) {
  return (
    <>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Hero />
      <div>
        <Divider />
        <Divider />
        <Highlights />
        <Divider />
        <Footer />
      </div>
    </>
  );
}