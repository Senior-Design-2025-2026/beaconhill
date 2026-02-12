import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import { LineGraph } from './components/Line.js';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Function to call the API
async function callApi() {
  try {
    // Fetch the authentication session from Amplify authentication service
    const session = await fetchAuthSession();
    // Get the ID token from the session
    const token = session.tokens.idToken;

    // Make the API call to the API Gateway
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

    // If the response body is an object, parse it as JSON
    if (response.body && typeof response.body === 'object') {
      const actualData = await response.body.json();
      
      // Get the array in the body that is to be returned
      const items = (() => {
        // If the actual data is an array, return it
        if (Array.isArray(actualData)) return actualData;
        // If the actual data is an object, return the body
        if (actualData?.body != null) {
          const b = actualData.body;
          // If the body is a string, parse it as JSON
          return typeof b === 'string' ? JSON.parse(b) : b;
        }
        return actualData;
      })();
      console.log("Success! Farm data array:", items);
      return items;
    }

    return response;
  } catch (error) {
    console.error('GET call failed: ', error);
  }
}

Amplify.configure(awsconfig);

// The app that is displayed after the user is authenticated
function AuthenticatedApp({ signOut, user }) {
  // Storing the data from the API call
  const [apiData, setApiData] = useState(null);

  // Function to get the data from the API
  const handleFetchData = async () => {
    // Calling the API
    const result = await callApi();
    setApiData(result);
  };

  // Call the API once when the component is mounted
  useEffect(() => {
    handleFetchData();
  }, []);

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
        <button onClick={handleFetchData} style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}>
          Call secure API
        </button>
        <button onClick={signOut} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
          Sign out
        </button>
      </header>

      {/* Display the line graph */}
      <div>
        <LineGraph data={apiData} />
      </div>
    </div>
  );
}

// Calls the Authenticator component built-in by Amplify
function App() {
  return (
    // Calls the AuthenticatedApp component with the signOut and user props
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => <AuthenticatedApp signOut={signOut} user={user} />}
    </Authenticator>
  );
}

export default App;
