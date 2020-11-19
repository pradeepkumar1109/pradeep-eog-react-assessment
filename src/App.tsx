import React from 'react';
import createStore from './store';
import { Provider } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import Wrapper from './components/Wrapper';
import Dashboard from './components/Dashboard/Dashboard'
import { ApolloClient } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { onError } from 'apollo-link-error';

//websocket link
const wsLink = new WebSocketLink({
  uri: 'ws://react.eogresources.com/graphql',
  options: {
    //reconnect ws if possible
    reconnect: true,
  },
});

//http request link
const httpLink = new HttpLink({
  uri: 'https://react.eogresources.com/graphql',
});

let link = ApolloLink.from([
  //error handling
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
      );
    }
    if (networkError) console.error(`[Network error]: ${networkError}`, networkError.stack);
  }),
  ApolloLink.split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink,
  ),
]);


export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
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
