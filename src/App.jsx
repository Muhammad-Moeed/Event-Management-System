import { useRoutes } from 'react-router-dom';
import routes from './routes/index.jsx'
import Layout from './layout/Layout.jsx';

function App() {
  const routing = useRoutes(
    routes.map(route => ({
      ...route,
      element: route.layout === false
        ? route.element
        : <Layout>{route.element}</Layout>
    }))
  );

  return routing;
}

export default App;
