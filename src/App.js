import logo from './logo.svg';
import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports.json';
import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { isTestMode } from './config';
import { createMockItem, getInitialMockItems } from './mockData';
import { useState } from 'react';

Amplify.configure(awsconfig);

async function callSecureApi() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens.idToken;

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

const MOCK_USER = {
  username: 'test-user',
  signInDetails: { loginId: 'test@example.com' },
};

function AuthenticatedApp({ signOut, user, useMockData, mockItems, onAddMockItem }) {
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

        {useMockData ? (
          <>
            <button
              type="button"
              onClick={onAddMockItem}
              className="mock-data-button"
              style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}
            >
              Add mock item (local only)
            </button>
            {mockItems.length > 0 && (
              <ul style={{ marginTop: '16px', textAlign: 'left', listStyle: 'none' }}>
                {mockItems.map((item) => (
                  <li key={item.id} style={{ marginBottom: '8px' }}>
                    <code>{JSON.stringify(item)}</code>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={callSecureApi}
            style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}
          >
            Call secure API
          </button>
        )}

        {!useMockData && (
          <button
            type="button"
            onClick={signOut}
            style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
          >
            Sign out
          </button>
        )}
      </header>
    </div>
  );
}

function App() {
  const [mockItems, setMockItems] = useState(getInitialMockItems);

  const addMockItem = () => {
    setMockItems((prev) => [...prev, createMockItem()]);
  };

  if (isTestMode) {
    return (
      <AuthenticatedApp
        signOut={() => {}}
        user={MOCK_USER}
        useMockData
        mockItems={mockItems}
        onAddMockItem={addMockItem}
      />
    );
  }

  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <AuthenticatedApp
          signOut={signOut}
          user={user}
          mockItems={[]}
          onAddMockItem={() => {}}
        />
      )}
    </Authenticator>
  );
}

export default App;
