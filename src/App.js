import './App.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './config/aws-exports.json';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { isTestMode } from './config';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SidebarComponent from './components/SidebarComponent/SidebarComponent';
import LiveDashboardPage from './pages/LiveDashboardPage/LiveDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import ConfigurationPage from './pages/ConfigurationPage/ConfigurationPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import TestingPage from './pages/TestingPage/TestingPage';

Amplify.configure(awsconfig);

const MOCK_USER = {
  username: 'test-user',
  signInDetails: { loginId: 'test@example.com' },
};

function AuthenticatedApp({ signOut, user }) {
  return (
    <div className="App App-authenticated-layout">
      <SidebarComponent user={user} />
      <main className="App-main">
        <Routes>
          <Route path="/" element={<LiveDashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/testing" element={<TestingPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const authenticatedContent = isTestMode ? (
    <AuthenticatedApp
      signOut={() => {}}
      user={MOCK_USER}
    />
  ) : (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <AuthenticatedApp
          signOut={signOut}
          user={user}
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
