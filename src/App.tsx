import React from 'react';
import createStore from './store';
import { Provider } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import Wrapper from './components/Wrapper';
import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import Dashboard from './components/Dashboard/Dashboard';

const GRAPHQL_ENDPOINT = 'ws://react.eogresources.com/graphql';

const wsLink = new WebSocketLink({
  uri: GRAPHQL_ENDPOINT,
  options: {
    reconnect: true,
  },
});

const httpLink = new HttpLink({
  uri: 'https://react.eogresources.com/graphql',
});
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
);
export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([splitLink]),
});

const store = createStore();
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#37588a',
      // main: '#273142',
      light:'#03A9F4'
    },
    secondary: {
      main: '#E91E63',
      light: '#c5d0de'
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Wrapper>
          <Dashboard />
        </Wrapper>
      </ApolloProvider>
    </Provider>
  </MuiThemeProvider>
);

export default App;
