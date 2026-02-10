import logo from './logo.svg';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

async function callSecureApi() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens.idToken; // The token proving the user is logged in

    const restOperation = get({
      apiName: 'apiGet',
      path: '/items',
      options: {
        headers: {
          Authorization: token.toString() 
        }
      }
    });

    const response = await restOperation.response;

    // If body is an object, the data is already parsed and waiting for you
    if (response.body && typeof response.body === 'object') {
      const actualData = await response.body.json();
      console.log("Success! Farm data array:", actualData);
      return actualData;
    }

    return response;
  } catch (error) {
    console.error('GET call failed: ', error);
  }
}

Amplify.configure(awsconfig);

function AuthenticatedApp({ signOut, user }) {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Welcome, {user?.signInDetails?.loginId || user?.username}!
        </p>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={callSecureApi} style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}>
          Call secure API
        </button>
        <button onClick={signOut} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
          Sign out
        </button>
      </header>
    </div>
  );
}

function App() {
  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => <AuthenticatedApp signOut={signOut} user={user} />}
    </Authenticator>
  );
}

export default App;
