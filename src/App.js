import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './config/aws-exports.json';
import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { isTestMode } from './config';
import { createMockItem, getInitialMockItems } from './data/mockData';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SidebarComponent from './components/SidebarComponent/SidebarComponent';
import LiveDashboardPage from './pages/LiveDashboardPage/LiveDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import ConfigurationPage from './pages/ConfigurationPage/ConfigurationPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

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
    <div className="App App-authenticated-layout">
      <SidebarComponent user={user} />
      <main className="App-main">
        <Routes>
          <Route path="/" element={<LiveDashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        {useMockData && (
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
        )}
        {!useMockData && (
          <>
            <button
              type="button"
              onClick={callSecureApi}
              style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}
            >
              Call secure API
            </button>
            <button
              type="button"
              onClick={signOut}
              style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
            >
              Sign out
            </button>
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  const [mockItems, setMockItems] = useState(getInitialMockItems);

  const addMockItem = () => {
    setMockItems((prev) => [...prev, createMockItem()]);
  };

  const authenticatedContent = isTestMode ? (
    <AuthenticatedApp
      signOut={() => {}}
      user={MOCK_USER}
      useMockData
      mockItems={mockItems}
      onAddMockItem={addMockItem}
    />
  ) : (
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

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {authenticatedContent}
    </BrowserRouter>
  );
}

export default App;
